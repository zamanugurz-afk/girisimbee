import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  investorListingBrowseQuerySchema,
  parseInvestorListingCreate,
} from '@/lib/api/validation/investor-listings';
import { traceListingPublish, logPublicationState, tracePublishFailure } from '@/lib/debug/listing-publish-trace';
import { stripListingsContactPhone } from '@/features/contact-requests/lib/strip-listing-phone';

/** GET — browse thesis listings or entrepreneur startups; POST — create thesis listing */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = investorListingBrowseQuerySchema.parse(Object.fromEntries(url.searchParams));
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  if (query.module === 'startups') {
    const result = await container.ecosystem.investorService.browseStartups({
      city: query.city,
      industry: query.sector,
    });
    return ok({ listings: stripListingsContactPhone(result.data), pagination: result });
  }

  const result = await container.ecosystem.investorService.browseThesisListings({
    city: query.city,
    district: query.district,
    sector: query.sector,
    stage: query.stage,
    minimumInvestment: query.minimumInvestment,
    maximumInvestment: query.maximumInvestment,
  });

  return ok({ listings: stripListingsContactPhone(result.data), pagination: result });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  traceListingPublish('investors', 'api_input', { input: body });

  const parsed = parseInvestorListingCreate(body);
  traceListingPublish('investors', 'api_validated', { payload: parsed });

  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';
  traceListingPublish('investors', 'publish_intent', {
    payload: { publishNow, expected_status: publishNow ? 'published' : 'draft' },
  });

  try {
    const listing = await ctx.container.ecosystem.investorService.createThesisListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      listing: parsed,
      asDraft: !publishNow,
    });

    logPublicationState('investors', 'after_insert', {
      status: listing.status,
      published_at: listing.publishedAt,
      reviewed_at: null,
      deleted_at: listing.deletedAt,
    });
    return created({ listing });
  } catch (error) {
    tracePublishFailure('investors', 'api_create', error, { publishNow });
    throw error;
  }
});
