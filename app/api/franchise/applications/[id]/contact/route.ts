import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/** External contact channels — phone, WhatsApp, email, website (no internal messaging) */
export const POST = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const result = await ctx.container.ecosystem.franchiseApplicationService.contactApplicant(
    ids.application(id),
    ctx.profileId,
  );
  return ok({ application: result.application, contact: result.contact });
});
