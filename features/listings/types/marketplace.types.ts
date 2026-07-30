import type { CategoryId } from '@/lib/domain/ids';
import type { ListingFilter, RemotePolicy } from '@/features/listings/types/listing.entity.types';
import type { PaginationParams } from '@/lib/domain/pagination';

export type ListingSortBy = 'newest' | 'most_viewed' | 'most_favorited' | 'recently_updated';

export interface MarketplaceBrowseParams extends ListingFilter, PaginationParams {
  sortBy?: ListingSortBy;
  categorySlug?: string;
}

export interface MarketplaceFilterState {
  query?: string;
  categorySlug?: string;
  city?: string;
  remotePolicy?: RemotePolicy;
  isVerified?: boolean;
  sortBy: ListingSortBy;
}

export interface CategoryPageMeta {
  slug: string;
  categoryId: CategoryId;
  label: string;
  description: string;
  accent: string;
  seoTitle: string;
  seoDescription: string;
}
