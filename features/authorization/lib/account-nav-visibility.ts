import type { AccountNavItem } from '@/features/account/types/account-panel.types';
import { ACCOUNT_NAV_ITEMS } from '@/features/account/types/account-panel.constants';
import type { SessionRole } from '@/features/authorization/role.constants';
import { canSeeMenuItem } from '@/features/authorization/lib/menu-visibility';

/**
 * Account sidebar visibility — all signed-in roles see core account items.
 * Extends via MENU_PERMISSIONS keys when admin-only account links are added.
 */
export function getVisibleAccountNavItems(
  role: SessionRole | string | null | undefined,
): readonly AccountNavItem[] {
  const signedIn = role && role !== 'guest';
  if (!signedIn) return [];

  return ACCOUNT_NAV_ITEMS.filter((item) => {
    if (
      item.id === 'account'
      || item.id === 'profile'
      || item.id === 'settings'
      || item.id === 'security'
      || item.id === 'privacy'
      || item.id === 'verifications'
    ) {
      return canSeeMenuItem(role, 'account');
    }
    if (
      item.id === 'listings'
      || item.id === 'listings-active'
      || item.id === 'listings-drafts'
      || item.id === 'listings-passive'
      || item.id === 'listings-packages'
      || item.id === 'showcases'
    ) {
      return canSeeMenuItem(role, 'listings');
    }
    return true;
  });
}
