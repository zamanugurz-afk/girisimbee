import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import {
  DEFAULT_OAUTH_CONSENTS,
  splitFullName,
} from '@/features/authentication/lib/oauth-bootstrap';

type AuthUserLike = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  app_metadata?: { provider?: string; providers?: string[] };
  user_metadata?: Record<string, unknown>;
};

function isOAuthUser(user: AuthUserLike): boolean {
  const provider = user.app_metadata?.provider;
  const providers = user.app_metadata?.providers ?? [];
  return provider === 'google' || providers.includes('google');
}

/**
 * After OAuth callback: create profile + default settings on first login.
 * Does NOT auto-accept legal documents — caller should redirect users who
 * have not accepted terms to /auth/yasal-onay.
 * Idempotent — skips bootstrap when account profile already exists.
 *
 * Prefer passing the callback-route Supabase client (session already exchanged).
 */
export async function ensureOAuthAccountBootstrap(
  user: AuthUserLike,
  supabaseClient?: SupabaseClient,
): Promise<{
  created: boolean;
  needsLegalAcceptance: boolean;
}> {
  if (!isOAuthUser(user)) return { created: false, needsLegalAcceptance: false };

  const supabase = supabaseClient ?? createClient();
  const accountService = getServerContainer(supabase).accountService;
  const userId = ids.user(user.id);

  // Consent read via service role — user-scoped SELECT can miss rows under RLS
  // and falsely re-open /auth/yasal-onay for returning Google users.
  const consentService = (() => {
    try {
      return getServerContainer(createServiceRoleClient()).accountService;
    } catch {
      return accountService;
    }
  })();

  const existing = await accountService.getProfile(userId);
  if (existing) {
    void accountService.recordLogin(userId).catch(() => undefined);
    let needsLegalAcceptance = true;
    try {
      needsLegalAcceptance = await consentService.needsLegalAcceptance(userId);
    } catch (error) {
      console.error('[oauth-bootstrap] needsLegalAcceptance failed', error);
      needsLegalAcceptance = true;
    }
    return { created: false, needsLegalAcceptance };
  }

  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    '';
  const { firstName, lastName } = splitFullName(fullName);

  await accountService.bootstrapFromSignup({
    userId,
    email: user.email ?? null,
    firstName,
    lastName,
    emailVerified: Boolean(user.email_confirmed_at ?? user.email),
    role: 'user',
    consents: DEFAULT_OAUTH_CONSENTS,
  });

  // First OAuth profile create still requires the UI legal gate.
  return { created: true, needsLegalAcceptance: true };
}
