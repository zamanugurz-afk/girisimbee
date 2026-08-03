/**
 * Account-level profile — auth identity row (`public.profiles`).
 * Distinct from marketplace `Profile` (`marketplace_profiles`).
 */
import type { AccountProfileId, UserId } from '@/lib/domain/ids';
import type { StoredUserRole } from '@/features/authentication/types/auth.types';

/** Roles written to profiles.role */
export type AccountStoredRole = StoredUserRole;

export type AccountProfileStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'deactivated'
  | 'deleted';

export interface AccountProfile {
  id: AccountProfileId;
  userId: UserId;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: AccountStoredRole;
  status: AccountProfileStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export type CreateAccountProfileInput = {
  userId: UserId;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: AccountStoredRole;
  status?: AccountProfileStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type UpdateAccountProfileInput = Partial<
  Omit<AccountProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;
