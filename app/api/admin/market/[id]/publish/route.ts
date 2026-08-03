import { createClient } from '@/lib/supabase/server';
import { ok, apiError } from '@/lib/api/response';
import { withMarketAdmin } from '@/features/admin/market/lib/with-market-admin';
import { publishMarketItem, unpublishMarketItem } from '@/features/admin/market/lib/market-repository';

type RouteCtx = { params: { id: string } };

export const POST = withMarketAdmin(
  async (_ctx, request, routeContext) => {
    const { id } = (routeContext as RouteCtx).params;
    const url = new URL(request.url);
    const action = url.searchParams.get('action') ?? 'publish';

    try {
      const supabase = createClient();
      const item =
        action === 'unpublish'
          ? await unpublishMarketItem(supabase, id)
          : await publishMarketItem(supabase, id);
      return ok({ item });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yayın işlemi başarısız.';
      return apiError(message, 400, { code: 'MARKET_PUBLISH_FAILED' });
    }
  },
  { write: true },
);
