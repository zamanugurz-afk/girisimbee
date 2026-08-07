export {
  PERMISSIONS,
  ALL_PERMISSIONS,
} from '@/features/authorization/permission.constants';
export type { Permission } from '@/features/authorization/permission.constants';

export {
  APP_ROLES,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  ROLE_DISPLAY_LABELS,
  LEGACY_ROLE_MAP,
} from '@/features/authorization/role.constants';
export type { AppRole, SessionRole } from '@/features/authorization/role.constants';

export {
  ROLE_PERMISSIONS,
  ROUTE_ROLE_REQUIREMENTS,
  MENU_PERMISSIONS,
} from '@/features/authorization/permissions';
export type { MenuVisibilityKey } from '@/features/authorization/permissions';

export {
  isAppRole,
  normalizeAppRole,
  getRoleLabel,
  toSessionRole,
  roleRank,
  roleAtLeast,
} from '@/features/authorization/roles';

export {
  hasRole,
  hasPermission,
  canAccess,
  isAdmin,
  isSuperAdmin,
  isOwner,
  canManageResource,
} from '@/features/authorization/rbac.service';

export {
  requireAuthSession,
  requireRoles,
  requirePermission,
  requireAdminGuard,
  requireSuperAdminGuard,
  requireRouteAccess,
  sessionAppRole,
} from '@/features/authorization/guards';

export {
  canSeeMenuItem,
  getVisibleMenuKeys,
  menuFlags,
} from '@/features/authorization/lib/menu-visibility';

export { getVisibleAccountNavItems } from '@/features/authorization/lib/account-nav-visibility';

export { RequireAccess } from '@/features/authorization/components/RequireAccess';
export { useRbac } from '@/features/authorization/hooks/use-rbac';
