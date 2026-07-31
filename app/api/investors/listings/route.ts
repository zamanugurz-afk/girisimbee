import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  investorListingBrowseQuerySchema,
  parseInvestorListingCreate,
} from '@/lib/api/validation/investor-listings';

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
    return ok({ listings: result.data, pagination: result });
  }

  const result = await container.ecosystem.investorService.browseThesisListings({
    city: query.city,
    district: query.district,
    sector: query.sector,
    stage: query.stage,
    minimumInvestment: query.minimumInvestment,
    maximumInvestment: query.maximumInvestment,
  });

  return ok({ listings: result.data, pagination: result });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = parseInvestorListingCreate(body);
  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';

  const listing = await ctx.container.ecosystem.investorService.createThesisListing({
    ownerId: ctx.userId,
    profileId: ctx.profileId,
    listing: parsed,
    asDraft: !publishNow,
  });

  return created({ listing });
});
