import { isAdmin, isSuperAdmin } from '@/features/authorization/rbac.service';

/**
 * MARKET permissions.
 * - admin / super_admin: create, edit, delete, publish
 * - moderator (raw DB role): view only
 */
export function isMarketModerator(rawRole: string | null | undefined): boolean {
  return String(rawRole ?? '').toLowerCase() === 'moderator';
}

export function canViewMarketAdmin(
  role: string | null | undefined,
  rawRole?: string | null,
): boolean {
  if (isMarketModerator(rawRole)) return true;
  return isAdmin(role);
}

export function canManageMarket(
  role: string | null | undefined,
  rawRole?: string | null,
): boolean {
  if (isMarketModerator(rawRole)) return false;
  return isAdmin(role) || isSuperAdmin(role);
}
