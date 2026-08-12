import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { createClient } from '@/lib/supabase/server';
import { ensureOAuthAccountBootstrap } from '@/features/authentication/lib/ensure-oauth-account-bootstrap';

/**
 * POST — after browser PKCE exchange: bootstrap profile + report legal gate need.
 * Server callback already does this; /auth/pkce must call the same logic.
 */
export const POST = withAuth(async (ctx) => {
  const supabase = createClient();
  const result = await ensureOAuthAccountBootstrap(ctx.user, supabase);
  return ok(result);
});
