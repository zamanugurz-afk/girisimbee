import type { Repository } from '@/lib/domain/repository';
import type { ListingId } from '@/lib/domain/ids';
import type { Listing, CreateListingInput, UpdateListingInput, ListingFilter } from '@/features/listings/types/listing.entity.types';

export interface ListingRepository
  extends Repository<Listing, ListingId, CreateListingInput, UpdateListingInput, ListingFilter> {
  findBySlug(slug: string): Promise<Listing | null>;
  findPublished(filter: ListingFilter, pagination?: import('@/lib/domain/pagination').PaginationParams): Promise<import('@/lib/domain/pagination').PaginatedResult<Listing>>;
  incrementViewCount(id: ListingId): Promise<void>;
  incrementApplicationCount(id: ListingId): Promise<void>;
  transitionStatus(id: ListingId, status: Listing['status']): Promise<Listing>;
}
