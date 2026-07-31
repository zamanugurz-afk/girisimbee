import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import { hasAnyTrustBadge } from '@/features/authentication/types/trust.types';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  CATEGORY_CONTENT_TYPE,
  CATEGORY_EMOJI,
  CATEGORY_PAGE_CONFIG,
} from '@/features/listings/config/marketplace.config';
import { isEmptyDisplayValue, toDisplayValue } from '@/features/listings/utils/display-value';

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

function formatDetail(listing: Listing, categorySlug: string): string | undefined {
  const cf = listing.customFields;

  if (categorySlug === 'yatirim-bul' || categorySlug === 'yatirim-yap') {
    const amount = toDisplayValue(cf.investmentAmount) || toDisplayValue(cf.ticketSizeMin);
    if (amount) return amount;
    if (listing.investmentDetails?.amountSought) {
      return `${listing.investmentDetails.amountSought.toLocaleString('tr-TR')} ${listing.investmentDetails.currency}`;
    }
  }

  if (categorySlug === 'ise-al') {
    const salary = toDisplayValue(cf.salaryRange);
    if (salary) return salary;
  }

  if (categorySlug === 'is-bul') {
    const salary = toDisplayValue(cf.salaryExpectation);
    if (salary) return salary;
    const role = toDisplayValue(cf.desiredRole);
    if (role) return role;
  }

  if (categorySlug === 'ortak-bul') {
    const partnership = toDisplayValue(cf.partnershipType) || toDisplayValue(listing.partnerDetails?.partnerType);
    if (partnership) return partnership;
  }

  return listing.shortDescription.slice(0, 60);
}

/** Map domain Listing → ContentItem for ListingCard (ContentCard). */
export function listingToContentItem(listing: Listing, trust?: TrustBadges): ContentItem {
  const category = categoryRegistry.getCategory(listing.categoryId);
  const slug = category?.slug ?? 'yatirim-bul';
  const meta = CATEGORY_PAGE_CONFIG[slug];
  const contentType = CATEGORY_CONTENT_TYPE[slug] ?? 'startup';

  const locationParts = [listing.city, listing.country === 'TR' ? 'Türkiye' : listing.country]
    .filter((part) => !isEmptyDisplayValue(part));
  const location = locationParts.join(', ') || toDisplayValue(listing.location) || undefined;

  return {
    id: listing.slug,
    listingId: listing.id,
    type: contentType,
    title: listing.title,
    subtitle: meta?.label,
    detail: formatDetail(listing, slug),
    location,
    tag: hasAnyTrustBadge(trust ?? { user: false, company: false, investor: false })
      ? undefined
        : listing.isVerified
          ? 'Doğrulanmış'
          : listing.isUrgent
            ? 'Acil'
            : listing.isFeatured
              ? 'Öne Çıkan'
              : meta?.label,
    trust,
    timeAgo: formatTimeAgo(listing.publishedAt ?? listing.createdAt),
    emoji: CATEGORY_EMOJI[slug],
    initials: contentType === 'person' ? listing.title.slice(0, 2).toUpperCase() : undefined,
  };
}

export function listingsToContentItems(
  listings: Listing[],
  trustByListingId?: Map<string, TrustBadges>,
): ContentItem[] {
  return listings.map((listing) =>
    listingToContentItem(listing, trustByListingId?.get(listing.id)),
  );
}
