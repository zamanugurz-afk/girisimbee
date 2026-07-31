import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created } from '@/lib/api/response';
import { parseFranchiseListingCreate } from '@/lib/api/validation/franchise-listings';

/** Create franchise listing (draft or publish via ?publish=true) */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = parseFranchiseListingCreate(body);
  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';
  const { flow, ...listingFields } = parsed;

  const listing = await ctx.container.ecosystem.franchiseService.createListing({
    ownerId: ctx.userId,
    profileId: ctx.profileId,
    flow,
    listing: listingFields,
    asDraft: !publishNow,
  });

  return created({ listing });
});
