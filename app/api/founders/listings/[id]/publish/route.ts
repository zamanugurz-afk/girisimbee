import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { founderListingIdParamSchema } from '@/lib/api/validation/founder-listings';
import { ids } from '@/lib/domain/ids';

/** POST — publish draft co-founder listing */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const { id } = founderListingIdParamSchema.parse(params);

  const listing = await ctx.container.ecosystem.founderService.publishListingDraft(
    ctx.userId,
    ctx.profileId,
    ids.listing(id),
  );

  return ok({ listing });
});
