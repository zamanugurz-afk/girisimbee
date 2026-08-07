import { ROLE_PERMISSIONS, ROUTE_ROLE_REQUIREMENTS } from '@/features/authorization/permissions';
import type { Permission } from '@/features/authorization/permission.constants';
import {
  normalizeAppRole,
  roleAtLeast,
  type AppRole,
  type SessionRole,
} from '@/features/authorization/roles';

function asSessionRole(role: string | SessionRole | null | undefined): SessionRole {
  if (!role || role === 'guest') return 'guest';
  return normalizeAppRole(role);
}

export function hasRole(
  role: string | SessionRole | null | undefined,
  required: AppRole | AppRole[],
): boolean {
  const current = asSessionRole(role);
  if (current === 'guest') return false;
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.some((r) => current === r || roleAtLeast(current, r));
}

export function hasPermission(
  role: string | SessionRole | null | undefined,
  permission: Permission,
): boolean {
  const current = asSessionRole(role);
  if (current === 'guest') return false;
  return ROLE_PERMISSIONS[current].includes(permission);
}

export function canAccess(
  role: string | SessionRole | null | undefined,
  pathname: string,
): boolean {
  const current = asSessionRole(role);
  for (const rule of ROUTE_ROLE_REQUIREMENTS) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      if (current === 'guest') return false;
      return roleAtLeast(current, rule.minimumRole);
    }
  }
  return true;
}

export function isAdmin(role: string | SessionRole | null | undefined): boolean {
  const current = asSessionRole(role);
  return current === 'admin' || current === 'super_admin';
}

export function isSuperAdmin(role: string | SessionRole | null | undefined): boolean {
  return asSessionRole(role) === 'super_admin';
}

export function isOwner(
  resourceOwnerId: string | null | undefined,
  actorId: string | null | undefined,
): boolean {
  if (!resourceOwnerId || !actorId) return false;
  return resourceOwnerId === actorId;
}

/** Owner OR admin/super_admin */
export function canManageResource(
  role: string | SessionRole | null | undefined,
  resourceOwnerId: string | null | undefined,
  actorId: string | null | undefined,
): boolean {
  if (isOwner(resourceOwnerId, actorId)) return true;
  return isAdmin(role);
}
