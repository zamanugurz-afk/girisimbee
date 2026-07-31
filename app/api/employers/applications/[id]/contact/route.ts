import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/** POST — external contact after unlock */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const result = await ctx.container.ecosystem.employerApplicationService.contactCandidate(
    ids.application(id),
    ctx.profileId,
  );
  return ok(result);
});
