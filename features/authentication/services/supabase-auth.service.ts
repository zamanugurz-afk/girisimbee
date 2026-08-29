import type { SupabaseClient } from '@supabase/supabase-js';
import { ids } from '@/lib/domain/ids';
import type {
  SessionUser,
  UserProfile,
  SignUpInput,
  SignInInput,
  StoredUserRole,
} from '@/features/authentication/types/auth.types';
import { coerceStoredRole } from '@/features/authentication/constants/roles';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { resolveAuthSiteUrl } from '@/lib/site-url';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import { roleTrace } from '@/features/authorization/lib/role-trace';

/** Auth redirect origin — browser origin, never unstable custom domains. */
export function getSiteUrl(): string {
  return resolveAuthSiteUrl();
}

/** App callback after Supabase finishes Google OAuth (not the Google→Supabase URI). */
export function getOAuthRedirectTo(): string {
  return `${resolveAuthSiteUrl()}${AUTH_ROUTES.callback}`;
}
/** Live `public.profiles` columns only (no user_id / first_name / username / status / …). */
type ProfileRow = {
  id: string;
  role?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  account_status?: string | null;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  last_active_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  const dbRole = row.role;
  const rawRole = dbRole == null ? '' : String(dbRole);
  const role: StoredUserRole = coerceStoredRole(rawRole);
  roleTrace('mapProfile', {
    userId: row.id,
    dbRole,
    dbRoleType: typeof dbRole,
    dbRoleJson: JSON.stringify(dbRole),
    rawRole,
    coercedRole: role,
    accountStatus: row.account_status ?? null,
    keys: Object.keys(row),
  });
  if (/super_admin/i.test(rawRole) && role !== 'super_admin') {
    roleTrace('mapProfile:BUG super_admin lost in coerce', { rawRole, role });
  }
  return {
    id: ids.user(row.id),
    role,
    rawRole,
    displayName: row.display_name ?? null,
    // `username` is not a profiles column — keep null; UI falls back to /dashboard/profil
    username: null,
    avatarUrl: row.avatar_url ?? null,
    accountStatus: row.account_status ?? null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

type AuthUserForSession = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  /** Service-role-only claims — used when profiles row is missing. */
  app_metadata?: Record<string, unknown> | null;
};

function roleFromAppMetadata(appMetadata: Record<string, unknown> | null | undefined): {
  role: StoredUserRole;
  raw: string;
} | null {
  const raw = appMetadata?.role;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  return { role: coerceStoredRole(raw), raw: raw.trim() };
}

export function mapSessionUser(
  authUser: AuthUserForSession,
  profile: UserProfile | null,
): SessionUser {
  const meta = roleFromAppMetadata(authUser.app_metadata);

  let role: StoredUserRole = 'user';
  let rawRole: string | null = null;
  let source: 'profile.rawRole' | 'profile.role' | 'app_metadata' | 'fallback:user' = 'fallback:user';

  if (profile) {
    rawRole = profile.rawRole || null;
    // Coerce from raw DB string first — empty rawRole means column was null/missing.
    role = coerceStoredRole(profile.rawRole || profile.role);
    source = profile.rawRole ? 'profile.rawRole' : 'profile.role';
  } else if (meta) {
    role = meta.role;
    rawRole = meta.raw;
    source = 'app_metadata';
  }

  // Absolute guard: raw text saying super_admin must win over any fallback.
  if (rawRole && /super_?admin/i.test(rawRole)) {
    role = 'super_admin';
  }

  roleTrace('mapSessionUser', {
    authUserId: authUser.id,
    email: authUser.email,
    profilePresent: Boolean(profile),
    profileRole: profile?.role ?? null,
    profileRawRole: profile?.rawRole ?? null,
    metaRole: meta?.role ?? null,
    source,
    resolvedRole: role,
    resolvedRawRole: rawRole,
    fallbackWouldBeUser: !profile && !meta,
  });

  return {
    id: ids.user(authUser.id),
    email: authUser.email ?? '',
    emailVerified: Boolean(authUser.email_confirmed_at),
    role,
    rawRole,
    displayName: profile?.displayName ?? null,
    username: profile?.username ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
  };
}

/** Explicit live columns — avoids selecting missing user_id / first_name / … */
const PROFILE_SELECT =
  'id, role, display_name, avatar_url, email, account_status, suspended_at, suspension_reason, last_active_at, created_at, updated_at';

function isRlsOrMissingProfileError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  // PostgREST: 0 rows for .single() — often RLS filtered the row or id mismatch
  if (error.code === 'PGRST116') return true;
  if (/row-level security|permission denied|42501/i.test(error.message ?? '')) return true;
  return false;
}

export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (profile) {
    return mapProfile(profile as ProfileRow);
  }

  if (error && isMissingRelationError(error)) {
    return null;
  }

  if (error && !isRlsOrMissingProfileError(error)) {
    roleTrace('fetchProfile:failed', {
      sessionUserId: userId,
      code: error.code ?? null,
      message: error.message,
    });
  }

  return null;
}

