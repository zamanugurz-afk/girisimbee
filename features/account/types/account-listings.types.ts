/** Account panel — my listings UI types. */

export type AccountListingStatus = 'active' | 'expired' | 'unpublished';

export type AccountListingsTab = 'all' | 'active' | 'expired' | 'unpublished';

export type AccountListingsSort =
  | 'newest'
  | 'oldest'
  | 'views_desc'
  | 'favorites_desc'
  | 'title_asc';

export interface AccountListingCardData {
  id: string;
  title: string;
  category: string;
  status: AccountListingStatus;
  publishedAt: string;
  endsAt: string;
  viewCount: number;
  favoriteCount: number;
  isShowcase: boolean;
  isUrgentShowcase: boolean;
}

export interface AccountListingsFilterState {
  query: string;
  category: string;
  dateRange: 'all' | '7d' | '30d' | '90d';
  sort: AccountListingsSort;
}
