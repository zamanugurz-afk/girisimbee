import type { Listing } from '@/features/listings/types/listing.entity.types';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import type {
  AccountListingCardData,
  AccountListingStatus,
} from '@/features/account/types/account-listings.types';

function mapStatus(listing: Listing): AccountListingStatus {
  if (listing.status === 'published') return 'active';
  if (listing.status === 'expired') return 'expired';
  return 'unpublished';
}

export function mapListingToAccountCard(
  listing: Listing,
  favoriteCount = 0,
): AccountListingCardData {
  const display = resolveListingCardDisplay(listing);
  return {
    id: listing.id,
    title: listing.title,
    category: display.groupLabel,
    status: mapStatus(listing),
    publishedAt: listing.publishedAt ?? listing.createdAt,
    endsAt: listing.expiresAt ?? listing.publishedAt ?? listing.createdAt,
    viewCount: listing.viewCount,
    favoriteCount,
    isShowcase: listing.isFeatured,
    isUrgentShowcase: listing.isUrgent,
  };
}
