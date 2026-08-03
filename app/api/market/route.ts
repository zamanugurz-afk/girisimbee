import { createClient } from '@/lib/supabase/server';
import { ok } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { listPublishedMarketItems } from '@/features/admin/market/lib/market-repository';

/** Public — published MARKET cards (max 5). */
export async function GET() {
  try {
    const supabase = createClient();
    const items = await listPublishedMarketItems(supabase);
    return ok({ items });
  } catch (err) {
    if (err instanceof Error && /relation|does not exist|schema cache/i.test(err.message)) {
      return ok({ items: [] });
    }
    return handleApiError(err);
  }
}
