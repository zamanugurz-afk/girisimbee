/**
 * Compatibility layer over features/authorization RBAC.
 * AUTHORIZATION STEP 1 — only user | admin | super_admin (+ guest).
 */
import type { UserRole, StoredUserRole } from '@/features/authentication/types/auth.types';
import {
  ROLE_HIERARCHY,
  ROLE_LABELS as APP_ROLE_LABELS,
  ROLE_DISPLAY_LABELS,
  APP_ROLES,
  getRoleLabel,
  normalizeAppRole,
  roleAtLeast,
  type AppRole,
} from '@/features/authorization/roles';
import { hasRole as rbacHasRole } from '@/features/authorization/rbac.service';

export const ROLE_LEVEL: Record<UserRole, number> = {
  guest: ROLE_HIERARCHY.guest,
  user: ROLE_HIERARCHY.user,
  admin: ROLE_HIERARCHY.admin,
  super_admin: ROLE_HIERARCHY.super_admin,
};

export const STORED_ROLES: StoredUserRole[] = [...APP_ROLES];

/** Session-role labels + legacy display names used by dashboard / auth menus. */
export const ROLE_LABELS: Record<string, string> = {
  guest: APP_ROLE_LABELS.guest,
  user: APP_ROLE_LABELS.user,
  member: ROLE_DISPLAY_LABELS.member,
  verified: ROLE_DISPLAY_LABELS.verified,
  company: ROLE_DISPLAY_LABELS.company,
  admin: APP_ROLE_LABELS.admin,
  super_admin: APP_ROLE_LABELS.super_admin,
};

export { getRoleLabel, ROLE_DISPLAY_LABELS };

export function hasMinimumRole(userRole: UserRole, required: UserRole): boolean {
  if (required === 'guest') return true;
  if (userRole === 'guest') return false;
  return roleAtLeast(userRole, required as AppRole);
}

export function hasAnyRole(userRole: UserRole, allowed: UserRole[]): boolean {
  if (userRole === 'guest') return false;
  const appAllowed = allowed.filter((r): r is AppRole => r !== 'guest');
  if (appAllowed.length === 0) return false;
  return rbacHasRole(userRole, appAllowed);
}

export function isStoredRole(value: string): value is StoredUserRole {
  return (APP_ROLES as readonly string[]).includes(value);
}

/** Map any profile.role string (including legacy) to StoredUserRole */
export function coerceStoredRole(value: string | null | undefined): StoredUserRole {
  const result = normalizeAppRole(value);
  if (typeof value === 'string' && /super_?admin/i.test(value) && result !== 'super_admin') {
    // Never allow super_admin → user/member
    return 'super_admin';
  }
  return result;
}
