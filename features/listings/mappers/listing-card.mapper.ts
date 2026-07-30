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
    const amount = cf.investmentAmount as number | undefined;
    const currency = (cf.currency as string) ?? 'TRY';
    if (amount) return `${amount.toLocaleString('tr-TR')} ${currency}`;
    if (listing.investmentDetails?.amountSought) {
      return `${listing.investmentDetails.amountSought.toLocaleString('tr-TR')} ${listing.investmentDetails.currency}`;
    }
  }
  if (categorySlug === 'ise-al' || categorySlug === 'is-bul') {
    const min = cf.salaryMin as number | undefined;
    const max = cf.salaryMax as number | undefined;
    if (min && max) return `${min.toLocaleString('tr-TR')} – ${max.toLocaleString('tr-TR')} TRY`;
    if (cf.salaryExpectation) return `${Number(cf.salaryExpectation).toLocaleString('tr-TR')} TRY`;
  }
  if (categorySlug === 'ortak-bul') {
    return (cf.partnershipType as string) ?? listing.partnerDetails?.partnerType ?? undefined;
  }
  return listing.shortDescription.slice(0, 60);
}

/** Map domain Listing → ContentItem for ListingCard (ContentCard). */
export function listingToContentItem(listing: Listing, trust?: TrustBadges): ContentItem {
  const category = categoryRegistry.getCategory(listing.categoryId);
  const slug = category?.slug ?? 'yatirim-bul';
  const meta = CATEGORY_PAGE_CONFIG[slug];
  const contentType = CATEGORY_CONTENT_TYPE[slug] ?? 'startup';

  const location = [listing.city, listing.country === 'TR' ? 'Türkiye' : listing.country]
    .filter(Boolean)
    .join(', ');

  return {
    id: listing.slug,
    listingId: listing.id,
    type: contentType,
    title: listing.title,
    subtitle: meta?.label,
    detail: formatDetail(listing, slug),
    location: location || listing.location || undefined,
    tag: hasAnyTrustBadge(trust ?? { user: false, company: false, investor: false })
      ? undefined
      : listing.isVerified
        ? 'Doğrulanmış'
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
