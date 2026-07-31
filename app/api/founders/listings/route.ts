import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  parseFounderListingBrowseQuery,
  parseFounderListingCreate,
} from '@/lib/api/validation/founder-listings';

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
  const parsed = parseFounderListingCreate(body);
  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';

  const listing = await ctx.container.ecosystem.founderService.createCofounderListing({
    ownerId: ctx.userId,
    profileId: ctx.profileId,
    listing: parsed,
    asDraft: !publishNow,
  });

  return created({ listing });
});
