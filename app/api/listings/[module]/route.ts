import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { moduleParamSchema, listingPublishBodySchema, listingBrowseQuerySchema } from '@/lib/api/validation';
import { ValidationError } from '@/lib/domain/errors';
import { ids } from '@/lib/domain/ids';

export const GET = withOptionalAuth(async (ctx, request, { params }) => {
  const { module } = moduleParamSchema.parse(params);
  const url = new URL(request.url);
  const query = listingBrowseQuerySchema.parse(Object.fromEntries(url.searchParams));
  const { ecosystem } = ctx?.container ?? { ecosystem: null };

  if (!ecosystem) {
    const supabase = (await import('@/lib/supabase/server')).createClient();
    const container = (await import('@/lib/persistence/container')).getServerContainer(supabase);
    return browseListings(module, query, container.ecosystem);
  }

  return browseListings(module, query, ecosystem);
});

export const POST = withAuth(async (ctx, request, { params }) => {
  const { module } = moduleParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = listingPublishBodySchema.parse(body);
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
      return created({ listing });
    }
    case 'founders': {
      const listing = await ecosystem.founderService.publishSearch({
        ownerId: ctx.userId,
        profileId: ctx.profileId,
        listing: listingFields,
      });
      return created({ listing });
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
      return created({ listing });
    }
    default:
      throw new ValidationError('Bu modül ilan yayınlamayı desteklemiyor.', {
        module: ['Desteklenmeyen modül.'],
      });
  }
});

async function browseListings(
  module: string,
  query: { city?: string; industry?: string; sector?: string },
  ecosystem: import('@/lib/persistence/ecosystem-services').EcosystemServices,
) {
  switch (module) {
    case 'entrepreneurs':
    case 'investors': {
      const listings = await ecosystem.investorListingService.browseStartups({
        city: query.city,
        industry: query.industry ?? query.sector,
      });
      return ok({ listings });
    }
    case 'franchise': {
      const listings = await ecosystem.franchiseService.browseBuyOpportunities({
        city: query.city,
        sector: query.sector ?? query.industry,
      });
      return ok({ listings });
    }
    default:
      throw new ValidationError('Bu modül için tarama desteklenmiyor.', {
        module: ['Desteklenmeyen modül.'],
      });
  }
}
