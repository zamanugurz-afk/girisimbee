import {
  APP_ROLES,
  LEGACY_ROLE_MAP,
  ROLE_DISPLAY_LABELS,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  type AppRole,
  type SessionRole,
} from '@/features/authorization/role.constants';
import {
  canonicalizeRoleKey,
  roleTrace,
} from '@/features/authorization/lib/role-trace';

export type { AppRole, SessionRole };
export { APP_ROLES, ROLE_HIERARCHY, ROLE_LABELS, ROLE_DISPLAY_LABELS, LEGACY_ROLE_MAP };

export function isAppRole(value: string): value is AppRole {
  return (APP_ROLES as readonly string[]).includes(value);
}

function isSuperAdminKey(key: string): boolean {
  return key === 'super_admin' || key === 'superadmin' || key.includes('super_admin');
}

/**
 * Normalize DB / legacy role strings into AppRole (defaults to user).
 * Supports: user | admin | super_admin (+ legacy member/verified/company/moderator aliases).
 * Never maps super_admin → user | member.
 */
export function normalizeAppRole(value: string | null | undefined): AppRole {
  if (value == null || value === '') {
    return 'user';
  }

  const key = canonicalizeRoleKey(String(value));

  // Hard guarantee: super_admin must never become user/member.
  if (isSuperAdminKey(key)) {
    return 'super_admin';
  }

  if (isAppRole(key)) {
    return key;
  }

  const mapped = LEGACY_ROLE_MAP[key];
  if (mapped) {
    if (mapped === 'super_admin' || isSuperAdminKey(mapped)) {
      return 'super_admin';
    }
    roleTrace('normalizeAppRole:legacy', { value, key, result: mapped });
    return mapped;
  }

  roleTrace('normalizeAppRole:unknown→user', { value, key, result: 'user' });
  return 'user';
}

/** Turkish UI label for a stored or legacy role string. */
export function getRoleLabel(value: string | null | undefined): string {
  if (!value) {
    return ROLE_DISPLAY_LABELS.user;
  }
  const key = canonicalizeRoleKey(String(value));
  if (isSuperAdminKey(key)) {
    return ROLE_DISPLAY_LABELS.super_admin;
  }
  return ROLE_DISPLAY_LABELS[key] ?? ROLE_LABELS[normalizeAppRole(key)];
}

export function toSessionRole(value: string | null | undefined): SessionRole {
  if (!value) return 'guest';
  return normalizeAppRole(value);
}

export function roleRank(role: SessionRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

export function roleAtLeast(role: SessionRole, minimum: AppRole): boolean {
  return roleRank(role) >= roleRank(minimum);
}
