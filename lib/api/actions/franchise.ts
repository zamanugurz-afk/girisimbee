'use server';

import { runAuthenticatedAction, runOptionalAuthAction } from '@/lib/api/action-handler';
import {
  franchiseBrowseQuerySchema,
  franchiseApplySchema,
  franchisePublishSchema,
  franchiseApplicationsQuerySchema,
} from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/** Bayilik Al — browse franchise-give opportunities */
export async function browseFranchiseBuyAction(query: unknown = {}) {
  return runOptionalAuthAction(async (ctx) => {
    const parsed = franchiseBrowseQuerySchema.parse(query);
    const supabase = (await import('@/lib/supabase/server')).createClient();
    const container =
      ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
    const listings = await container.ecosystem.franchiseService.browseBuyOpportunities({
      city: parsed.city,
      sector: parsed.sector,
    });
    return { listings };
  });
}

/** Bayilik Al — apply to franchise-give listing */
export async function applyFranchiseBuyAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = franchiseApplySchema.parse(input);
    const application = await ctx.container.ecosystem.franchiseService.submitApplication(
      ctx.profileId,
      ids.listing(parsed.listingId),
      parsed.coverMessage ?? undefined,
    );
    return { application };
  });
}

/** Bayilik Ver — browse franchise-buy seekers */
export async function browseFranchiseGiveAction(query: unknown = {}) {
  return runOptionalAuthAction(async (ctx) => {
    const parsed = franchiseBrowseQuerySchema.parse(query);
    const supabase = (await import('@/lib/supabase/server')).createClient();
    const container =
      ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
    const listings = await container.ecosystem.franchiseService.browseGiveSeekers({ city: parsed.city });
    return { listings };
  });
}

/** Bayilik Ver — publish franchise listing */
export async function publishFranchiseGiveAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = franchisePublishSchema.parse(input);
    const { flow, ...listingFields } = parsed;
    const listing = await ctx.container.ecosystem.franchiseService.publishListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      flow,
      listing: listingFields,
    });
    return { listing };
  });
}

/** Bayilik Ver — list applications for a listing */
export async function listFranchiseApplicationsAction(query: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = franchiseApplicationsQuerySchema.parse(query);
    const applications = await ctx.container.ecosystem.applicationService.listForListing(
      ids.listing(parsed.listingId),
    );
    return { applications };
  });
}

/** External contact after franchise application */
export async function contactFranchiseApplicationAction(applicationId: string) {
  return runAuthenticatedAction(async (ctx) => {
    const contact = await ctx.container.ecosystem.franchiseService.contactAfterApplication(
      ids.application(applicationId),
      ctx.profileId,
    );
    return { contact };
  });
}
