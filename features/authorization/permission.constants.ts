/**
 * Permission identifiers — AUTHORIZATION STEP 1.
 */
export const PERMISSIONS = {
  // user
  LISTING_CREATE: 'listing:create',
  LISTING_EDIT_OWN: 'listing:edit_own',
  FAVORITE_ADD: 'favorite:add',
  PLACEMENT_PURCHASE: 'placement:purchase',
  PROFILE_MANAGE_OWN: 'profile:manage_own',

  // admin
  USERS_VIEW: 'users:view',
  LISTINGS_MANAGE: 'listings:manage',
  PLACEMENTS_MANAGE: 'placements:manage',
  NOTIFICATIONS_SEND: 'notifications:send',
  REPORTS_VIEW: 'reports:view',

  // super_admin
  SETTINGS_MANAGE: 'settings:manage',
  ADMINS_CREATE: 'admins:create',
  ADMINS_REVOKE: 'admins:revoke',
  ROLES_ASSIGN: 'roles:assign',
  SYSTEM_MANAGE: 'system:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSIONS);
