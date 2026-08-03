import type {
  AccountFavoriteCardData,
  AccountFavoritesFilterState,
  AccountFavoritesTab,
} from '@/features/account/types/account-favorites.types';

export function filterAccountFavorites(
  items: AccountFavoriteCardData[],
  tab: AccountFavoritesTab,
  filters: AccountFavoritesFilterState,
): AccountFavoriteCardData[] {
  const query = filters.query.trim().toLowerCase();
  const now = Date.now();

  let result = items.filter((item) => {
    if (item.contentKind !== tab) return false;

    if (query) {
      const haystack =
        `${item.listingTitle} ${item.categoryLabel} ${item.location}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.dateRange !== 'all') {
      const added = new Date(item.addedAt).getTime();
      const days =
        filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      if (Number.isNaN(added) || added < cutoff) return false;
    }

    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'oldest':
        return a.addedAt.localeCompare(b.addedAt);
      case 'title_asc':
        return a.listingTitle.localeCompare(b.listingTitle, 'tr');
      case 'newest':
      default:
        return b.addedAt.localeCompare(a.addedAt);
    }
  });

  return result;
}

export function countFavoritesByTab(
  items: AccountFavoriteCardData[],
): Record<AccountFavoritesTab, number> {
  return {
    ilanlar: items.filter((item) => item.contentKind === 'ilanlar').length,
    girisimler: items.filter((item) => item.contentKind === 'girisimler').length,
    sirketler: items.filter((item) => item.contentKind === 'sirketler').length,
    yatirimcilar: items.filter((item) => item.contentKind === 'yatirimcilar').length,
  };
}
