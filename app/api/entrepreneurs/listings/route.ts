import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  entrepreneurListingBrowseQuerySchema,
  parseEntrepreneurListingCreate,
} from '@/lib/api/validation/entrepreneur-listings';
import { ids } from '@/lib/domain/ids';
import { traceListingPublish, logPublicationState } from '@/lib/debug/listing-publish-trace';

/** GET — browse published startup listings */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = entrepreneurListingBrowseQuerySchema.parse(Object.fromEntries(url.searchParams));
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const result = await container.ecosystem.entrepreneurService.browseStartups({
    city: query.city,
    district: query.district,
    sector: query.sector,
    stage: query.stage,
  });

  return ok({ listings: result.data, pagination: result });
});

/** POST — create startup listing (draft or publish via ?publish=true) */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  traceListingPublish('entrepreneurs', 'api_input', { input: body });

  const parsed = parseEntrepreneurListingCreate(body);
  traceListingPublish('entrepreneurs', 'api_validated', { payload: parsed });

  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';
  traceListingPublish('entrepreneurs', 'publish_intent', {
    payload: { publishNow, expected_status: publishNow ? 'published' : 'draft' },
  });

  try {
    const listing = await ctx.container.ecosystem.entrepreneurService.createStartupListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      listing: parsed,
      pitchDeckDocumentId: parsed.pitchDeckDocumentId ? ids.document(parsed.pitchDeckDocumentId) : null,
      asDraft: !publishNow,
    });

    logPublicationState('entrepreneurs', 'after_insert', {
      status: listing.status,
      published_at: listing.publishedAt,
      reviewed_at: null,
      deleted_at: listing.deletedAt,
    });
    return created({ listing });
  } catch (error) {
    traceListingPublish('entrepreneurs', 'repository_exception', { error });
    throw error;
  }
});
