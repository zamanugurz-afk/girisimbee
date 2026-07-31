'use server';

import { runAuthenticatedAction, runOptionalAuthAction } from '@/lib/api/action-handler';
import {
  franchiseApplySchema,
  franchisePublishSchema,
  franchiseApplicationsQuerySchema,
} from '@/lib/api/validation';
import {
  parseFranchiseListingCreate,
  parseFranchiseListingUpdate,
  franchiseListingBrowseQuerySchema,
} from '@/lib/api/validation/franchise-listings';
import { ids } from '@/lib/domain/ids';

/** Bayilik Al — browse franchise-give opportunities */
export async function browseFranchiseBuyAction(query: unknown = {}) {
  return runOptionalAuthAction(async (ctx) => {
    const parsed = franchiseListingBrowseQuerySchema.parse(query);
    const supabase = (await import('@/lib/supabase/server')).createClient();
    const container =
      ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
    const listings = await container.ecosystem.franchiseService.browseBuyOpportunities(parsed);
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
    const parsed = franchiseListingBrowseQuerySchema.parse(query);
    const supabase = (await import('@/lib/supabase/server')).createClient();
    const container =
      ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
    const listings = await container.ecosystem.franchiseService.browseGiveSeekers(parsed);
    return { listings };
  });
}

/** Create franchise listing (draft by default) */
export async function createFranchiseListingAction(input: unknown, publish = false) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = parseFranchiseListingCreate(input);
    const { flow, ...listingFields } = parsed;
    const listing = await ctx.container.ecosystem.franchiseService.createListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      flow,
      listing: listingFields,
      asDraft: !publish,
    });
    return { listing };
  });
}

/** Update franchise listing */
export async function updateFranchiseListingAction(listingId: string, input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = parseFranchiseListingUpdate(input);
    const { flow, ...listingFields } = parsed;
    const listing = await ctx.container.ecosystem.franchiseService.updateListing({
      ownerId: ctx.userId,
      listingId: ids.listing(listingId),
      flow,
      listing: listingFields,
    });
    return { listing };
  });
}

/** Publish draft franchise listing */
export async function publishFranchiseListingDraftAction(listingId: string, flow: 'buy' | 'give') {
  return runAuthenticatedAction(async (ctx) => {
    const listing = await ctx.container.ecosystem.franchiseService.publishListingDraft(
      ctx.userId,
      ctx.profileId,
      ids.listing(listingId),
      flow,
    );
    return { listing };
  });
}

/** Get franchise listing detail */
export async function getFranchiseListingDetailAction(idOrSlug: string) {
  return runOptionalAuthAction(async (ctx) => {
    const supabase = (await import('@/lib/supabase/server')).createClient();
    const container =
      ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
    const detail = await container.ecosystem.franchiseService.getListingDetail(idOrSlug);
    return { detail };
  });
}

/** Bayilik Ver — publish franchise listing (immediate publish) */
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
    const applications = await ctx.container.ecosystem.franchiseApplicationService.listApplicationsForListing(
      ids.listing(parsed.listingId),
      ctx.profileId,
      {
        status: parsed.status,
        submittedAfter: parsed.submittedAfter,
        submittedBefore: parsed.submittedBefore,
      },
    );
    return { applications };
  });
}

/** External contact after franchise application */
export async function contactFranchiseApplicationAction(applicationId: string) {
  return runAuthenticatedAction(async (ctx) => {
    const result = await ctx.container.ecosystem.franchiseApplicationService.contactApplicant(
      ids.application(applicationId),
      ctx.profileId,
    );
    return { application: result.application, contact: result.contact };
  });
}
