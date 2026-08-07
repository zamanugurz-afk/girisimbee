import type { Permission } from '@/features/authorization/permission.constants';
import { MENU_PERMISSIONS, type MenuVisibilityKey } from '@/features/authorization/permissions';
import {
  hasPermission,
  hasRole,
  isAdmin,
  isSuperAdmin,
} from '@/features/authorization/rbac.service';
import { isAppRole, type AppRole, type SessionRole } from '@/features/authorization/roles';

export function canSeeMenuItem(
  role: string | SessionRole | null | undefined,
  key: MenuVisibilityKey,
): boolean {
  const requirement = MENU_PERMISSIONS[key];
  if (isAppRole(requirement)) {
    return hasRole(role, requirement as AppRole);
  }
  return hasPermission(role, requirement as Permission);
}

export function getVisibleMenuKeys(
  role: string | SessionRole | null | undefined,
): MenuVisibilityKey[] {
  return (Object.keys(MENU_PERMISSIONS) as MenuVisibilityKey[]).filter((key) =>
    canSeeMenuItem(role, key),
  );
}

/** Top-nav / auth dropdown visibility helpers */
export function menuFlags(role: string | SessionRole | null | undefined) {
  return {
    showAccount: canSeeMenuItem(role, 'account'),
    showListings: canSeeMenuItem(role, 'listings'),
    showAdminPanel: canSeeMenuItem(role, 'admin_panel') || isAdmin(role),
    showSystemSettings: canSeeMenuItem(role, 'system_settings') || isSuperAdmin(role),
  };
}
