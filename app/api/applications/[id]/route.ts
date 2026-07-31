import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema, applicationTransitionSchema, applicationUnlockSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const applicationId = ids.application(id);
  const { applicationService } = ctx.container.ecosystem;

  try {
    const view = await applicationService.getUnlockedView(applicationId, ctx.profileId);
    return ok({ application: view, unlocked: true });
  } catch {
    const view = await applicationService.getAnonymousView(applicationId, ctx.profileId);
    return ok({ application: view, unlocked: false });
  }
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const applicationId = ids.application(id);
  const { applicationService } = ctx.container.ecosystem;

  const action = 'action' in (body as object) ? applicationTransitionSchema.parse(body).action : null;
  const unlockBody = 'paymentId' in (body as object) ? applicationUnlockSchema.safeParse(body) : null;

  if (unlockBody?.success) {
    const application = await applicationService.unlock(
      applicationId,
      ctx.profileId,
      ids.payment(unlockBody.data.paymentId),
    );
    return ok({ application });
  }

  switch (action) {
    case 'review': {
      const application = await applicationService.markReviewing(applicationId, ctx.profileId);
      return ok({ application });
    }
    case 'contact': {
      const result = await applicationService.contact(applicationId, ctx.profileId);
      return ok({ application: result.application, contact: result.contact });
    }
    case 'withdraw': {
      const application = await applicationService.withdraw(applicationId, ctx.profileId);
      return ok({ application });
    }
    default:
      throw new ValidationError('Geçersiz eylem.', {
        action: ['review, contact, withdraw veya paymentId belirtin.'],
      });
  }
});
