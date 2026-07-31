'use server';

import type { ModuleKey } from '@/lib/domain/modules';
import { ValidationError } from '@/lib/domain/errors';
import { ids } from '@/lib/domain/ids';
import { runAuthenticatedAction, runOptionalAuthAction } from '@/lib/api/action-handler';
import { listingPublishBodySchema, listingBrowseQuerySchema } from '@/lib/api/validation';

export async function browseListingsAction(module: ModuleKey, query: unknown = {}) {
  return runOptionalAuthAction(async (ctx) => {
    const parsed = listingBrowseQuerySchema.parse(query);
    const supabase = (await import('@/lib/supabase/server')).createClient();
    const container =
      ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
    const { ecosystem } = container;

    switch (module) {
      case 'entrepreneurs':
      case 'investors': {
        const listings = await ecosystem.investorListingService.browseStartups({
          city: parsed.city,
          industry: parsed.industry ?? parsed.sector,
        });
        return { listings };
      }
      case 'franchise': {
        const listings = await ecosystem.franchiseService.browseBuyOpportunities({
          city: parsed.city,
          sector: parsed.sector ?? parsed.industry,
        });
        return { listings };
      }
      default:
        throw new ValidationError('Bu modül için tarama desteklenmiyor.', {
          module: ['Desteklenmeyen modül.'],
        });
    }
  });
}

export async function publishListingAction(module: ModuleKey, input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = listingPublishBodySchema.parse(input);
    const { pitchDeckDocumentId, flow, ...listingFields } = parsed;
    const { ecosystem } = ctx.container;

    switch (module) {
      case 'entrepreneurs': {
        const listing = await ecosystem.entrepreneurListingService.publishStartup({
          ownerId: ctx.userId,
          profileId: ctx.profileId,
          pitchDeckDocumentId: pitchDeckDocumentId ? ids.document(pitchDeckDocumentId) : null,
          listing: listingFields,
        });
        return { listing };
      }
      case 'founders': {
        const listing = await ecosystem.founderService.publishSearch({
          ownerId: ctx.userId,
          profileId: ctx.profileId,
          listing: listingFields,
        });
        return { listing };
      }
      case 'franchise': {
        if (!flow) {
          throw new ValidationError('Franchise akışı gerekli.', { flow: ['buy veya give belirtin.'] });
        }
        const listing = await ecosystem.franchiseService.publishListing({
          ownerId: ctx.userId,
          profileId: ctx.profileId,
          flow,
          listing: listingFields,
        });
        return { listing };
      }
      default:
        throw new ValidationError('Bu modül ilan yayınlamayı desteklemiyor.', {
          module: ['Desteklenmeyen modül.'],
        });
    }
  });
}
