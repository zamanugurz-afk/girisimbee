import { createClient } from '@/lib/supabase/server';
import { ok } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { listPublishedMarketItems } from '@/features/admin/market/lib/market-repository';

export const dynamic = 'force-dynamic';

function isDynamicServerUsageError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    (err as { digest?: unknown }).digest === 'DYNAMIC_SERVER_USAGE'
  );
}

/** Public — published MARKET cards (max 5). */
export async function GET() {
  try {
    const supabase = createClient();
    const items = await listPublishedMarketItems(supabase);
    return ok({ items });
  } catch (err) {
    if (isDynamicServerUsageError(err)) throw err;
    if (err instanceof Error && /relation|does not exist|schema cache/i.test(err.message)) {
      return ok({ items: [] });
    }
    return handleApiError(err);
  }
}
