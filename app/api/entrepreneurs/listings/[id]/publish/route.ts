import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { entrepreneurListingIdParamSchema } from '@/lib/api/validation/entrepreneur-listings';
import { ids } from '@/lib/domain/ids';

/** POST — publish draft startup listing */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const { id } = entrepreneurListingIdParamSchema.parse(params);

  const listing = await ctx.container.ecosystem.entrepreneurService.publishListingDraft(
    ctx.userId,
    ctx.profileId,
    ids.listing(id),
  );

  return ok({ listing });
});
