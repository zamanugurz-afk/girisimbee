import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import {
  investorListingIdParamSchema,
  parseInvestorListingUpdate,
} from '@/lib/api/validation/investor-listings';
import { ids } from '@/lib/domain/ids';

/** GET — thesis listing detail; PATCH — update thesis listing */
export const GET = withOptionalAuth(async (ctx, request, { params }) => {
  const { id } = investorListingIdParamSchema.parse(params);
  const url = new URL(request.url);
  const preview = url.searchParams.get('preview') === 'true';
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const detail = await container.ecosystem.investorService.getThesisDetail(id, {
    trackView: true,
    preview,
  });
  if (!detail) {
    return ok({ listing: null });
  }

  return ok({ listing: detail });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = investorListingIdParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = parseInvestorListingUpdate(body);

  const listing = await ctx.container.ecosystem.investorService.updateThesisListing({
    ownerId: ctx.userId,
    listingId: ids.listing(id),
    listing: parsed,
  });

  return ok({ listing });
});
