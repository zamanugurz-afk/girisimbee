import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ListingSortBy } from '@/features/listings/types/marketplace.types';

export function sortListings(
  listings: Listing[],
  sortBy: ListingSortBy = 'newest',
  favoriteCounts?: Map<string, number>,
): Listing[] {
  const sorted = [...listings];
  switch (sortBy) {
    case 'most_viewed':
      return sorted.sort((a, b) => b.viewCount - a.viewCount);
    case 'recently_updated':
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case 'most_favorited':
      if (favoriteCounts) {
        return sorted.sort(
          (a, b) => (favoriteCounts.get(b.id) ?? 0) - (favoriteCounts.get(a.id) ?? 0),
        );
      }
      return sorted.sort((a, b) => b.interestedCount - a.interestedCount);
    case 'newest':
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function getSortColumn(sortBy: ListingSortBy): { column: string; ascending: boolean } {
  switch (sortBy) {
    case 'most_viewed':
      return { column: 'view_count', ascending: false };
    case 'recently_updated':
      return { column: 'updated_at', ascending: false };
    case 'most_favorited':
      return { column: 'interested_count', ascending: false };
    case 'newest':
    default:
      return { column: 'created_at', ascending: false };
  }
}
