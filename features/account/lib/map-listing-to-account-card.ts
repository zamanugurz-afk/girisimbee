import type { Listing } from '@/features/listings/types/listing.entity.types';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import { computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import type {
  AccountListingCardData,
  AccountListingStatus,
} from '@/features/account/types/account-listings.types';

function mapStatus(listing: Listing): AccountListingStatus {
  if (listing.status === 'published' || listing.status === ('active' as unknown)) return 'active';
  if (listing.status === 'expired') return 'expired';
  return 'unpublished';
}

export function mapListingToAccountCard(
  listing: Listing,
  favoriteCount = 0,
  applicationCount = 0,
): AccountListingCardData {
  const display = resolveListingCardDisplay(listing);
  const publishDate = listing.publishedAt ?? listing.createdAt;
  const expiryDate =
    listing.expiresAt ??
    (publishDate ? computeListingExpiry(new Date(publishDate), 30) : computeListingExpiry());

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
    publishedAt: publishDate,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    endsAt: expiryDate,
    viewCount: listing.viewCount ?? 0,
    favoriteCount,
    applicationCount: Math.max(applicationCount, listing.applicationCount ?? 0, listing.interestedCount ?? 0),
    isShowcase: listing.isFeatured ?? false,
    isUrgentShowcase: listing.isUrgent ?? false,
    isVerified: listing.isVerified ?? false,
  };
}
