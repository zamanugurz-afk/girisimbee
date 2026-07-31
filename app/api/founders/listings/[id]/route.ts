import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import {
  founderListingIdParamSchema,
  parseFounderListingUpdate,
} from '@/lib/api/validation/founder-listings';
import { ids } from '@/lib/domain/ids';

/** GET — co-founder listing detail; PATCH — update listing */
export const GET = withOptionalAuth(async (ctx, request, { params }) => {
  const { id } = founderListingIdParamSchema.parse(params);
  const url = new URL(request.url);
  const preview = url.searchParams.get('preview') === 'true';
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const detail = await container.ecosystem.founderService.getCofounderDetail(id, {
    trackView: true,
    preview,
  });
  if (!detail) {
    return ok({ listing: null });
  }

  return ok({ listing: detail });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = founderListingIdParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = parseFounderListingUpdate(body);

  const listing = await ctx.container.ecosystem.founderService.updateCofounderListing({
    ownerId: ctx.userId,
    listingId: ids.listing(id),
    listing: parsed,
  });

  return ok({ listing });
});
