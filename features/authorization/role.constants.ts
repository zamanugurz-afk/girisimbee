/**
 * App roles — only three stored roles in the RBAC model.
 */
export const APP_ROLES = ['user', 'admin', 'super_admin'] as const;

export type AppRole = (typeof APP_ROLES)[number];

/** Session may also be guest (unauthenticated). */
export type SessionRole = 'guest' | AppRole;

export const ROLE_HIERARCHY: Record<SessionRole, number> = {
  guest: 0,
  user: 1,
  admin: 2,
  super_admin: 3,
};

/** Canonical session-role labels (RBAC). */
export const ROLE_LABELS: Record<SessionRole, string> = {
  guest: 'Misafir',
  user: 'Kullanıcı',
  admin: 'Yönetici',
  super_admin: 'Süper Yönetici',
};

/**
 * UI display labels for stored + legacy profile.role values.
 * Used by dashboard / menus — includes pre-RBAC role names.
 */
export const ROLE_DISPLAY_LABELS: Record<string, string> = {
  guest: 'Misafir',
  user: 'Kullanıcı',
  member: 'Kullanıcı',
  verified: 'Doğrulanmış Kullanıcı',
  company: 'Şirket',
  admin: 'Yönetici',
  super_admin: 'Süper Yönetici',
};

/** Legacy / alias profile.role values → AppRole (keys must be lowercase). */
export const LEGACY_ROLE_MAP: Record<string, AppRole> = {
  user: 'user',
  member: 'user',
  verified: 'user',
  company: 'user',
  moderator: 'admin',
  admin: 'admin',
  super_admin: 'super_admin',
  superadmin: 'super_admin',
  'super-admin': 'super_admin',
};
