/**
 * Mock listing image repository — in-memory image store per listing.
 */
import type { ListingId } from '@/lib/domain/ids';
import type { ListingImage } from '@/features/listings/types/listing-engine.types';
import type { ListingImageRepository } from '@/features/listings/repository/listing-image.repository';

export class MockListingImageRepository implements ListingImageRepository {
  private images = new Map<ListingId, ListingImage[]>();

  async findByListingId(listingId: ListingId): Promise<ListingImage[]> {
    return this.images.get(listingId) ?? [];
  }

  async setForListing(
    listingId: ListingId,
    images: Omit<ListingImage, 'id' | 'listingId'>[],
  ): Promise<ListingImage[]> {
    const stored: ListingImage[] = images.map((img, i) => ({
      id: crypto.randomUUID(),
      listingId,
      url: img.url,
      alt: img.alt ?? null,
      sortOrder: img.sortOrder ?? i,
    }));
    this.images.set(listingId, stored);
    return stored;
  }

  async deleteByListingId(listingId: ListingId): Promise<void> {
    this.images.delete(listingId);
  }
}

export const mockListingImageRepository = new MockListingImageRepository();
