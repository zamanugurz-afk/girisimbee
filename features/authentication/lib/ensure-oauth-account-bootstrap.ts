import { createClient } from '@/lib/supabase/server';
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
 * After OAuth callback: create profile + default settings + KVKK on first login.
 * Idempotent — skips bootstrap when account profile already exists.
 */
export async function ensureOAuthAccountBootstrap(user: AuthUserLike): Promise<void> {
  if (!isOAuthUser(user)) return;

  const supabase = createClient();
  const accountService = getServerContainer(supabase).accountService;
  const userId = ids.user(user.id);

  const existing = await accountService.getProfile(userId);
  if (existing) {
    // Don't block OAuth redirect on analytics writes.
    void accountService.recordLogin(userId).catch(() => undefined);
    return;
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
}
