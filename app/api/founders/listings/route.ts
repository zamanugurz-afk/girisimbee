import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  parseFounderListingBrowseQuery,
  parseFounderListingCreate,
} from '@/lib/api/validation/founder-listings';
import { traceListingPublish, logPublicationState } from '@/lib/debug/listing-publish-trace';

/** GET — browse co-founder listings; POST — create co-founder listing */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = parseFounderListingBrowseQuery(Object.fromEntries(url.searchParams));
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const result = await container.ecosystem.founderService.browseCoFounderListings({
    city: query.city,
    district: query.district,
    sector: query.sector,
    stage: query.stage,
    skills: query.skills,
  });

  return ok({ listings: result.data, pagination: result });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  traceListingPublish('founders', 'api_input', { input: body });

  const parsed = parseFounderListingCreate(body);
  traceListingPublish('founders', 'api_validated', { payload: parsed });

  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';
  traceListingPublish('founders', 'publish_intent', {
    payload: { publishNow, expected_status: publishNow ? 'published' : 'draft' },
  });

  try {
    const listing = await ctx.container.ecosystem.founderService.createCofounderListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      listing: parsed,
      asDraft: !publishNow,
    });

    logPublicationState('founders', 'after_insert', {
      status: listing.status,
      published_at: listing.publishedAt,
      reviewed_at: null,
      deleted_at: listing.deletedAt,
    });
    return created({ listing });
  } catch (error) {
    traceListingPublish('founders', 'repository_exception', { error });
    throw error;
  }
});
