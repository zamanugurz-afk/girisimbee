import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { createMatchSchema, matchListQuerySchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = matchListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const { matchService } = ctx.container.ecosystem;

  if (query.listingId) {
    const matches = await matchService.findForListing(ids.listing(query.listingId));
    return ok({ matches });
  }

  const matches = await matchService.findForProfile(ctx.profileId);
  return ok({ matches });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = createMatchSchema.parse(body);
  const { matchService } = ctx.container.ecosystem;

  const match = await matchService.create({
    moduleKey: parsed.moduleKey,
    initiatorProfileId: ctx.profileId,
    targetProfileId: ids.profile(parsed.targetProfileId),
    listingId: parsed.listingId ? ids.listing(parsed.listingId) : null,
    targetListingId: parsed.targetListingId ? ids.listing(parsed.targetListingId) : null,
    score: parsed.score ?? null,
    metadata: parsed.metadata,
  });

  return created({ match });
});
