import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import {
  candidateApplicationNoteSchema,
  candidateApplicationActionSchema,
} from '@/lib/api/validation/candidate-applications';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const application = await ctx.container.ecosystem.candidateApplicationService.getApplicationDetail(
    ids.application(id),
    ctx.profileId,
  );
  return ok({ application });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const applicationId = ids.application(id);
  const service = ctx.container.ecosystem.candidateApplicationService;

  const noteBody = candidateApplicationNoteSchema.safeParse(body);
  if (noteBody.success) {
    const application = await service.addApplicationNote(
      applicationId,
      ctx.profileId,
      noteBody.data.note,
    );
    return ok({ application });
  }

  const actionBody = candidateApplicationActionSchema.safeParse(body);
  if (actionBody.success) {
    switch (actionBody.data.action) {
      case 'withdraw': {
        const application = await service.withdrawApplication(applicationId, ctx.profileId);
        return ok({ application });
      }
      case 'contact': {
        const result = await service.contactEmployer(applicationId, ctx.profileId);
        return ok(result);
      }
    }
  }

  throw new ValidationError('Geçersiz istek.', {
    body: ['note veya action (withdraw|contact) belirtin.'],
  });
});
