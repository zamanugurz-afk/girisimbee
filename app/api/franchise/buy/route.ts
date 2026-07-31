import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { franchiseBrowseQuerySchema, franchiseApplySchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/** Bayilik Al — browse franchise-give opportunities */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = franchiseBrowseQuerySchema.parse(Object.fromEntries(url.searchParams));

  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container = ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
  const listings = await container.ecosystem.franchiseService.browseBuyOpportunities({
    city: query.city,
    sector: query.sector,
  });

  return ok({ listings });
});

/** Bayilik Al — apply to a franchise-give listing */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = franchiseApplySchema.parse(body);
  const application = await ctx.container.ecosystem.franchiseService.submitApplication(
    ctx.profileId,
    ids.listing(parsed.listingId),
    parsed.coverMessage ?? undefined,
  );
  return created({ application });
});
