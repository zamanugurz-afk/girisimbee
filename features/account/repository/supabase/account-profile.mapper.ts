import { ids } from '@/lib/domain/ids';
import { coerceStoredRole } from '@/features/authentication/constants/roles';
import type {
  AccountProfile,
  AccountProfileStatus,
  CreateAccountProfileInput,
} from '@/features/account/types/account-profile.types';

export interface AccountProfileRow {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status?: string | null;
  account_status?: string | null;
  email_verified?: boolean | null;
  phone_verified?: boolean | null;
  is_email_verified?: boolean | null;
  is_phone_verified?: boolean | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

const STATUSES: AccountProfileStatus[] = [
  'pending',
  'active',
  'suspended',
  'deactivated',
  'deleted',
];

function mapStatus(value: string | null | undefined): AccountProfileStatus {
  if (value && STATUSES.includes(value as AccountProfileStatus)) {
    return value as AccountProfileStatus;
  }
  return 'active';
}

export function mapAccountProfileRow(row: AccountProfileRow): AccountProfile {
  const userId = row.user_id ?? row.id;
  return {
    id: ids.accountProfile(row.id),
    userId: ids.user(userId),
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    email: row.email,
    phone: row.phone,
    role: coerceStoredRole(row.role),
    status: mapStatus(row.status ?? row.account_status),
    emailVerified: Boolean(row.is_email_verified ?? row.email_verified),
    phoneVerified: Boolean(row.is_phone_verified ?? row.phone_verified),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

export function toAccountProfileUpsert(input: CreateAccountProfileInput) {
  const now = new Date().toISOString();
  const id = input.userId;
  return {
    id,
    user_id: input.userId,
    first_name: input.firstName ?? null,
    last_name: input.lastName ?? null,
    username: input.username ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    role: input.role ?? 'user',
    status: input.status ?? 'active',
    account_status: input.status ?? 'active',
    email_verified: input.emailVerified ?? false,
    phone_verified: input.phoneVerified ?? false,
    is_email_verified: input.emailVerified ?? false,
    is_phone_verified: input.phoneVerified ?? false,
    last_login_at: null,
    updated_at: now,
  };
}

export function createAccountProfileEntity(input: CreateAccountProfileInput): AccountProfile {
  const now = new Date().toISOString();
  return {
    id: ids.accountProfile(input.userId),
    userId: input.userId,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    username: input.username ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    role: input.role ?? 'user',
    status: input.status ?? 'active',
    emailVerified: input.emailVerified ?? false,
    phoneVerified: input.phoneVerified ?? false,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };
}
