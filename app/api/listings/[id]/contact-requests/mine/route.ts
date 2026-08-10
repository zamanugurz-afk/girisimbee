import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';

/** GET — current user's contact request for this listing */
export const GET = withAuth(async (ctx, _request, { params }) => {
  const listingId = ids.listing(params.id);
  const view = await ctx.container.contactRequestService.getMineForListing(
    listingId,
    ctx.userId,
  );
  return ok({ request: view });
});
