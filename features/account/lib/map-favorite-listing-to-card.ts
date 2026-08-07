import type { ModuleKey } from '@/lib/domain/modules';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { getModuleListingDetailPath } from '@/features/listings/config/listing-category-module.config';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import type { FavoriteListing } from '@/features/favorites/types/favorite-listing.types';
import type {
  AccountFavoriteCardData,
  AccountFavoriteCategory,
} from '@/features/account/types/account-favorites.types';
import {
  ACCOUNT_FAVORITE_CATEGORY_LABELS,
  ACCOUNT_FAVORITE_CATEGORY_TO_CONTENT_KIND,
} from '@/features/account/types/account-favorites.constants';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';

const MODULE_TO_CATEGORY: Record<ModuleKey, AccountFavoriteCategory> = {
  entrepreneurs: 'girisimci',
  investors: 'yatirimci',
  candidates: 'is_arayan',
  employers: 'is_veren',
  founders: 'ortaklik',
  franchise: 'franchise',
};

const CATEGORY_ID_TO_TAB: Partial<Record<string, AccountFavoriteCategory>> = {
  [CATEGORY_IDS.yatirimBul]: 'girisimci',
  [CATEGORY_IDS.yatirimYap]: 'yatirimci',
  [CATEGORY_IDS.isBul]: 'is_arayan',
  [CATEGORY_IDS.iseAl]: 'is_veren',
  [CATEGORY_IDS.ortakBul]: 'ortaklik',
  [CATEGORY_IDS.bayilikAl]: 'franchise',
};

function resolveCategory(listing: Listing): AccountFavoriteCategory {
  if (listing.moduleKey && MODULE_TO_CATEGORY[listing.moduleKey]) {
    return MODULE_TO_CATEGORY[listing.moduleKey];
  }
  return CATEGORY_ID_TO_TAB[listing.categoryId] ?? 'is_arayan';
}

function resolveHref(listing: Listing): string {
  return getModuleListingDetailPath(listing.categoryId, listing.slug);
}

function resolveLocation(listing: Listing): string {
  const parts = [listing.city, listing.district, listing.location]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part && part.length > 0));
  if (parts.length === 0) return '—';
  return [...new Set(parts)].join(', ');
}

export function mapFavoriteListingToAccountCard(
  favorite: FavoriteListing,
  listing: Listing,
  coverImageUrl: string | null = null,
): AccountFavoriteCardData {
  const category = resolveCategory(listing);
  const display = resolveListingCardDisplay(listing);

  return {
    id: listing.id,
    listingTitle: listing.title,
    listingHref: resolveHref(listing),
    category,
    categoryLabel: ACCOUNT_FAVORITE_CATEGORY_LABELS[category] || display.typeLabel,
    contentKind: ACCOUNT_FAVORITE_CATEGORY_TO_CONTENT_KIND[category],
    coverImageUrl,
    location: resolveLocation(listing),
    publishedAt: listing.publishedAt ?? listing.createdAt,
    addedAt: favorite.createdAt,
    viewCount: listing.viewCount,
    isShowcase: listing.isFeatured,
    isUrgentShowcase: listing.isUrgent,
  };
}
