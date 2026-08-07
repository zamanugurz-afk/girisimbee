'use client';

import { useAuth, useAuthorization } from '@/features/authentication/hooks/use-auth';
import type { Permission } from '@/features/authorization/permission.constants';
import type { AppRole } from '@/features/authorization/role.constants';
import {
  canAccess,
  canManageResource,
  hasPermission,
  hasRole,
  isAdmin,
  isOwner,
  isSuperAdmin,
} from '@/features/authorization/rbac.service';
import { menuFlags } from '@/features/authorization/lib/menu-visibility';
import { normalizeAppRole, type SessionRole } from '@/features/authorization/roles';

/** Client RBAC helpers bound to the current session role */
export function useRbac() {
  const { user } = useAuth();
  const { role } = useAuthorization();
  const appRole: SessionRole = role === 'guest' ? 'guest' : normalizeAppRole(role);

  return {
    role: appRole,
    userId: user?.id ?? null,
    hasRole: (required: AppRole | AppRole[]) => hasRole(appRole, required),
    hasPermission: (permission: Permission) => hasPermission(appRole, permission),
    canAccess: (pathname: string) => canAccess(appRole, pathname),
    isAdmin: isAdmin(appRole),
    isSuperAdmin: isSuperAdmin(appRole),
    isOwner: (resourceOwnerId: string | null | undefined) =>
      isOwner(resourceOwnerId, user?.id),
    canManageResource: (resourceOwnerId: string | null | undefined) =>
      canManageResource(appRole, resourceOwnerId, user?.id),
    menu: menuFlags(appRole),
  };
}
