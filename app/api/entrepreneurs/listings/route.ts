import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  entrepreneurListingBrowseQuerySchema,
  parseEntrepreneurListingCreate,
} from '@/lib/api/validation/entrepreneur-listings';
import { ids } from '@/lib/domain/ids';

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
  const parsed = parseEntrepreneurListingCreate(body);
  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';

  const listing = await ctx.container.ecosystem.entrepreneurService.createStartupListing({
    ownerId: ctx.userId,
    profileId: ctx.profileId,
    listing: parsed,
    pitchDeckDocumentId: parsed.pitchDeckDocumentId ? ids.document(parsed.pitchDeckDocumentId) : null,
    asDraft: !publishNow,
  });

  return created({ listing });
});
