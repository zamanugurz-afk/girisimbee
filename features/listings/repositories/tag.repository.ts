import type { Repository } from '@/lib/domain/repository';
import type { TagId, ListingId } from '@/lib/domain/ids';
import type { Tag, ListingTag, CreateTagInput, UpdateTagInput, TagFilter } from '@/features/listings/types/tag.types';

export interface TagRepository
  extends Repository<Tag, TagId, CreateTagInput, UpdateTagInput, TagFilter> {
  findBySlug(slug: string): Promise<Tag | null>;
  findByListingId(listingId: ListingId): Promise<Tag[]>;
  setTagsForListing(listingId: ListingId, tagNames: string[]): Promise<Tag[]>;
  attachToListing(listingId: ListingId, tagId: TagId): Promise<ListingTag>;
  detachFromListing(listingId: ListingId, tagId: TagId): Promise<void>;
  incrementUsageCount(id: TagId, delta?: number): Promise<void>;
}
