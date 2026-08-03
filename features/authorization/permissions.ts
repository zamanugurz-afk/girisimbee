import { PERMISSIONS, type Permission } from '@/features/authorization/permission.constants';
import type { AppRole } from '@/features/authorization/role.constants';

/** Role → granted permissions (hierarchy: super_admin ⊃ admin ⊃ user) */
export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  user: [
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT_OWN,
    PERMISSIONS.FAVORITE_ADD,
    PERMISSIONS.PLACEMENT_PURCHASE,
    PERMISSIONS.PROFILE_MANAGE_OWN,
  ],
  admin: [
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT_OWN,
    PERMISSIONS.FAVORITE_ADD,
    PERMISSIONS.PLACEMENT_PURCHASE,
    PERMISSIONS.PROFILE_MANAGE_OWN,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.LISTINGS_MANAGE,
    PERMISSIONS.PLACEMENTS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.REPORTS_VIEW,
  ],
  super_admin: [
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT_OWN,
    PERMISSIONS.FAVORITE_ADD,
    PERMISSIONS.PLACEMENT_PURCHASE,
    PERMISSIONS.PROFILE_MANAGE_OWN,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.LISTINGS_MANAGE,
    PERMISSIONS.PLACEMENTS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.ADMINS_CREATE,
    PERMISSIONS.ADMINS_REVOKE,
    PERMISSIONS.ROLES_ASSIGN,
    PERMISSIONS.SYSTEM_MANAGE,
  ],
};

/** Route prefix → minimum role required */
export const ROUTE_ROLE_REQUIREMENTS: readonly {
  prefix: string;
  minimumRole: AppRole;
}[] = [
  { prefix: '/admin', minimumRole: 'admin' },
  { prefix: '/moderasyon', minimumRole: 'admin' },
];

/** Menu item visibility keys */
export type MenuVisibilityKey =
  | 'account'
  | 'listings'
  | 'admin_panel'
  | 'system_settings';

export const MENU_PERMISSIONS: Record<MenuVisibilityKey, Permission | AppRole> = {
  account: PERMISSIONS.PROFILE_MANAGE_OWN,
  listings: PERMISSIONS.LISTING_CREATE,
  admin_panel: 'admin',
  system_settings: PERMISSIONS.SETTINGS_MANAGE,
};
