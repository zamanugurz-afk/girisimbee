/** Account panel — favorites UI types. */

export type AccountFavoriteCategory =
  | 'girisimci'
  | 'yatirimci'
  | 'is_arayan'
  | 'is_veren'
  | 'ortaklik'
  | 'franchise';

/** Content tabs on /dashboard/favorilerim */
export type AccountFavoriteContentKind =
  | 'ilanlar'
  | 'girisimler'
  | 'sirketler'
  | 'yatirimcilar';

export type AccountFavoritesTab = AccountFavoriteContentKind;

export type AccountFavoritesSort = 'newest' | 'oldest' | 'title_asc';

export type AccountFavoritesDateRange = 'all' | '7d' | '30d' | '90d';

export interface AccountFavoriteCardData {
  id: string;
  listingTitle: string;
  listingHref: string;
  category: AccountFavoriteCategory;
  categoryLabel: string;
  contentKind: AccountFavoriteContentKind;
  coverImageUrl: string | null;
  location: string;
  publishedAt: string;
  addedAt: string;
  viewCount: number;
  isShowcase: boolean;
  isUrgentShowcase: boolean;
}

export interface AccountFavoritesFilterState {
  query: string;
  dateRange: AccountFavoritesDateRange;
  sort: AccountFavoritesSort;
}