export async function fetchSessionUser(supabase: SupabaseClient): Promise<SessionUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    roleTrace('fetchSessionUser:noAuthUser', {
      error: error?.message ?? null,
    });
    return null;
  }

  roleTrace('fetchSessionUser:authUser', {
    id: user.id,
    email: user.email,
    app_metadata_role: user.app_metadata?.role ?? null,
    user_metadata_role: user.user_metadata?.role ?? null,
  });

  const profile = await fetchProfile(supabase, user.id);
  const sessionUser = mapSessionUser(
    {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      app_metadata: user.app_metadata,
    },
    profile,
  );

  roleTrace('fetchSessionUser:result', {
    email: sessionUser.email,
    role: sessionUser.role,
    rawRole: sessionUser.rawRole,
  });

  return sessionUser;
}

const EMAIL_ALREADY_REGISTERED_MESSAGE =
  'Bu e-posta adresi ile zaten bir hesap bulunuyor. Giriş yapın veya şifrenizi sıfırlayın.';

function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapSignUpAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('already registered')
    || lower.includes('already been registered')
    || lower.includes('user already exists')
    || lower.includes('email address is already')
  ) {
    return EMAIL_ALREADY_REGISTERED_MESSAGE;
  }
  return message;
}

/** True when Supabase hides an existing account behind an empty-identities signup response. */
export function isDuplicateEmailSignUpResponse(user: {
  identities?: Array<unknown> | null;
} | null | undefined): boolean {
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}

export async function signUpWithEmail(supabase: SupabaseClient, input: SignUpInput) {
  const siteUrl = getSiteUrl();
  const email = normalizeAuthEmail(input.email);
  const displayName =
    input.displayName?.trim()
    || `${input.firstName} ${input.lastName}`.trim();

  const result = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      // Auth metadata only — live profiles columns are filled by handle_new_user
      // (id, role, display_name, email, last_active_at). Form first/last/username/phone
      // stay in raw_user_meta_data for display_name coalescing, not as profiles columns.
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
      emailRedirectTo: `${siteUrl}${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.verifySuccess)}&flow=email`,
    },
  });

  if (result.error) {
    return {
      data: result.data,
      error: {
        ...result.error,
        message: mapSignUpAuthErrorMessage(result.error.message),
      },
    };
  }

  // Auth emails are unique; existing users may return no error + empty identities.
  if (isDuplicateEmailSignUpResponse(result.data.user)) {
    return {
      data: { user: null, session: null },
      error: {
        name: 'EmailExistsError',
        message: EMAIL_ALREADY_REGISTERED_MESSAGE,
        status: 422,
      },
    };
  }

  return result;
}

function mapSignInAuthErrorMessage(message: string): string {
  if (/invalid login credentials|invalid_credentials/i.test(message)) {
    return 'E-posta veya şifre hatalı. Google ile kayıt olduysanız “Google ile giriş yap” kullanın.';
  }
  if (/email not confirmed|not confirmed/i.test(message)) {
    return 'E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzdaki doğrulama bağlantısını kullanın.';
  }
  if (/invalid api key/i.test(message)) {
    return 'Sistem bağlantı anahtarı (Supabase API Key) geçersiz veya süresi dolmuş. Lütfen Vercel/Supabase ayarlarını kontrol edin.';
  }
  return message;
}

export async function signInWithEmail(supabase: SupabaseClient, input: SignInInput) {
  const result = await supabase.auth.signInWithPassword({
    email: normalizeAuthEmail(input.email),
    password: input.password,
  });
  if (result.error) {
    return {
      ...result,
      error: { ...result.error, message: mapSignInAuthErrorMessage(result.error.message) },
    };
  }
  return result;
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
  return supabase.auth.resetPasswordForEmail(normalizeAuthEmail(email), {
    redirectTo: `${siteUrl}${AUTH_ROUTES.resetPassword}?type=recovery`,
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
    email: normalizeAuthEmail(email),
    options: {
      emailRedirectTo: `${siteUrl}${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.verifySuccess)}&flow=email`,
    },
  });
}

export async function exchangeCodeForSession(supabase: SupabaseClient, code: string) {
  return supabase.auth.exchangeCodeForSession(code);
}

export type OAuthProvider = 'google';

/** STEP 6: Google (or other) OAuth — email/password login unchanged */
export async function signInWithOAuth(
  supabase: SupabaseClient,
  provider: OAuthProvider,
  options?: { next?: string },
) {
  // App return URL only. Google→Supabase uses {SUPABASE_URL}/auth/v1/callback.
  const redirectTo = getOAuthRedirectTo();
  if (typeof console !== 'undefined') {
    console.info('[auth/oauth] signInWithOAuth', {
      provider,
      redirectTo,
      origin: typeof window !== 'undefined' ? window.location.origin : null,
    });
  }
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      // Always show Google account picker (do not silently reuse last Google session).
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
}
