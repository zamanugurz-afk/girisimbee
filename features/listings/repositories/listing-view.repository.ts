import type { ListingId, ListingViewId, UserId } from '@/lib/domain/ids';
import type {
  ListingView,
  RecordListingViewInput,
} from '@/features/listings/types/listing-view.types';

export interface ListingViewRepository {
  insert(input: RecordListingViewInput & { id: ListingViewId }): Promise<ListingView>;
  findRecentByViewer(
    listingId: ListingId,
    viewerId: UserId,
    sinceIso: string,
  ): Promise<ListingView | null>;
  findRecentByIp(
    listingId: ListingId,
    ipAddress: string,
    sinceIso: string,
  ): Promise<ListingView | null>;
  countByListing(listingId: ListingId): Promise<number>;
  countUniqueByListing(listingId: ListingId): Promise<number>;
  countSince(listingId: ListingId, sinceIso: string): Promise<number>;
}
