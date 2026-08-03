import type { UserRole } from '@/features/authentication/types/auth.types';
import { hasMinimumRole, hasAnyRole } from '@/features/authentication/constants/roles';
import { canAccess } from '@/features/authorization/rbac.service';

export { hasMinimumRole, hasAnyRole };

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  return canAccess(role, pathname);
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
