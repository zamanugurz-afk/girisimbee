import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { franchiseListingIdParamSchema, parseFranchiseListingUpdate } from '@/lib/api/validation/franchise-listings';
import { ids } from '@/lib/domain/ids';

/** Get franchise listing detail by id */
export const GET = withOptionalAuth(async (ctx, _request, { params }) => {
  const { id } = franchiseListingIdParamSchema.parse(params);
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const detail = await container.ecosystem.franchiseService.getListingDetail(id);
  if (!detail) {
    return ok({ listing: null });
  }

  return ok({ listing: detail });
});

/** Update franchise listing (draft or published) */
export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = franchiseListingIdParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = parseFranchiseListingUpdate(body);
  const { flow, ...listingFields } = parsed;

  const listing = await ctx.container.ecosystem.franchiseService.updateListing({
    ownerId: ctx.userId,
    listingId: ids.listing(id),
    flow,
    listing: listingFields,
  });

  return ok({ listing });
});
