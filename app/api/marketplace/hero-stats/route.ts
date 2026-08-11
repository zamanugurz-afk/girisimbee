import { createClient } from '@/lib/supabase/server';
import { ok, apiError } from '@/lib/api/response';
import type { HeroStatsCounts } from '@/features/home/types/hero-stats.types';

export const dynamic = 'force-dynamic';

function isDynamicServerUsageError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    (err as { digest?: unknown }).digest === 'DYNAMIC_SERVER_USAGE'
  );
}

/** GET — published listing counts for homepage hero (head-only, no row download). */
export async function GET() {
  try {
    const supabase = createClient();

    const published = () =>
      supabase
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .is('deleted_at', null);

    const [
      totalRes,
      entrepreneursRes,
      investorsRes,
      employersRes,
      candidatesRes,
      partnersRes,
      franchiseRes,
    ] = await Promise.all([
      published(),
      published().eq('module_key', 'entrepreneurs'),
      published().eq('module_key', 'investors'),
      published().eq('module_key', 'employers'),
      published().eq('module_key', 'candidates'),
      published().eq('module_key', 'founders'),
      published().eq('module_key', 'franchise'),
    ]);

    const firstError = [
      totalRes,
      entrepreneursRes,
      investorsRes,
      employersRes,
      candidatesRes,
      partnersRes,
      franchiseRes,
    ].find((r) => r.error)?.error;
    if (firstError) throw new Error(firstError.message);

    const stats: HeroStatsCounts = {
      total: totalRes.count ?? 0,
      entrepreneurs: entrepreneursRes.count ?? 0,
      investors: investorsRes.count ?? 0,
      jobs: (employersRes.count ?? 0) + (candidatesRes.count ?? 0),
      partners: partnersRes.count ?? 0,
      franchise: franchiseRes.count ?? 0,
    };

    return ok(stats);
  } catch (error) {
    if (isDynamicServerUsageError(error)) throw error;
    console.error('[hero-stats]', error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    return apiError(message || 'İstatistikler alınamadı', 500);
  }
}
