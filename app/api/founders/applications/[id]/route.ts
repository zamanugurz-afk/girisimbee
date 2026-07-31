import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import {
  founderApplicationStatusUpdateSchema,
  founderApplicationNoteSchema,
  founderApplicationActionSchema,
} from '@/lib/api/validation/founder-applications';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const application = await ctx.container.ecosystem.founderApplicationService.getApplicationDetail(
    ids.match(id),
    ctx.profileId,
  );
  return ok({ application });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const matchId = ids.match(id);
  const service = ctx.container.ecosystem.founderApplicationService;

  const statusUpdate = founderApplicationStatusUpdateSchema.safeParse(body);
  if (statusUpdate.success) {
    const application = await service.updateApplicationStatus(
      matchId,
      ctx.profileId,
      statusUpdate.data.status,
      statusUpdate.data.note,
    );
    return ok({ application });
  }

  const noteBody = founderApplicationNoteSchema.safeParse(body);
  if (noteBody.success) {
    const application = await service.addApplicationNote(
      matchId,
      ctx.profileId,
      noteBody.data.note,
    );
    return ok({ application });
  }

  const actionBody = founderApplicationActionSchema.safeParse(body);
  if (actionBody.success && actionBody.data.action === 'withdraw') {
    const application = await service.withdrawApplication(matchId, ctx.profileId);
    return ok({ application });
  }

  throw new ValidationError('Geçersiz istek.', {
    body: ['status, note veya action (withdraw) belirtin.'],
  });
});
