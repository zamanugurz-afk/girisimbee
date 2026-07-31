'use server';

import { ValidationError } from '@/lib/domain/errors';
import { ids } from '@/lib/domain/ids';
import { runAuthenticatedAction } from '@/lib/api/action-handler';
import { createMatchSchema, matchTransitionSchema, matchListQuerySchema } from '@/lib/api/validation';

export async function listMatchesAction(query: unknown = {}) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = matchListQuerySchema.parse(query);
    const { matchService } = ctx.container.ecosystem;

    if (parsed.listingId) {
      const matches = await matchService.findForListing(ids.listing(parsed.listingId));
      return { matches };
    }

    const matches = await matchService.findForProfile(ctx.profileId);
    return { matches };
  });
}

export async function createMatchAction(input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = createMatchSchema.parse(input);
    const match = await ctx.container.ecosystem.matchService.create({
      moduleKey: parsed.moduleKey,
      initiatorProfileId: ctx.profileId,
      targetProfileId: ids.profile(parsed.targetProfileId),
      listingId: parsed.listingId ? ids.listing(parsed.listingId) : null,
      targetListingId: parsed.targetListingId ? ids.listing(parsed.targetListingId) : null,
      score: parsed.score ?? null,
      metadata: parsed.metadata,
    });
    return { match };
  });
}

export async function getMatchAction(id: string) {
  return runAuthenticatedAction(async (ctx) => {
    const match = await ctx.container.ecosystem.matchService.requireById(ids.match(id));
    return { match };
  });
}

export async function transitionMatchAction(id: string, input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const { action } = matchTransitionSchema.parse(input);
    const matchId = ids.match(id);
    const { matchService } = ctx.container.ecosystem;

    switch (action) {
      case 'accept':
        return { match: await matchService.accept(matchId, ctx.profileId) };
      case 'decline':
        return { match: await matchService.decline(matchId, ctx.profileId) };
      case 'contact': {
        const result = await matchService.contact(matchId, ctx.profileId);
        return { match: result.match, contact: result.contact };
      }
      case 'close_won':
        return { match: await matchService.closeWon(matchId, ctx.profileId) };
      case 'close_lost':
        return { match: await matchService.closeLost(matchId, ctx.profileId) };
      default:
        throw new ValidationError('Geçersiz eylem.', { action: ['Desteklenmeyen eylem.'] });
    }
  });
}
