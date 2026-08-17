import type { PartnershipIntent } from '@/features/founders/partnership-intent';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type { ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { PaginationParams } from '@/lib/domain/pagination';

export type ListingSortBy = 'newest' | 'most_viewed' | 'most_favorited' | 'recently_updated';

/** Unified /is page — narrow hire vs seek within the combined job feed. */
export type JobFlowFilter = 'hire' | 'seek';

export interface MarketplaceBrowseParams extends ListingFilter, PaginationParams {
  sortBy?: ListingSortBy;
  categorySlug?: string;
  jobFlow?: JobFlowFilter;
  partnershipIntent?: PartnershipIntent;
}

export interface MarketplaceFilterState {
  query?: string;
  categorySlug?: string;
  city?: string;
  sortBy: ListingSortBy;
  /** When set on İş İlanları browse, filters to hire or seek listing types. */
  jobFlow?: JobFlowFilter;
  /** Ortak-bul browse — seeking vs joining. Missing listings count as seeking. */
  partnershipIntent?: PartnershipIntent;
  isFeatured?: boolean;
  activeFeaturedOnly?: boolean;
  isUrgent?: boolean;
  activeUrgentOnly?: boolean;
  publishedAfter?: string;
  publishedBefore?: string;
}

export interface CategoryPageMeta {
  slug: string;
  categoryId: CategoryId;
  listingTypeId: ListingTypeId;
  label: string;
  description: string;
  accent: string;
  seoTitle: string;
  seoDescription: string;
}
