import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/** GET — download CV metadata + storage path */
export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const download = await ctx.container.ecosystem.candidateCvService.downloadCv(
    ids.document(id),
    ctx.profileId,
  );
  return ok({ download });
});
