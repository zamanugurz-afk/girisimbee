'use server';

import { runAuthenticatedAction } from '@/lib/api/action-handler';
import { packageCheckoutSchema, unlockCheckoutSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export async function createPackageCheckoutAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = packageCheckoutSchema.parse(input);
    const checkout = await ctx.container.ecosystem.paymentService.createCheckoutSession({
      userId: ctx.userId,
      packageSlug: parsed.packageSlug,
      successUrl: parsed.successUrl,
      cancelUrl: parsed.cancelUrl,
    });
    return { checkout };
  });
}

export async function createUnlockCheckoutAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = unlockCheckoutSchema.parse(input);
    const result = await ctx.container.ecosystem.paymentService.createUnlockCheckout({
      userId: ctx.userId,
      applicationId: parsed.applicationId,
      amountCents: parsed.amountCents,
      successUrl: parsed.successUrl,
      cancelUrl: parsed.cancelUrl,
    });
    return { checkout: result.checkout, payment: result.payment };
  });
}

export async function getPaymentStatusAction(sessionId: string) {
  return runAuthenticatedAction(async (ctx) => {
    const status = await ctx.container.ecosystem.paymentService.getPaymentStatus(sessionId);
    return { status };
  });
}

export async function getPaymentAction(id: string) {
  return runAuthenticatedAction(async (ctx) => {
    const payment = await ctx.container.ecosystem.paymentService.getPaymentById(ids.payment(id));
    return { payment };
  });
}
