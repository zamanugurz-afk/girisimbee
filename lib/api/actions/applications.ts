'use server';

import { ValidationError } from '@/lib/domain/errors';
import { ids } from '@/lib/domain/ids';
import { runAuthenticatedAction } from '@/lib/api/action-handler';
import {
  submitApplicationSchema,
  applicationListQuerySchema,
  applicationTransitionSchema,
  applicationUnlockSchema,
} from '@/lib/api/validation';

export async function listApplicationsAction(query: unknown = {}) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = applicationListQuerySchema.parse(query);
    const { applicationService } = ctx.container.ecosystem;

    if (parsed.listingId) {
      const applications = await applicationService.listForListing(ids.listing(parsed.listingId));
      return { applications };
    }

    const applications = await applicationService.listForApplicant(ctx.profileId);
    return { applications };
  });
}

export async function submitApplicationAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = submitApplicationSchema.parse(input);
    const application = await ctx.container.ecosystem.applicationService.submit({
      moduleKey: 'candidates',
      listingId: ids.listing(parsed.listingId),
      applicantProfileId: ctx.profileId,
      coverMessage: parsed.coverMessage ?? null,
      metadata: parsed.metadata,
    });
    return { application };
  });
}

export async function getApplicationAction(id: string) {
  return runAuthenticatedAction(async (ctx) => {
    const applicationId = ids.application(id);
    const { applicationService } = ctx.container.ecosystem;

    try {
      const application = await applicationService.getUnlockedView(applicationId, ctx.profileId);
      return { application, unlocked: true as const };
    } catch {
      const application = await applicationService.getAnonymousView(applicationId, ctx.profileId);
      return { application, unlocked: false as const };
    }
  });
}

export async function transitionApplicationAction(id: string, input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const applicationId = ids.application(id);
    const { applicationService } = ctx.container.ecosystem;

    const unlockBody = applicationUnlockSchema.safeParse(input);
    if (unlockBody.success) {
      const application = await applicationService.unlock(
        applicationId,
        ctx.profileId,
        ids.payment(unlockBody.data.paymentId),
      );
      return { application };
    }

    const { action } = applicationTransitionSchema.parse(input);
    switch (action) {
      case 'review':
        return { application: await applicationService.markReviewing(applicationId, ctx.profileId) };
      case 'contact': {
        const result = await applicationService.contact(applicationId, ctx.profileId);
        return { application: result.application, contact: result.contact };
      }
      case 'withdraw':
        return { application: await applicationService.withdraw(applicationId, ctx.profileId) };
      default:
        throw new ValidationError('Geçersiz eylem.', {
          action: ['review, contact, withdraw veya paymentId belirtin.'],
        });
    }
  });
}
