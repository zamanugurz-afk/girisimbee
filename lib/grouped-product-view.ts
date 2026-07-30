import { CATEGORY_TO_PRODUCT_SLUG, type ProductCategory } from '@/config/product-catalog';
import { PRODUCT_MODELS } from '@/config/site';
import { isOpenableMarketplaceUrl } from '@/lib/listing-url-validator';
import type { ListingResponse, ProductMatchGroup, ProviderId, GroupedProductDealScore } from '@/types';

export interface MarketplaceOffer {
  providerId: ProviderId;
  providerName: string;
  price: number;
  listingId: string;
  sourceUrl: string;
}

export interface GroupedProductView {
  id: string;
  name: string;
  imageUrl: string | null;
  productModelId: string | null;
  lowestPrice: number;
  marketplaceCount: number;
  offers: MarketplaceOffer[];
  listingIds: string[];
  dealScore: GroupedProductDealScore;
}

const FAMILY_DISPLAY_NAMES: Record<string, string> = {
  PS5: 'PS5',
  PS5_SLIM: 'PS5 Slim',
  PS5_PRO: 'PS5 Pro',
  XBOX_SERIES_X: 'Xbox Series X',
  XBOX_SERIES_S: 'Xbox Series S',
  DUALSENSE: 'DualSense',
  DUALSENSE_EDGE: 'DualSense Edge',
  XBOX_CONTROLLER: 'Xbox Controller',
  XBOX_ELITE_SERIES_2: 'Xbox Elite Series 2',
};

const SLUG_TO_PRODUCT_MODEL_ID = Object.fromEntries(
  PRODUCT_MODELS.map((product) => [product.slug, product.id]),
);

export function formatGroupedProductName(group: ProductMatchGroup): string {
  const base =
    FAMILY_DISPLAY_NAMES[group.product_family] ??
    group.product_family.replace(/_/g, ' ');

  const parts = [base];

  if (group.edition === 'DISC') {
    parts.push('Disc');
  } else if (group.edition === 'DIGITAL') {
    parts.push('Digital');
  }

  if (group.storage && group.storage !== 'UNKNOWN') {
    parts.push(group.storage);
  }

  return parts.join(' ');
}

function resolveProductModelId(productFamily: string): string | null {
  const slug = CATEGORY_TO_PRODUCT_SLUG[productFamily as ProductCategory];
  if (!slug) return null;
  return SLUG_TO_PRODUCT_MODEL_ID[slug] ?? null;
}

function resolveListingSourceUrl(listing: ListingResponse): string {
  const candidate = listing.source_url?.trim() || listing.url?.trim() || '';
  return isOpenableMarketplaceUrl(candidate) ? candidate : '';
}

/** Enrich backend product groups with per-marketplace lowest offers. */
export function buildGroupedProductViews(
  groups: ProductMatchGroup[],
  listings: ListingResponse[],
): GroupedProductView[] {
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  return groups.map((group) => {
    const groupListings = group.listing_ids
      .map((id) => listingById.get(id))
      .filter((listing): listing is ListingResponse => listing != null);

    const bestByProvider = new Map<
      ProviderId,
      { price: number; listing: ListingResponse }
    >();

    for (const listing of groupListings) {
      const providerSlug = (listing.provider?.slug ?? 'sahibinden') as ProviderId;
      const existing = bestByProvider.get(providerSlug);
      if (!existing || listing.price < existing.price) {
        bestByProvider.set(providerSlug, { price: listing.price, listing });
      }
    }

    const offers: MarketplaceOffer[] = [...bestByProvider.entries()]
      .map(([providerId, { price, listing }]) => ({
        providerId,
        providerName: listing.provider?.name ?? providerId,
        price,
        listingId: listing.id,
        sourceUrl: resolveListingSourceUrl(listing),
      }))
      .sort((a, b) => a.price - b.price);

    const imageUrl =
      groupListings.find((listing) => listing.image_urls?.[0])?.image_urls?.[0] ?? null;

    return {
      id: group.id,
      name: formatGroupedProductName(group),
      imageUrl,
      productModelId: resolveProductModelId(group.product_family),
      lowestPrice: offers[0]?.price ?? group.lowest_price,
      marketplaceCount: offers.length,
      offers,
      listingIds: group.listing_ids,
      dealScore: group.deal_score ?? fallbackDealScore(group),
    };
  });
}

function fallbackDealScore(group: ProductMatchGroup): GroupedProductDealScore {
  return {
    lowest_price: group.lowest_price,
    highest_price: group.highest_price,
    average_price: group.average_price,
    market_average: group.average_price,
    deal_percentage: 0,
    confidence: 0,
    label: 'fair-price',
    label_display: 'Fair Price',
  };
}

export function sortGroupedProductViews(
  groups: GroupedProductView[],
  sortBy: 'deal' | 'price-asc' | 'price-desc' | 'newest',
  legacyByListingId: Map<string, { priceVsMarketPct: number; postedAt: string }>,
): GroupedProductView[] {
  const sorted = [...groups];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.lowestPrice - b.lowestPrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.lowestPrice - a.lowestPrice);
    case 'newest':
      return sorted.sort((a, b) => {
        const aTime = Math.max(
          ...a.listingIds.map((id) => +new Date(legacyByListingId.get(id)?.postedAt ?? 0)),
        );
        const bTime = Math.max(
          ...b.listingIds.map((id) => +new Date(legacyByListingId.get(id)?.postedAt ?? 0)),
        );
        return bTime - aTime;
      });
    case 'deal':
    default:
      return sorted.sort((a, b) => a.dealScore.deal_percentage - b.dealScore.deal_percentage);
  }
}
