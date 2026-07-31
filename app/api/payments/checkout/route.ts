import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created } from '@/lib/api/response';
import { packageCheckoutSchema } from '@/lib/api/validation';

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = packageCheckoutSchema.parse(body);
  const session = await ctx.container.ecosystem.paymentService.createCheckoutSession({
    userId: ctx.userId,
    packageSlug: parsed.packageSlug,
    successUrl: parsed.successUrl,
    cancelUrl: parsed.cancelUrl,
  });
  return created({ checkout: session });
});
