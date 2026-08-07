import type {
  AccountListingCardData,
  AccountListingsFilterState,
  AccountListingsTab,
} from '@/features/account/types/account-listings.types';

export function filterAccountListings(
  listings: AccountListingCardData[],
  tab: AccountListingsTab,
  filters: AccountListingsFilterState,
): AccountListingCardData[] {
  const query = filters.query.trim().toLowerCase();
  const now = Date.now();

  let result = listings.filter((item) => {
    if (tab !== 'all' && item.status !== tab) return false;

    if (query) {
      const haystack = `${item.title} ${item.category}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.category !== 'Tümü' && item.category !== filters.category) {
      return false;
    }

    if (filters.dateRange !== 'all') {
      const published = new Date(item.publishedAt).getTime();
      const days =
        filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      if (Number.isNaN(published) || published < cutoff) return false;
    }

    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'oldest':
        return a.publishedAt.localeCompare(b.publishedAt);
      case 'views_desc':
        return b.viewCount - a.viewCount;
      case 'favorites_desc':
        return b.favoriteCount - a.favoriteCount;
      case 'title_asc':
        return a.title.localeCompare(b.title, 'tr');
      case 'newest':
      default:
        return b.publishedAt.localeCompare(a.publishedAt);
    }
  });

  return result;
}
