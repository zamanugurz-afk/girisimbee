import type {
  AdminUserRole,
  AdminUserStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_USER_ROLES: readonly AdminUserRole[] = [
  'user',
  'admin',
  'super_admin',
] as const;

export const ADMIN_USER_STATUSES: readonly AdminUserStatus[] = [
  'active',
  'suspended',
  'deleted',
] as const;

export const ADMIN_USER_ROLE_LABELS: Record<AdminUserRole, string> = {
  user: 'Kullanıcı',
  admin: 'Yönetici',
  super_admin: 'Süper Yönetici',
};

export const ADMIN_USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: 'Aktif',
  suspended: 'Pasif / Askıda',
  deleted: 'Yasaklı',
};

export const ADMIN_USERS_PAGE_SIZE = 5;
