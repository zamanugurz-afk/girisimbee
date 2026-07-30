import type { UserRole } from '@/features/authentication/types/auth.types';
import { hasMinimumRole, hasAnyRole } from '@/features/authentication/constants/roles';
import {
  ADMIN_ROUTE_PREFIXES,
  MODERATOR_ROUTE_PREFIXES,
  matchesPrefix,
} from '@/features/authentication/constants/routes';

export { hasMinimumRole, hasAnyRole };

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (matchesPrefix(pathname, ADMIN_ROUTE_PREFIXES)) {
    return role === 'admin';
  }
  if (matchesPrefix(pathname, MODERATOR_ROUTE_PREFIXES)) {
    return hasMinimumRole(role, 'moderator');
  }
  return true;
}

export function requireRole(role: UserRole, minimum: UserRole): void {
  if (!hasMinimumRole(role, minimum)) {
    throw new Error(`Bu işlem için ${minimum} veya üzeri rol gerekli.`);
  }
}

export function requireAnyRole(role: UserRole, allowed: UserRole[]): void {
  if (!hasAnyRole(role, allowed)) {
    throw new Error('Bu işlem için yetkiniz yok.');
  }
}
