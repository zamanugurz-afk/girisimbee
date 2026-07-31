import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created } from '@/lib/api/response';
import { unlockCheckoutSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = unlockCheckoutSchema.parse(body);
  const result = await ctx.container.ecosystem.paymentService.createUnlockCheckout({
    userId: ctx.userId,
    applicationId: parsed.applicationId,
    amountCents: parsed.amountCents,
    successUrl: parsed.successUrl,
    cancelUrl: parsed.cancelUrl,
  });
  return created({ checkout: result.checkout, payment: result.payment });
});
