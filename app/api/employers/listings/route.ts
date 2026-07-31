import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  employerListingBrowseQuerySchema,
  parseEmployerListingCreate,
} from '@/lib/api/validation/employer-listings';

/** GET — browse published job listings */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = employerListingBrowseQuerySchema.parse(Object.fromEntries(url.searchParams));
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const result = await container.ecosystem.employerService.browseJobs({
    city: query.city,
    district: query.district,
    sector: query.sector,
    remotePolicy: query.remotePolicy,
  });

  return ok({ listings: result.data, pagination: result });
});

/** POST — create job listing (draft or publish via ?publish=true) */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = parseEmployerListingCreate(body);
  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';

  const listing = await ctx.container.ecosystem.employerService.createJobListing({
    ownerId: ctx.userId,
    profileId: ctx.profileId,
    listing: parsed,
    asDraft: !publishNow,
  });

  return created({ listing });
});
