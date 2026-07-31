import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { employerListingIdParamSchema } from '@/lib/api/validation/employer-listings';
import { ids } from '@/lib/domain/ids';

/** POST — publish draft job listing */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const { id } = employerListingIdParamSchema.parse(params);

  const listing = await ctx.container.ecosystem.employerService.publishListingDraft(
    ctx.userId,
    ctx.profileId,
    ids.listing(id),
  );

  return ok({ listing });
});
