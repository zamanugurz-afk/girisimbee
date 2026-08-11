import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  candidateListingBrowseQuerySchema,
  parseCandidateListingCreate,
} from '@/lib/api/validation/candidate-listings';
import { traceListingPublish, logPublicationState } from '@/lib/debug/listing-publish-trace';
import { getRequestClientMeta } from '@/lib/api/request-meta';
import { stripListingsContactPhone } from '@/features/contact-requests/lib/strip-listing-phone';

/** GET — browse published candidate listings */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = candidateListingBrowseQuerySchema.parse(Object.fromEntries(url.searchParams));
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const result = await container.ecosystem.candidateService.browseCandidateListings({
    city: query.city,
    district: query.district,
  });

  return ok({ listings: stripListingsContactPhone(result.data), pagination: result });
});

/** POST — create candidate listing (draft or publish via ?publish=true) */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  traceListingPublish('candidates', 'api_input', { input: body });

  const parsed = parseCandidateListingCreate(body);
  traceListingPublish('candidates', 'api_validated', { payload: parsed });

  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';
  traceListingPublish('candidates', 'publish_intent', {
    payload: { publishNow, expected_status: publishNow ? 'published' : 'draft' },
  });

  const clientMeta = getRequestClientMeta(request);

  try {
    const listing = await ctx.container.ecosystem.candidateService.createCandidateListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      listing: parsed,
      asDraft: !publishNow,
      consentContext: clientMeta,
    });

    logPublicationState('candidates', 'after_insert', {
      status: listing.status,
      published_at: listing.publishedAt,
      reviewed_at: null,
      deleted_at: listing.deletedAt,
    });
    return created({ listing });
  } catch (error) {
    traceListingPublish('candidates', 'repository_exception', { error });
    throw error;
  }
});
