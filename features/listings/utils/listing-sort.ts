import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ListingSortBy } from '@/features/listings/types/marketplace.types';

export function sortListings(
  listings: Listing[],
  sortBy: ListingSortBy = 'newest',
  favoriteCounts?: Map<string, number>,
): Listing[] {
  const sorted = [...listings];
  return sorted.sort((a, b) => {
    // 1. Önce Süper İlanlar (isUrgent / isFeatured) önceliğe sahiptir
    const aPriority = (a.isUrgent ? 2 : 0) + (a.isFeatured ? 1 : 0);
    const bPriority = (b.isUrgent ? 2 : 0) + (b.isFeatured ? 1 : 0);
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // 2. Ardından seçilen sıralama ölçütü uygulanır
    switch (sortBy) {
      case 'most_viewed':
        return b.viewCount - a.viewCount;
      case 'recently_updated':
        return b.updatedAt.localeCompare(a.updatedAt);
      case 'most_favorited':
        if (favoriteCounts) {
          return (favoriteCounts.get(b.id) ?? 0) - (favoriteCounts.get(a.id) ?? 0);
        }
        return b.interestedCount - a.interestedCount;
      case 'newest':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}

export function getSortColumn(sortBy: ListingSortBy): { column: string; ascending: boolean } {
  switch (sortBy) {
    case 'most_viewed':
      return { column: 'view_count', ascending: false };
    case 'recently_updated':
      return { column: 'updated_at', ascending: false };
    case 'most_favorited':
      // Favorite counts live in marketplace_favorites; browse service sorts in memory.
      return { column: 'created_at', ascending: false };
    case 'newest':
    default:
      return { column: 'created_at', ascending: false };
  }
}
