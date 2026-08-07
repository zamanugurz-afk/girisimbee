/**
 * Persist listing gallery images after module publish/create.
 * First image (sortOrder 0) is the cover used on cards.
 */
import { getClientContainer } from '@/lib/persistence/container';
import type { ListingId } from '@/lib/domain/ids';
import type { ListingImageInput } from '@/features/listings/types/listing-engine.types';

export async function saveListingImages(
  listingId: ListingId,
  images: ListingImageInput[],
): Promise<void> {
  const { listingImageRepository } = getClientContainer();
  const normalized = [...images]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((img, index) => ({
      url: img.url,
      alt: img.alt ?? null,
      sortOrder: index,
    }));

  await listingImageRepository.setForListing(listingId, normalized);
}
