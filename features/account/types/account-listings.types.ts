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
  slug: string;
  title: string;
  shortDescription?: string;
  category: string;
  group?: string;
  groupColor?: string;
  typeLabel?: string;
  iconKey?: string;
  status: AccountListingStatus;
  rawStatus?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  endsAt: string;
  location?: string | null;
  city?: string | null;
  district?: string | null;
  industry?: string | null;
  price?: string | null;
  viewCount: number;
  favoriteCount: number;
  applicationCount?: number;
  isShowcase: boolean;
  isUrgentShowcase: boolean;
  isVerified?: boolean;
}

export interface AccountListingsFilterState {
  query: string;
  category: string;
  dateRange: 'all' | '7d' | '30d' | '90d';
  sort: AccountListingsSort;
}
