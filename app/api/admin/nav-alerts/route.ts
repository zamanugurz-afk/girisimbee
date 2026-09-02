import { ok, apiError } from '@/lib/api/response';
import { withAdmin } from '@/lib/api/with-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';

/** GET — new-item counts for admin sidebar badges (şikayet / destek / reklam). */
export const GET = withAdmin(async (ctx) => {
  try {
    const supabase = createServiceRoleClient();

    let moderation = 0;
    let support = 0;
    let ads = 0;

    try {
      moderation = await ctx.container.reportRepository.count({ status: 'submitted' });
    } catch {
      // ignore
    }

    try {
      const { count } = await supabase
        .from('marketplace_support_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      support = count ?? 0;
    } catch {
      // ignore
    }

    try {
      const { count } = await supabase
        .from('marketplace_ad_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      ads = count ?? 0;
    } catch {
      // ignore
    }

    return ok({
      moderation,
      support_inquiries: support,
      ad_inquiries: ads,
    });
  } catch {
    return ok({
      moderation: 0,
      support_inquiries: 0,
      ad_inquiries: 0,
    });
  }
});
