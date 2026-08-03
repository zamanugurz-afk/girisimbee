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
import { resolveSiteUrl } from '@/lib/site-url';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import { roleTrace } from '@/features/authorization/lib/role-trace';

type ProfileRow = {
  id: string;
  role?: string | null;
  user_id?: string | null;
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
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
    keys: Object.keys(row),
  });
  if (/super_admin/i.test(rawRole) && role !== 'super_admin') {
    roleTrace('mapProfile:BUG super_admin lost in coerce', { rawRole, role });
  }
  return {
    id: ids.user(row.id),
    role,
    rawRole,
    displayName: (row.display_name as string | null) ?? null,
    username: (row.username as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
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

const PROFILE_SELECT = '*';

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
  // eslint-disable-next-line no-console -- role/RLS debug
  console.log('PROFILE QUERY ID', userId);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .single();

  // eslint-disable-next-line no-console -- role/RLS debug
  console.log('PROFILE RESULT', profile);
  // eslint-disable-next-line no-console -- role/RLS debug
  console.log('PROFILE ERROR', error);

  if (profile) {
    const row = profile as ProfileRow;
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log('SESSION↔PROFILE ID CHECK', {
      sessionUserId: userId,
      profilesId: row.id,
      profilesUserId: row.user_id ?? null,
      idEqualsSession: row.id === userId,
      userIdEqualsSession: (row.user_id ?? null) === userId,
      role: row.role ?? null,
    });
    return mapProfile(row);
  }

  if (error && isMissingRelationError(error)) {
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log('PROFILE TABLE MISSING (relation error)', error.message);
    return null;
  }

  if (isRlsOrMissingProfileError(error)) {
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log(
      'PROFILE RLS OR ID MISMATCH: no visible row for profiles.id = session.user.id. '
      + 'Either RLS blocks SELECT, or public.profiles.id does not equal auth uid.',
      { sessionUserId: userId, code: error?.code, message: error?.message },
    );
  } else if (error) {
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log('PROFILE QUERY FAILED', { sessionUserId: userId, error });
  }

  // Secondary lookup: some rows key off user_id instead of id
  const byUserId = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .maybeSingle();

  // eslint-disable-next-line no-console -- role/RLS debug
  console.log('PROFILE FALLBACK by user_id', {
    PROFILE_QUERY_ID: userId,
    PROFILE_RESULT: byUserId.data,
    PROFILE_ERROR: byUserId.error,
  });

  if (!byUserId.error && byUserId.data) {
    const row = byUserId.data as ProfileRow;
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log('SESSION↔PROFILE ID CHECK (via user_id)', {
      sessionUserId: userId,
      profilesId: row.id,
      profilesUserId: row.user_id ?? null,
      idEqualsSession: row.id === userId,
      userIdEqualsSession: (row.user_id ?? null) === userId,
      role: row.role ?? null,
      note: row.id !== userId
        ? 'MISMATCH: profiles.id !== session.user.id — auth fetch by id will miss this row'
        : 'ids match',
    });
    return mapProfile(row);
  }

  if (isRlsOrMissingProfileError(byUserId.error) || (!byUserId.data && !byUserId.error)) {
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log(
      'PROFILE UNREADABLE AFTER id + user_id LOOKUPS — likely RLS deny or no profile row',
      { sessionUserId: userId },
    );
  }

  return null;
}

export async function fetchSessionUser(supabase: SupabaseClient): Promise<SessionUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  // eslint-disable-next-line no-console -- role/RLS debug
  console.log('SESSION USER ID', user?.id ?? null);

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

export type OAuthProvider = 'google';

/** STEP 6: Google (or other) OAuth — email/password login unchanged */
export async function signInWithOAuth(
  supabase: SupabaseClient,
  provider: OAuthProvider,
  options?: { next?: string },
) {
  const siteUrl = getSiteUrl();
  const next = options?.next ?? AUTH_ROUTES.account;
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}${AUTH_ROUTES.callback}?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
}
