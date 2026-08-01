import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created } from '@/lib/api/response';
import { parseFranchiseListingCreate } from '@/lib/api/validation/franchise-listings';
import { traceListingPublish, logPublicationState } from '@/lib/debug/listing-publish-trace';

/** Create franchise listing (draft or publish via ?publish=true) */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  traceListingPublish('franchise', 'api_input', { input: body });

  const parsed = parseFranchiseListingCreate(body);
  traceListingPublish('franchise', 'api_validated', { payload: parsed });

  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';
  traceListingPublish('franchise', 'publish_intent', {
    payload: { publishNow, expected_status: publishNow ? 'published' : 'draft' },
  });
  const { flow, ...listingFields } = parsed;

  try {
    const listing = await ctx.container.ecosystem.franchiseService.createListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      flow,
      listing: listingFields,
      asDraft: !publishNow,
    });

    logPublicationState('franchise', 'after_insert', {
      status: listing.status,
      published_at: listing.publishedAt,
      reviewed_at: null,
      deleted_at: listing.deletedAt,
    });
    return created({ listing });
  } catch (error) {
    traceListingPublish('franchise', 'repository_exception', { error });
    throw error;
  }
});
