import type { MyListingItem, MyListingSortBy } from '@/features/listings/types/my-listings.types';

export function sortMyListings(items: MyListingItem[], sortBy: MyListingSortBy): MyListingItem[] {
  const sorted = [...items];
  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => a.listing.createdAt.localeCompare(b.listing.createdAt));
    case 'recently_updated':
      return sorted.sort((a, b) => b.listing.updatedAt.localeCompare(a.listing.updatedAt));
    case 'newest':
    default:
      return sorted.sort((a, b) => b.listing.createdAt.localeCompare(a.listing.createdAt));
  }
}
