import type { SupabaseClient } from '@supabase/supabase-js';
import { ids } from '@/lib/domain/ids';
import type {
  SessionUser,
  UserProfile,
  SignUpInput,
  SignInInput,
  StoredUserRole,
} from '@/features/authentication/types/auth.types';
import { isStoredRole } from '@/features/authentication/constants/roles';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { resolveSiteUrl } from '@/lib/site-url';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';

type ProfileRow = {
  id: string;
  role: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  const role: StoredUserRole = isStoredRole(row.role) ? row.role : 'member';
  return {
    id: ids.user(row.id),
    role,
    displayName: row.display_name,
    username: row.username,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSessionUser(
  authUser: { id: string; email?: string; email_confirmed_at?: string | null },
  profile: UserProfile | null,
): SessionUser {
  return {
    id: ids.user(authUser.id),
    email: authUser.email ?? '',
    emailVerified: Boolean(authUser.email_confirmed_at),
    role: profile?.role ?? 'member',
    displayName: profile?.displayName ?? null,
    username: profile?.username ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
  };
}

export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, username, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) return null;
    return null;
  }
  if (!data) return null;
  return mapProfile(data as ProfileRow);
}

export async function fetchSessionUser(supabase: SupabaseClient): Promise<SessionUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const profile = await fetchProfile(supabase, user.id);
  return mapSessionUser(
    {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
    },
    profile,
  );
}

export function getSiteUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return resolveSiteUrl();
}

export async function signUpWithEmail(supabase: SupabaseClient, input: SignUpInput) {
  const siteUrl = getSiteUrl();
  const displayName =
    input.displayName?.trim()
    || `${input.firstName} ${input.lastName}`.trim();

  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      // Stored in auth.users.raw_user_meta_data only — no DB/schema writes.
      data: {
        display_name: displayName,
        first_name: input.firstName,
        last_name: input.lastName,
        username: input.username,
        phone: input.phone,
        accept_terms: input.consents.acceptTerms,
        accept_kvkk: input.consents.acceptKvkk,
        accept_privacy: input.consents.acceptPrivacy,
        accept_cookies: input.consents.acceptCookies,
        consent_commercial: input.consents.consentCommercial,
        consent_sms: input.consents.consentSms,
        consent_email: input.consents.consentEmail,
        consented_at: new Date().toISOString(),
      },
      emailRedirectTo: `${siteUrl}${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.dashboard)}`,
    },
  });
}

export async function signInWithEmail(supabase: SupabaseClient, input: SignInInput) {
  return supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
}

/** STEP 2: email/password login */
export async function login(supabase: SupabaseClient, input: SignInInput) {
  return signInWithEmail(supabase, input);
}

export async function signOut(supabase: SupabaseClient) {
  return supabase.auth.signOut();
}

/** STEP 2: end session */
export async function logout(supabase: SupabaseClient) {
  return signOut(supabase);
}

export async function requestPasswordReset(supabase: SupabaseClient, email: string) {
  const siteUrl = getSiteUrl();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.resetPassword)}`,
  });
}

/** STEP 2: send password-reset email */
export async function forgotPassword(supabase: SupabaseClient, email: string) {
  return requestPasswordReset(supabase, email);
}

export async function updatePassword(supabase: SupabaseClient, password: string) {
  return supabase.auth.updateUser({ password });
}

/** STEP 2: set a new password after recovery link */
export async function resetPassword(supabase: SupabaseClient, password: string) {
  return updatePassword(supabase, password);
}

/** STEP 2: refresh auth tokens + return fresh session user */
export async function refreshSession(supabase: SupabaseClient): Promise<{
  user: SessionUser | null;
  error: string | null;
}> {
  const { error } = await supabase.auth.refreshSession();
  if (error) {
    return { user: null, error: error.message };
  }
  const user = await fetchSessionUser(supabase);
  return { user, error: null };
}

export async function resendVerificationEmail(supabase: SupabaseClient, email: string) {
  const siteUrl = getSiteUrl();
  return supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${siteUrl}${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.dashboard)}`,
    },
  });
}

export async function exchangeCodeForSession(supabase: SupabaseClient, code: string) {
  return supabase.auth.exchangeCodeForSession(code);
}
