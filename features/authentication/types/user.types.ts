/**
 * User — platform account & authentication identity.
 *
 * Purpose: Authenticate, authorize, and anchor all user-owned resources.
 * Relations: 1 Profile, 1+ Verifications, many Listings, Applications, Favorites, Messages.
 * Lifecycle: pending → active ↔ suspended → deactivated → deleted
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { UserId } from '@/lib/domain/ids';

export type DomainUserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'deactivated' | 'deleted';

export interface User extends Timestamps, SoftDeletable {
  id: UserId;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  passwordHash: string;
  role: DomainUserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  locale: string;
  timezone: string;
}

export type CreateUserInput = Pick<User, 'email' | 'passwordHash'> & {
  phone?: string | null;
  locale?: string;
  timezone?: string;
};

export type UpdateUserInput = Partial<
  Pick<User, 'email' | 'phone' | 'locale' | 'timezone' | 'status' | 'emailVerified' | 'phoneVerified'>
>;

export interface UserFilter {
  status?: UserStatus | UserStatus[];
  role?: DomainUserRole;
  emailVerified?: boolean;
  query?: string;
  activeSince?: string;
  includeDeleted?: boolean;
}

export const USER_INDEXES: IndexDefinition[] = [
  { name: 'users_email_unique', columns: ['email'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'users_phone_unique', columns: ['phone'], unique: true, where: 'phone IS NOT NULL AND deleted_at IS NULL' },
  { name: 'users_status_idx', columns: ['status'] },
  { name: 'users_created_at_idx', columns: ['created_at'] },
  { name: 'users_role_idx', columns: ['role'] },
];

export const USER_LIFECYCLE: Record<UserStatus, readonly UserStatus[]> = {
  pending: ['active', 'deleted'],
  active: ['suspended', 'deactivated', 'deleted'],
  suspended: ['active', 'deactivated', 'deleted'],
  deactivated: ['active', 'deleted'],
  deleted: [],
};

export const USER_VALIDATION: ValidationRule[] = [
  { field: 'email', rule: 'required|email|max:255', message: 'Geçerli bir e-posta adresi girin.' },
  { field: 'passwordHash', rule: 'required|min:60|max:255', message: 'Şifre hash gerekli.' },
  { field: 'phone', rule: 'nullable|phone_tr', message: 'Geçerli bir telefon numarası girin.' },
  { field: 'locale', rule: 'in:tr,en', message: 'Desteklenmeyen dil.' },
];
