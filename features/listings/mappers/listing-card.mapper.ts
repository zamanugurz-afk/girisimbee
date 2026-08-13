import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ContentItem, ContentType } from '@/features/categories/types/category.types';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import { hasAnyTrustBadge } from '@/features/authentication/types/trust.types';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import { CATEGORY_PAGE_CONFIG } from '@/features/listings/config/marketplace.config';
import {
  resolveCareerCoverRole,
  resolveListingCoverUrl,
} from '@/features/listings/config/listing-cover.config';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';
import { isEmptyDisplayValue, toDisplayValue } from '@/features/listings/utils/display-value';

type ListingWithDbMeta = Listing & {
  listingTypeSlug?: string | null;
  categorySlug?: string | null;
};

/** Content type derived from DB listing type slug (marketplace_listing_types.slug). */
const LISTING_TYPE_SLUG_CONTENT_TYPE: Record<string, ContentType> = {
  'yatirim-ariyorum': 'startup',
  'yatirim-yapiyorum': 'person',
  'is-ariyorum': 'person',
  'ise-aliyorum': 'job',
  'ortak-ariyorum': 'startup',
  'franchise-ilan-ver': 'startup',
  'bayilik-al': 'startup',
  'bayilik-ver': 'startup',
};

function formatTimeAgo(isoDate: string | null): string | undefined {
  if (!isoDate) return undefined;
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Bugün';
  if (days === 1) return 'Dün';
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return `${Math.floor(days / 30)} ay önce`;
}

function resolveDbListingTypeSlug(listing: ListingWithDbMeta): string | undefined {
  if (listing.listingTypeSlug) return listing.listingTypeSlug;
  return categoryRegistry.getListingType(listing.listingTypeId)?.slug ?? undefined;
}

function resolveDbCategorySlug(listing: ListingWithDbMeta): string | undefined {
  if (listing.categorySlug) return listing.categorySlug;
  return categoryRegistry.getCategory(listing.categoryId)?.slug ?? undefined;
}

function resolveContentTypeFromDb(listing: ListingWithDbMeta): ContentType {
  const listingTypeSlug = resolveDbListingTypeSlug(listing);
  if (listingTypeSlug && LISTING_TYPE_SLUG_CONTENT_TYPE[listingTypeSlug]) {
    return LISTING_TYPE_SLUG_CONTENT_TYPE[listingTypeSlug];
  }
  return 'startup';
}

/** Map domain Listing → ContentItem for ListingCard (ContentCard). */
export function listingToContentItem(
  listing: Listing,
  trust?: TrustBadges,
  uploadedCoverUrl?: string | null,
): ContentItem {
  const dbListing = listing as ListingWithDbMeta;
  const categorySlug = resolveDbCategorySlug(dbListing);
  const meta = categorySlug ? CATEGORY_PAGE_CONFIG[categorySlug] : undefined;
  const contentType = resolveContentTypeFromDb(dbListing);
  const cardDisplay = resolveListingCardDisplay(listing);
  const listingTypeSlug =
    resolveDbListingTypeSlug(dbListing)
    ?? (categorySlug === 'is-bul' || categorySlug === 'is-ariyorum' ? 'is-ariyorum' : undefined);

  const locationParts = [listing.city, listing.country === 'TR' ? 'Türkiye' : listing.country]
    .filter((part) => !isEmptyDisplayValue(part));
  const location = locationParts.join(', ') || toDisplayValue(listing.location) || undefined;

  return {
    id: listing.slug,
    listingId: listing.id,
    type: contentType,
    title: listing.title,
    subtitle: meta?.label,
    detail: cardDisplay.price,
    location,
    description: listing.shortDescription.trim() || undefined,
    price: cardDisplay.price,
    listingTypeLabel: cardDisplay.typeLabel,
    listingGroupColor: cardDisplay.groupColor,
    listingGroupLabel: cardDisplay.groupLabel,
    listingIconKey: cardDisplay.iconKey,
    coverUrl: resolveListingCoverUrl({
      uploadedUrl:
        uploadedCoverUrl
        || (typeof listing.customFields?.resolvedCoverUrl === 'string'
          ? listing.customFields.resolvedCoverUrl
          : null),
      listingTypeSlug,
      group: cardDisplay.group,
      sector: typeof listing.customFields?.primarySector === 'string'
        ? listing.customFields.primarySector
        : null,
      role: resolveCareerCoverRole(
        typeof listing.customFields?.desiredRole === 'string'
          ? listing.customFields.desiredRole
          : null,
        typeof listing.customFields?.desiredRoleOther === 'string'
          ? listing.customFields.desiredRoleOther
          : null,
      ),
      gender: typeof listing.customFields?.profileGender === 'string'
        ? listing.customFields.profileGender
        : null,
    }),
    tag: hasAnyTrustBadge(trust ?? { user: false, company: false, investor: false })
      ? undefined
        : listing.isVerified
          ? 'Doğrulanmış'
          : listing.isUrgent
            ? 'Acil'
            : listing.isFeatured
              ? 'Öne Çıkan'
              : undefined,
    trust,
    timeAgo: formatTimeAgo(listing.publishedAt ?? listing.createdAt),
    emoji: cardDisplay.typeEmoji,
    initials: contentType === 'person' ? listing.title.slice(0, 2).toUpperCase() : undefined,
  };
}

export function listingsToContentItems(
  listings: Listing[],
  trustByListingId?: Map<string, TrustBadges>,
  coverByListingId?: Map<string, string>,
): ContentItem[] {
  return listings.map((listing) =>
    listingToContentItem(
      listing,
      trustByListingId?.get(listing.id),
      coverByListingId?.get(listing.id),
    ),
  );
}
