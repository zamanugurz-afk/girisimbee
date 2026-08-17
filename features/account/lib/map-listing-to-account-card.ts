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
    id: String(listing.id),
    slug: listing.slug ?? String(listing.id),
    title: listing.title,
    shortDescription: listing.shortDescription ?? '',
    category: display.groupLabel,
    group: display.group,
    groupColor: display.groupColor,
    typeLabel: display.typeLabel,
    iconKey: display.iconKey,
    location: listing.location ?? listing.city ?? null,
    city: listing.city ?? null,
    district: listing.district ?? null,
    industry: listing.industry ?? null,
    price: display.price ?? null,
    status: mapStatus(listing),
    rawStatus: listing.status,
    publishedAt: listing.publishedAt ?? listing.createdAt,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    endsAt: listing.expiresAt ?? listing.publishedAt ?? listing.createdAt,
    viewCount: listing.viewCount ?? 0,
    favoriteCount,
    applicationCount: listing.applicationCount ?? listing.interestedCount ?? 0,
    isShowcase: listing.isFeatured ?? false,
    isUrgentShowcase: listing.isUrgent ?? false,
    isVerified: listing.isVerified ?? false,
  };
}
