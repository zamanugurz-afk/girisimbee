'use server';

import { runAuthenticatedAction } from '@/lib/api/action-handler';
import {
  publishJobSchema,
  employerApplicationsQuerySchema,
  employerUnlockCheckoutSchema,
} from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export async function publishEmployerJobAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = publishJobSchema.parse(input);
    const listing = await ctx.container.ecosystem.employerJobService.publishJob({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      listing: parsed,
    });
    return { listing };
  });
}

export async function listEmployerApplicationsAction(query: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = employerApplicationsQuerySchema.parse(query);
    const applications = await ctx.container.ecosystem.employerJobService.listAnonymousApplications(
      ids.listing(parsed.listingId),
      ctx.profileId,
    );
    return { applications };
  });
}

export async function purchaseEmployerUnlockAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = employerUnlockCheckoutSchema.parse(input);
    const result = await ctx.container.ecosystem.employerJobService.purchaseUnlock({
      userId: ctx.userId,
      applicationId: ids.application(parsed.applicationId),
      managerProfileId: ctx.profileId,
      amountCents: parsed.amountCents,
      successUrl: parsed.successUrl,
      cancelUrl: parsed.cancelUrl,
    });
    return { checkout: result.checkout, payment: result.payment };
  });
}

export async function unlockEmployerApplicationAction(applicationId: string, paymentId: string) {
  return runAuthenticatedAction(async (ctx) => {
    const view = await ctx.container.ecosystem.employerJobService.unlockApplication(
      ids.application(applicationId),
      ctx.profileId,
      ids.payment(paymentId),
    );
    return { application: view };
  });
}

export async function contactEmployerCandidateAction(applicationId: string) {
  return runAuthenticatedAction(async (ctx) => {
    const contact = await ctx.container.ecosystem.employerJobService.contactCandidate(
      ids.application(applicationId),
      ctx.profileId,
    );
    return { contact };
  });
}
