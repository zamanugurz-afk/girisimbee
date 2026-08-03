import { getModuleListingDetailPath } from '@/features/listings/config/listing-category-module.config';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ListingPlacementRecord } from '@/features/monetization/types/listing-placement-record.types';
import { remainingDays } from '@/features/monetization/services/listing-placement.service';
import type {
  AccountShowcaseCardData,
  AccountShowcasePackageType,
  AccountShowcaseStatsData,
  AccountShowcaseStatus,
} from '@/features/account/types/account-showcase.types';

function mapPackageType(
  placement: ListingPlacementRecord,
): AccountShowcasePackageType {
  return placement.placementType === 'urgent' ? 'acil_vitrin' : 'vitrin';
}

function mapUiStatus(
  placement: ListingPlacementRecord,
  daysLeft: number,
): AccountShowcaseStatus {
  if (placement.status === 'expired' || placement.status === 'cancelled') {
    return 'expired';
  }
  if (placement.status === 'active' && daysLeft > 0 && daysLeft <= 7) {
    return 'expiring';
  }
  if (placement.status === 'active' && daysLeft > 0) {
    return 'active';
  }
  if (placement.status === 'pending' && daysLeft > 0) {
    return 'active';
  }
  return 'expired';
}

export function formatRemainingLabel(daysLeft: number): string {
  if (daysLeft <= 0) return '0 gün';
  return `${daysLeft} gün`;
}

export function mapPlacementToShowcaseCard(
  placement: ListingPlacementRecord,
  listing: Listing | null,
  favoriteCount = 0,
): AccountShowcaseCardData {
  const daysLeft = remainingDays(placement.expiresAt);
  return {
    id: placement.id,
    listingTitle: listing?.title ?? 'İlan bulunamadı',
    listingHref: listing
      ? getModuleListingDetailPath(listing.categoryId, listing.slug)
      : '/dashboard/ilanlarim',
    packageType: mapPackageType(placement),
    startsAt: placement.startedAt,
    endsAt: placement.expiresAt,
    remainingLabel: formatRemainingLabel(daysLeft),
    viewCount: listing?.viewCount ?? 0,
    favoriteCount,
    clickCount: listing?.interestedCount ?? 0,
    status: mapUiStatus(placement, daysLeft),
  };
}

export function buildShowcaseStats(
  cards: AccountShowcaseCardData[],
): AccountShowcaseStatsData {
  const active = cards.filter(
    (card) => card.status === 'active' || card.status === 'expiring',
  );

  // Aggregate unique listings' metrics roughly via card fields
  const byListing = new Map<string, AccountShowcaseCardData>();
  for (const card of cards) {
    const prev = byListing.get(card.listingHref);
    if (!prev || card.viewCount > prev.viewCount) {
      byListing.set(card.listingHref, card);
    }
  }

  let totalViews = 0;
  let totalFavorites = 0;
  let totalClicks = 0;
  for (const card of byListing.values()) {
    totalViews += card.viewCount;
    totalFavorites += card.favoriteCount;
    totalClicks += card.clickCount;
  }

  return {
    activePackageCount: active.length,
    totalViews,
    totalFavorites,
    totalClicks,
  };
}

export function filterAccountShowcases(
  items: AccountShowcaseCardData[],
  tab: 'all' | 'vitrin' | 'acil_vitrin',
): AccountShowcaseCardData[] {
  if (tab === 'all') return items;
  return items.filter((item) => item.packageType === tab);
}
