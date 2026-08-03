import { redirect } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import type { Permission } from '@/features/authorization/permission.constants';
import type { AppRole } from '@/features/authorization/role.constants';
import {
  canAccess,
  hasPermission,
  hasRole,
  isAdmin,
  isSuperAdmin,
} from '@/features/authorization/rbac.service';
import { normalizeAppRole } from '@/features/authorization/roles';
import type { SessionUser } from '@/features/authentication/types/auth.types';

/** Server: require authenticated session */
export async function requireAuthSession(): Promise<SessionUser> {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);
  return user;
}

/** Server: require one of the given roles (hierarchy aware via hasRole) */
export async function requireRoles(roles: AppRole | AppRole[]): Promise<SessionUser> {
  const user = await requireAuthSession();
  if (!hasRole(user.role, roles)) {
    redirect(AUTH_ROUTES.dashboard);
  }
  return user;
}

/** Server: require a permission */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAuthSession();
  if (!hasPermission(user.role, permission)) {
    redirect(AUTH_ROUTES.dashboard);
  }
  return user;
}

/** Server: admin or super_admin */
export async function requireAdminGuard(): Promise<SessionUser> {
  const user = await requireAuthSession();
  if (!isAdmin(user.role)) {
    redirect(AUTH_ROUTES.dashboard);
  }
  return user;
}

/** Server: super_admin only */
export async function requireSuperAdminGuard(): Promise<SessionUser> {
  const user = await requireAuthSession();
  if (!isSuperAdmin(user.role)) {
    redirect(AUTH_ROUTES.dashboard);
  }
  return user;
}

/** Server: pathname-based route guard */
export async function requireRouteAccess(pathname: string): Promise<SessionUser> {
  const user = await requireAuthSession();
  if (!canAccess(user.role, pathname)) {
    redirect(AUTH_ROUTES.dashboard);
  }
  return user;
}

export function sessionAppRole(user: SessionUser | null): ReturnType<typeof normalizeAppRole> | 'guest' {
  if (!user) return 'guest';
  return normalizeAppRole(user.role);
}
