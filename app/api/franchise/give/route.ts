import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  franchisePublishSchema,
  franchiseApplicationsQuerySchema,
} from '@/lib/api/validation';
import { franchiseListingBrowseQuerySchema } from '@/lib/api/validation/franchise-listings';
import { ids } from '@/lib/domain/ids';
import { stripListingsContactPhone } from '@/features/contact-requests/lib/strip-listing-phone';

/** Bayilik Ver — browse franchise-buy seekers or list applications for own listing */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container = ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
  const { franchiseService } = container.ecosystem;

  const appsQuery = franchiseApplicationsQuerySchema.safeParse(params);
  if (appsQuery.success && ctx) {
    const applications = await container.ecosystem.franchiseApplicationService.listApplicationsForListing(
      ids.listing(appsQuery.data.listingId),
      ctx.profileId,
      {
        status: appsQuery.data.status,
        submittedAfter: appsQuery.data.submittedAfter,
        submittedBefore: appsQuery.data.submittedBefore,
      },
    );
    return ok({ applications });
  }

  const query = franchiseListingBrowseQuerySchema.parse(params);
  const result = await franchiseService.browseGiveSeekers({
    city: query.city,
    district: query.district,
    sector: query.sector,
  });
  return ok({
    listings: { ...result, data: stripListingsContactPhone(result.data) },
  });
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
