import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import type { ListingDetail } from '@/features/listings/types/listing.types';
import type { ListingId } from '@/lib/domain/ids';
import { uuidSchema } from '@/lib/domain/validation';
import { profileSpan, recordCacheMiss } from '@/lib/perf/navigation-profile';
import { parseListingNumberQuery } from '@/features/listings/utils/listing-number';

/** Shared loader for listing page + generateMetadata. */
export const loadListingDetail = cache(async (idOrSlug: string): Promise<ListingDetail | null> => {
  recordCacheMiss();
  return profileSpan('loadListingDetail', async () => {
    try {
      const container = getServerContainer(createClient());
      const raw = idOrSlug.trim();
      const isUuid = uuidSchema.safeParse(raw).success;

      let aggregate = isUuid
        ? await container.listingEngine.getListing(raw as ListingId)
        : await container.listingEngine.getListingBySlug(raw);

      // Allow opening detail via listing number (e.g. /ilan/GC-A1B2C3D4).
      if (!aggregate && parseListingNumberQuery(raw)) {
        const byNumber = await container.listingRepository.findMany(
          { query: raw, status: 'published', includeDeleted: false },
          { page: 1, limit: 1 },
        );
        const hit = byNumber.items[0];
        if (hit) {
          aggregate = await container.listingEngine.getListing(hit.id);
        }
      }

      if (!aggregate) return null;

      const [profile, company] = await Promise.all([
        container.profileService.getByUserId(aggregate.listing.ownerId),
        aggregate.listing.companyId
          ? container.companyService.getById(aggregate.listing.companyId)
          : Promise.resolve(null),
      ]);

      return aggregateToListingDetail(aggregate, { profile, company });
    } catch (error: any) {
      console.error('MESSAGE:', error?.message);
      console.error('DETAILS:', error?.details);
      console.error('HINT:', error?.hint);
      console.error('CODE:', error?.code);
      console.error('FULL ERROR:', error);
      throw error;
    }
  });
});
