import type { Listing } from '@/features/listings/types/listing.entity.types';

export type MyListingStatusFilter =
  | 'all'
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'paused'
  | 'rejected'
  | 'archived'
  | 'sold'
  | 'expired';

export type MyListingSortBy = 'newest' | 'oldest' | 'recently_updated';

export type MyListingViewMode = 'grid' | 'list';

export interface MyListingItem {
  listing: Listing;
  thumbnailUrl: string | null;
  favoriteCount: number;
}
