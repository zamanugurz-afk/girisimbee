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
  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { display_name: input.displayName },
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

export async function signOut(supabase: SupabaseClient) {
  return supabase.auth.signOut();
}

export async function requestPasswordReset(supabase: SupabaseClient, email: string) {
  const siteUrl = getSiteUrl();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}${AUTH_ROUTES.callback}?next=${encodeURIComponent(AUTH_ROUTES.resetPassword)}`,
  });
}

export async function updatePassword(supabase: SupabaseClient, password: string) {
  return supabase.auth.updateUser({ password });
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
