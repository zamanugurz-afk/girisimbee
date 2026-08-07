import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import {
  employerListingIdParamSchema,
  parseEmployerListingUpdate,
} from '@/lib/api/validation/employer-listings';
import { ids } from '@/lib/domain/ids';
import { trackListingViewFromRequest } from '@/features/listings/lib/track-listing-view';

/** GET — job listing detail by id or slug */
export const GET = withOptionalAuth(async (ctx, request, { params }) => {
  const { id } = employerListingIdParamSchema.parse(params);
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const detail = await container.ecosystem.employerService.getJobDetail(id, { trackView: false });
  if (!detail) {
    return ok({ listing: null });
  }

  await trackListingViewFromRequest({
    container,
    request,
    listingId: detail.listing.id,
    viewerId: ctx?.userId ?? null,
    published: detail.listing.status === 'published',
  });

  return ok({ listing: detail });
});

/** PATCH — update job listing */
export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = employerListingIdParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = parseEmployerListingUpdate(body);

  const listing = await ctx.container.ecosystem.employerService.updateJobListing({
    ownerId: ctx.userId,
    listingId: ids.listing(id),
    listing: parsed,
  });

  return ok({ listing });
});
