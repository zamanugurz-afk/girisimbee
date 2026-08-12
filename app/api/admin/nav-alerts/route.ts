import { ok, apiError } from '@/lib/api/response';
import { withAdmin } from '@/lib/api/with-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';

/** GET — new-item counts for admin sidebar badges (şikayet / destek / reklam). */
export const GET = withAdmin(async (ctx) => {
  try {
    const supabase = createServiceRoleClient();

    const [moderation, support, ads] = await Promise.all([
      ctx.container.reportRepository.count({ status: 'submitted' }),
      supabase
        .from('marketplace_support_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .then(({ count, error }) => {
          if (error) throw new Error(error.message);
          return count ?? 0;
        }),
      supabase
        .from('marketplace_ad_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .then(({ count, error }) => {
          if (error) throw new Error(error.message);
          return count ?? 0;
        }),
    ]);

    return ok({
      moderation,
      support_inquiries: support,
      ad_inquiries: ads,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Uyarılar yüklenemedi';
    return apiError(message, 500, { code: 'NAV_ALERTS_FAILED' });
  }
});
