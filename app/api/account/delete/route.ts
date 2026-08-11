import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { createClient } from '@/lib/supabase/server';

/**
 * POST — soft-delete the authenticated user's account profile.
 * Consent evidence and security logs are retained per retention policy.
 */
export const POST = withAuth(async (ctx, request) => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? null;
  const userAgent = request.headers.get('user-agent');

  const profile = await ctx.container.accountService.requestAccountDeletion(ctx.userId, {
    ipAddress: ip,
    userAgent,
  });

  try {
    const mp = await ctx.container.profileRepository.findByUserId(ctx.userId);
    if (mp) {
      await ctx.container.profileRepository.softDelete(mp.id);
    }
  } catch (err) {
    console.warn('[account/delete] marketplace profile soft-delete skipped', err);
  }

  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // non-fatal
  }

  return ok({ deleted: true, status: profile.status });
});
