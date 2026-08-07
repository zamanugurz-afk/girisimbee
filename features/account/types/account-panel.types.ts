/** Account panel (Hesabım) UI types — presentation only. */

export type AccountNavId =
  | 'overview'
  | 'account'
  | 'profile'
  | 'security'
  | 'privacy'
  | 'verifications'
  | 'listings'
  | 'listings-active'
  | 'listings-drafts'
  | 'listings-passive'
  | 'listings-packages'
  | 'favorites'
  | 'favorites-listings'
  | 'favorites-people'
  | 'favorites-companies'
  | 'favorites-searches'
  | 'messages'
  | 'notifications'
  | 'payments'
  | 'settings'
  | 'logout'
  | 'showcases';

export interface AccountNavItem {
  id: AccountNavId;
  label: string;
  href: string;
  /** Lucide icon name key resolved in sidebar */
  icon:
    | 'LayoutDashboard'
    | 'User'
    | 'Shield'
    | 'Lock'
    | 'BadgeCheck'
    | 'Megaphone'
    | 'FileText'
    | 'Archive'
    | 'Package'
    | 'Star'
    | 'Heart'
    | 'Users'
    | 'Building2'
    | 'Search'
    | 'MessageSquare'
    | 'Bell'
    | 'CreditCard'
    | 'Settings'
    | 'LogOut';
  /** When true, item triggers sign-out rather than an in-panel page */
  isAction?: boolean;
  children?: readonly AccountNavItem[];
}

export interface AccountHubStats {
  listings: number;
  favorites: number;
  followers: number;
  /** Users this account follows — marketplace_follows foundation */
  following: number;
}

/** @deprecated Use AccountHubStats — kept for older AccountStats consumers */
export interface AccountDashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalFavorites: number;
  remainingShowcaseDuration: string;
}

export interface AccountQuickAction {
  id: string;
  label: string;
  href: string;
  description: string;
}
