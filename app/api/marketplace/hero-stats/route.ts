import { createClient } from '@/lib/supabase/server';
import { ok, apiError } from '@/lib/api/response';
import {
  MARKETPLACE_LISTING_TYPE_IDS,
} from '@/features/listings/config/marketplace-category-map';
import { DEFAULT_LISTING_TYPE_IDS, FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import type { HeroStatsCounts } from '@/features/home/types/hero-stats.types';

const ENTREPRENEUR_TYPES = new Set([
  String(LISTING_TYPE_IDS.yatirimBulDefault),
  String(DEFAULT_LISTING_TYPE_IDS.entrepreneurs),
  String(MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum),
]);

const INVESTOR_TYPES = new Set([
  String(LISTING_TYPE_IDS.yatirimYapDefault),
  String(DEFAULT_LISTING_TYPE_IDS.investors),
  String(MARKETPLACE_LISTING_TYPE_IDS.yatirimYapiyorum),
]);

const JOB_TYPES = new Set([
  String(LISTING_TYPE_IDS.iseAlDefault),
  String(LISTING_TYPE_IDS.isBulDefault),
  String(DEFAULT_LISTING_TYPE_IDS.employers),
  String(DEFAULT_LISTING_TYPE_IDS.candidates),
  String(MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum),
  String(MARKETPLACE_LISTING_TYPE_IDS.isAriyorum),
]);

const PARTNER_TYPES = new Set([
  String(LISTING_TYPE_IDS.ortakBulDefault),
  String(DEFAULT_LISTING_TYPE_IDS.founders),
  String(MARKETPLACE_LISTING_TYPE_IDS.ortakAriyorum),
]);

const FRANCHISE_TYPES = new Set([
  String(FRANCHISE_LISTING_TYPE_IDS.buy),
  String(FRANCHISE_LISTING_TYPE_IDS.give),
  String(MARKETPLACE_LISTING_TYPE_IDS.bayilikAl),
  String(MARKETPLACE_LISTING_TYPE_IDS.bayilikVer),
]);

type ListingStatRow = {
  module_key: string | null;
  listing_type_id: string | null;
};

function classify(row: ListingStatRow): keyof Omit<HeroStatsCounts, 'total'> | null {
  const moduleKey = row.module_key;
  if (moduleKey === 'entrepreneurs') return 'entrepreneurs';
  if (moduleKey === 'investors') return 'investors';
  if (moduleKey === 'employers' || moduleKey === 'candidates') return 'jobs';
  if (moduleKey === 'founders') return 'partners';
  if (moduleKey === 'franchise') return 'franchise';

  const typeId = row.listing_type_id ?? '';
  if (ENTREPRENEUR_TYPES.has(typeId)) return 'entrepreneurs';
  if (INVESTOR_TYPES.has(typeId)) return 'investors';
  if (JOB_TYPES.has(typeId)) return 'jobs';
  if (PARTNER_TYPES.has(typeId)) return 'partners';
  if (FRANCHISE_TYPES.has(typeId)) return 'franchise';
  return null;
}

/** GET — live published listing counts for homepage hero stats */
export async function GET() {
  try {
    const supabase = createClient();

    const { data, error, count } = await supabase
      .from('marketplace_listings')
      .select('module_key, listing_type_id', { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .limit(5000);

    if (error) {
      throw new Error(error.message || error.code || JSON.stringify(error));
    }

    const rows = (data ?? []) as ListingStatRow[];
    const stats: HeroStatsCounts = {
      total: count ?? rows.length,
      entrepreneurs: 0,
      investors: 0,
      jobs: 0,
      partners: 0,
      franchise: 0,
    };

    for (const row of rows) {
      const key = classify(row);
      if (key) stats[key] += 1;
    }

    return ok(stats);
  } catch (error) {
    console.error('[hero-stats]', error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    return apiError(message || 'İstatistikler alınamadı', 500);
  }
}
