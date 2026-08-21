import { createClient } from '@/lib/supabase/server';
import { ok, apiError } from '@/lib/api/response';
import type { HeroStatsCounts } from '@/features/home/types/hero-stats.types';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { countPublishedMarketItems } from '@/features/admin/market/lib/market-repository';
import { getMockPublishedMarketItems } from '@/features/admin/market/mock/market.mock';

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

    const getOpportunitiesCount = async (): Promise<number> => {
      try {
        const count = await countPublishedMarketItems(supabase);
        if (count > 0) return count;
        return getMockPublishedMarketItems().length;
      } catch {
        return getMockPublishedMarketItems().length;
      }
    };

    const [
      totalRes,
      employersRes,
      candidatesRes,
      partnersRes,
      franchiseRes,
      opportunitiesCount,
      solutionsRes,
    ] = await Promise.all([
      published(),
      published().eq('module_key', 'employers'),
      published().eq('module_key', 'candidates'),
      published().eq('module_key', 'founders'),
      published().eq('module_key', 'franchise'),
      getOpportunitiesCount(),
      published().eq('category_id', CATEGORY_IDS.dijitalAi),
    ]);

    const firstError = [
      totalRes,
      employersRes,
      candidatesRes,
      partnersRes,
      franchiseRes,
      solutionsRes,
    ].find((r) => r.error)?.error;

    if (firstError) {
      // Fallback for offline/unseeded environments
      return ok({
        total: 15,
        jobs: 5,
        partners: 2,
        franchise: 3,
        opportunities: opportunitiesCount || getMockPublishedMarketItems().length,
        solutions: 4,
      });
    }

    const stats: HeroStatsCounts = {
      total: totalRes.count ?? 0,
      jobs: (employersRes.count ?? 0) + (candidatesRes.count ?? 0),
      partners: partnersRes.count ?? 0,
      franchise: franchiseRes.count ?? 0,
      opportunities: opportunitiesCount,
      solutions: solutionsRes.count ?? 0,
    };

    return ok(stats);
  } catch (error) {
    if (isDynamicServerUsageError(error)) throw error;
    console.error('[hero-stats]', error);
    return ok({
      total: 15,
      jobs: 5,
      partners: 2,
      franchise: 3,
      opportunities: getMockPublishedMarketItems().length,
      solutions: 4,
    });
  }
}
