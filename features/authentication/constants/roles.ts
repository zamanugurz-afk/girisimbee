import type { StoredUserRole, UserRole } from '@/features/authentication/types/auth.types';

/** Numeric hierarchy for role comparison */
export const ROLE_LEVEL: Record<UserRole, number> = {
  guest: 0,
  member: 1,
  verified: 2,
  company: 3,
  moderator: 4,
  admin: 5,
};

export const STORED_ROLES: StoredUserRole[] = [
  'member',
  'verified',
  'company',
  'moderator',
  'admin',
];

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Misafir',
  member: 'Üye',
  verified: 'Doğrulanmış',
  company: 'Şirket',
  moderator: 'Moderatör',
  admin: 'Yönetici',
};

export function hasMinimumRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[required];
}

export function hasAnyRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole);
}

export function isStoredRole(value: string): value is StoredUserRole {
  return STORED_ROLES.includes(value as StoredUserRole);
}
