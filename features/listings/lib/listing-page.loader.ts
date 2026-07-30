import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import type { ListingDetail } from '@/features/listings/types/listing.types';
import type { ListingId } from '@/lib/domain/ids';
import { profileSpan, recordCacheMiss } from '@/lib/perf/navigation-profile';

/** Shared loader for listing page + generateMetadata. */
export const loadListingDetail = cache(async (idOrSlug: string): Promise<ListingDetail | null> => {
  recordCacheMiss();
  return profileSpan('loadListingDetail', async () => {
    try {
      const container = getServerContainer(createClient());
      const aggregate =
        (await container.listingEngine.getListingBySlug(idOrSlug)) ??
        (await container.listingEngine.getListing(idOrSlug as ListingId));

      if (!aggregate) return null;

      const [profile, company] = await Promise.all([
        container.profileService.getByUserId(aggregate.listing.ownerId),
        aggregate.listing.companyId
          ? container.companyService.getById(aggregate.listing.companyId)
          : Promise.resolve(null),
      ]);

      return aggregateToListingDetail(aggregate, { profile, company });
    } catch {
      return null;
    }
  });
});
