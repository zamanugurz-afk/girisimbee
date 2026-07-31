import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { franchiseListingIdParamSchema } from '@/lib/api/validation/franchise-listings';
import { z } from 'zod';
import { ids } from '@/lib/domain/ids';

const publishBodySchema = z.object({
  flow: z.enum(['buy', 'give']),
});

/** Publish a draft franchise listing */
export const POST = withAuth(async (ctx, request, { params }) => {
  const { id } = franchiseListingIdParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const { flow } = publishBodySchema.parse(body);

  const listing = await ctx.container.ecosystem.franchiseService.publishListingDraft(
    ctx.userId,
    ctx.profileId,
    ids.listing(id),
    flow,
  );

  return ok({ listing });
});
