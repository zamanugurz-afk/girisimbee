import type { ListingId, UserId } from '@/lib/domain/ids';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type {
  CreateListingPayload,
  UpdateListingPayload,
  ListingAggregate,
  ListingEngineContext,
} from '@/features/listings/types/listing-engine.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { Activity } from '@/features/shared/types/activity.types';

export interface IListingEngineService {
  createListing(payload: CreateListingPayload, ctx: ListingEngineContext): Promise<ListingAggregate>;
  updateListing(id: ListingId, payload: UpdateListingPayload, ctx: ListingEngineContext): Promise<ListingAggregate>;
  publishListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate>;
  renewListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate>;
  markListingSold(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate>;
  pauseListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate>;
  archiveListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate>;
  softDeleteListing(id: ListingId, ctx: ListingEngineContext): Promise<void>;
  restoreListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate>;
  duplicateListing(id: ListingId, ctx: ListingEngineContext): Promise<ListingAggregate>;
  getListing(id: ListingId): Promise<ListingAggregate | null>;
  getListingBySlug(slug: string): Promise<ListingAggregate | null>;
  searchListings(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  getActivityHistory(id: ListingId): Promise<Activity[]>;
}
