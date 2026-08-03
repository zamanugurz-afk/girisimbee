/**
 * Runtime auth types — mapped from Supabase Auth + profiles table.
 * Guest = unauthenticated (no session).
 * Stored roles: user | admin | super_admin (AUTHORIZATION STEP 1).
 */
import type { UserId } from '@/lib/domain/ids';
import type { AppRole, SessionRole } from '@/features/authorization/role.constants';

/** @deprecated Prefer SessionRole from authorization — kept as alias during migration */
export type UserRole = SessionRole;

/** Authenticated roles stored in profiles.role */
export type StoredUserRole = AppRole;

export interface UserProfile {
  id: UserId;
  role: StoredUserRole;
  /** Unmodified profiles.role from the database */
  rawRole: string;
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
  /**
   * Original `profiles.role` (or app_metadata.role) before RBAC coercion.
   * Used for UI labels so legacy names (member/verified/company) can still display.
   */
  rawRole?: string | null;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpConsents {
  acceptTerms: boolean;
  acceptKvkk: boolean;
  acceptPrivacy: boolean;
  acceptCookies: boolean;
  consentCommercial: boolean;
  consentSms: boolean;
  consentEmail: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  consents: SignUpConsents;
  /** Derived: `${firstName} ${lastName}` — kept for profiles.trigger compatibility */
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
