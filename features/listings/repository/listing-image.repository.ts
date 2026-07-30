import type { ListingId } from '@/lib/domain/ids';
import type { ListingImage } from '@/features/listings/types/listing-engine.types';

export interface ListingImageRepository {
  findByListingId(listingId: ListingId): Promise<ListingImage[]>;
  setForListing(
    listingId: ListingId,
    images: Omit<ListingImage, 'id' | 'listingId'>[],
  ): Promise<ListingImage[]>;
  deleteByListingId(listingId: ListingId): Promise<void>;
}
