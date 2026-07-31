import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { investorListingIdParamSchema } from '@/lib/api/validation/investor-listings';
import { ids } from '@/lib/domain/ids';

/** POST — publish draft thesis listing */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const { id } = investorListingIdParamSchema.parse(params);

  const listing = await ctx.container.ecosystem.investorService.publishListingDraft(
    ctx.userId,
    ctx.profileId,
    ids.listing(id),
  );

  return ok({ listing });
});
