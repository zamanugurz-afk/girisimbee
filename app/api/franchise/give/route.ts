import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  franchiseBrowseQuerySchema,
  franchisePublishSchema,
  franchiseApplicationsQuerySchema,
} from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/** Bayilik Ver — browse franchise-buy seekers or list applications for own listing */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container = ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
  const { franchiseService, applicationService } = container.ecosystem;

  const appsQuery = franchiseApplicationsQuerySchema.safeParse(params);
  if (appsQuery.success && ctx) {
    const applications = await applicationService.listForListing(ids.listing(appsQuery.data.listingId));
    return ok({ applications });
  }

  const query = franchiseBrowseQuerySchema.parse(params);
  const listings = await franchiseService.browseGiveSeekers({ city: query.city });
  return ok({ listings });
});

/** Bayilik Ver — publish franchise-give listing */
export const POST = withAuth(async (ctx, request) => {
  const body = (await parseJsonBody(request)) as Record<string, unknown>;
  const parsed = franchisePublishSchema.parse({ ...body, flow: 'give' });
  const { pitchDeckDocumentId: _pd, flow: _flow, ...listingFields } = parsed;

  const listing = await ctx.container.ecosystem.franchiseService.publishListing({
    ownerId: ctx.userId,
    profileId: ctx.profileId,
    flow: 'give',
    listing: listingFields,
  });

  return created({ listing });
});
