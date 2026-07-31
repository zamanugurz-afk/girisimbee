import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/** POST — reveal external contact after match accepted */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const result = await ctx.container.ecosystem.investorApplicationService.contactParticipant(
    ids.match(id),
    ctx.profileId,
  );
  return ok(result);
});
