import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import {
  franchiseApplicationStatusUpdateSchema,
  franchiseApplicationNoteSchema,
  franchiseApplicationActionSchema,
} from '@/lib/api/validation/franchise-applications';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const application = await ctx.container.ecosystem.franchiseApplicationService.getApplicationDetail(
    ids.application(id),
    ctx.profileId,
  );
  return ok({ application });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const applicationId = ids.application(id);
  const service = ctx.container.ecosystem.franchiseApplicationService;

  const statusUpdate = franchiseApplicationStatusUpdateSchema.safeParse(body);
  if (statusUpdate.success) {
    const application = await service.updateApplicationStatus(
      applicationId,
      ctx.profileId,
      statusUpdate.data.status,
      statusUpdate.data.note,
    );
    return ok({ application });
  }

  const noteBody = franchiseApplicationNoteSchema.safeParse(body);
  if (noteBody.success) {
    const application = await service.addApplicationNote(
      applicationId,
      ctx.profileId,
      noteBody.data.note,
    );
    return ok({ application });
  }

  const actionBody = franchiseApplicationActionSchema.safeParse(body);
  if (actionBody.success) {
    switch (actionBody.data.action) {
      case 'review': {
        const application = await service.markReviewing(applicationId, ctx.profileId);
        return ok({ application });
      }
      case 'withdraw': {
        const application = await service.withdrawApplication(applicationId, ctx.profileId);
        return ok({ application });
      }
    }
  }

  throw new ValidationError('Geçersiz istek.', {
    body: ['status, note veya action (review|withdraw) belirtin.'],
  });
});
