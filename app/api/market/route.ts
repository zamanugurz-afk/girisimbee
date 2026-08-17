import { createClient } from '@/lib/supabase/server';
import { ok } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { listPublishedMarketItems } from '@/features/admin/market/lib/market-repository';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';
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

/** Public — published MARKET cards (max 5). Falls back to seed when DB empty/unavailable. */
export async function GET() {
  try {
    const supabase = createClient();
    const items = await listPublishedMarketItems(supabase);
    if (items.length === 0) {
      return ok({ items: getMockPublishedMarketItems() });
    }
    return ok({ items: items.map(toPublicMarketItem) });
  } catch (err) {
    if (isDynamicServerUsageError(err)) throw err;
    if (err instanceof Error && /relation|does not exist|schema cache/i.test(err.message)) {
      return ok({ items: getMockPublishedMarketItems() });
    }
    return handleApiError(err);
  }
}
