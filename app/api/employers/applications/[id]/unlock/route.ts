import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { idParamSchema, employerUnlockCheckoutSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export const POST = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = employerUnlockCheckoutSchema.parse(body);

  const result = await ctx.container.ecosystem.employerJobService.purchaseUnlock({
    userId: ctx.userId,
    applicationId: ids.application(id),
    managerProfileId: ctx.profileId,
    amountCents: parsed.amountCents,
    successUrl: parsed.successUrl,
    cancelUrl: parsed.cancelUrl,
  });

  return created({ checkout: result.checkout, payment: result.payment });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const paymentId = (body as { paymentId?: string }).paymentId;

  if (!paymentId) {
    const contact = await ctx.container.ecosystem.employerJobService.contactCandidate(
      ids.application(id),
      ctx.profileId,
    );
    return ok({ contact });
  }

  const view = await ctx.container.ecosystem.employerJobService.unlockApplication(
    ids.application(id),
    ctx.profileId,
    ids.payment(paymentId),
  );

  return ok({ application: view });
});
