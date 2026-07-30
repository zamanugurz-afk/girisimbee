/**
 * Runtime auth types — mapped from Supabase Auth + profiles table.
 * Guest = unauthenticated (no session).
 */
import type { UserId } from '@/lib/domain/ids';

export type UserRole =
  | 'guest'
  | 'member'
  | 'verified'
  | 'company'
  | 'moderator'
  | 'admin';

/** Authenticated roles stored in profiles.role */
export type StoredUserRole = Exclude<UserRole, 'guest'>;

export interface UserProfile {
  id: UserId;
  role: StoredUserRole;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: UserId;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface UpdatePasswordInput {
  password: string;
}
