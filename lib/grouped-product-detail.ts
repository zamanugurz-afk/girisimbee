import {
  GROUPED_DEAL_LABEL_DISPLAY,
  resolveDealLabel,
} from '@/lib/engines/deal-score-engine';
import { TRUST_LABEL_DISPLAY } from '@/lib/engines/trust-score-engine';
import { PriceEngine } from '@/lib/engines/price-engine';
import { formatGroupedProductName } from '@/lib/grouped-product-view';
import { isOpenableMarketplaceUrl } from '@/lib/listing-url-validator';
import type { ListingResponse, ProductMatchGroup, ProviderId } from '@/types';

export interface GroupedListingRow {
  listingId: string;
  providerId: ProviderId;
  providerName: string;
  price: number;
  location: string;
  sellerName: string;
  dealPercentage: number;
  dealLabel: string;
  trustScore: number;
  trustLabel: string;
  listingDate: string;
  sourceUrl: string;
  isCheapest: boolean;
}

export interface GroupedProductDetailView {
  id: string;
  name: string;
  imageUrl: string | null;
  productFamily: string;
  productFamilyLabel: string;
  edition: string;
  editionLabel: string;
  storage: string;
  conditionLabel: string;
  marketplaceCount: number;
  lowestPrice: number;
  averagePrice: number;
  highestPrice: number;
  medianPrice: number;
  priceDifference: number;
  listingCount: number;
  lastUpdated: string;
  dealScore: ProductMatchGroup['deal_score'];
  trustScore: number;
  trustLabel: string;
  listings: GroupedListingRow[];
  bestDealListingId: string | null;
  cheapestListingId: string | null;
  recommendedListingId: string | null;
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

const EDITION_LABELS: Record<string, string> = {
  DISC: 'Disc',
  DIGITAL: 'Digital',
  UNKNOWN: '—',
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'Sıfır',
  'like-new': 'Az kullanılmış',
  good: 'İyi',
  fair: 'Orta',
  poor: 'Kötü',
};

function resolveListingSourceUrl(listing: ListingResponse): string {
  const candidate = listing.source_url?.trim() || listing.url?.trim() || '';
  return isOpenableMarketplaceUrl(candidate) ? candidate : '';
}

function resolveListingDeal(price: number, marketAverage: number) {
  const dealPercentage =
    marketAverage > 0
      ? Math.round(((price - marketAverage) / marketAverage) * 1000) / 10
      : 0;
  const label = resolveDealLabel(dealPercentage);
  return {
    dealPercentage,
    dealLabel: GROUPED_DEAL_LABEL_DISPLAY[label],
  };
}

function resolveConditionLabel(listings: ListingResponse[]): string {
  const counts = new Map<string, number>();
  for (const listing of listings) {
    const key = listing.item_condition ?? listing.condition ?? 'unknown';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  if (!top) return '—';
  if (sorted.length > 1 && sorted[1]![1] === top[1]) return 'Karışık';
  return CONDITION_LABELS[top[0]] ?? top[0];
}

function pickRecommendedListing(rows: GroupedListingRow[]): string | null {
  if (rows.length === 0) return null;

  const ranked = [...rows].sort((a, b) => {
    const aScore = a.trustScore * 0.55 - Math.max(0, a.dealPercentage) * 0.45;
    const bScore = b.trustScore * 0.55 - Math.max(0, b.dealPercentage) * 0.45;
    return bScore - aScore;
  });

  return ranked[0]?.listingId ?? null;
}

export function buildGroupedProductDetail(
  group: ProductMatchGroup,
  listings: ListingResponse[],
): GroupedProductDetailView {
  const groupListings = group.listing_ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is ListingResponse => listing != null);

  const marketAverage = group.deal_score?.market_average ?? group.average_price;
  const prices = groupListings.map((listing) => listing.price);
  const priceEngine = new PriceEngine();
  const stats = priceEngine.stats(prices);
  const lowestPrice = stats.minimum || group.lowest_price;
  const sortedByPrice = [...groupListings].sort((a, b) => a.price - b.price);

  const listingRows: GroupedListingRow[] = sortedByPrice.map((listing) => {
    const deal = resolveListingDeal(listing.price, marketAverage);
    const trust = listing.trust;

    return {
      listingId: listing.id,
      providerId: (listing.provider?.slug ?? 'sahibinden') as ProviderId,
      providerName: listing.provider?.name ?? listing.provider?.slug ?? '—',
      price: listing.price,
      location: [listing.district, listing.city].filter(Boolean).join(', '),
      sellerName: listing.seller?.display_name ?? 'Bilinmeyen satıcı',
      dealPercentage: deal.dealPercentage,
      dealLabel: deal.dealLabel,
      trustScore: trust?.trust_score ?? trust?.score ?? 0,
      trustLabel: trust?.label_display ?? TRUST_LABEL_DISPLAY.fair,
      listingDate: listing.listing_date ?? listing.first_seen_at,
      sourceUrl: resolveListingSourceUrl(listing),
      isCheapest: listing.price === lowestPrice,
    };
  });

  const trustScores = listingRows.map((row) => row.trustScore).filter((score) => score > 0);
  const averageTrust =
    trustScores.length > 0
      ? Math.round(trustScores.reduce((sum, score) => sum + score, 0) / trustScores.length)
      : 0;

  const trustLabel =
    averageTrust >= 85
      ? TRUST_LABEL_DISPLAY.excellent
      : averageTrust >= 70
        ? TRUST_LABEL_DISPLAY.good
        : averageTrust >= 55
          ? TRUST_LABEL_DISPLAY.fair
          : averageTrust >= 35
            ? TRUST_LABEL_DISPLAY.poor
            : TRUST_LABEL_DISPLAY.risky;

  const lastUpdated = groupListings.reduce((latest, listing) => {
    const candidate = listing.last_seen_at ?? listing.updated_at;
    return candidate > latest ? candidate : latest;
  }, groupListings[0]?.last_seen_at ?? new Date().toISOString());

  const bestDealListing = [...listingRows].sort(
    (a, b) => a.dealPercentage - b.dealPercentage,
  )[0];
  const cheapestListing = listingRows[0] ?? null;

  const imageUrl =
    groupListings.find((listing) => listing.image_urls?.[0])?.image_urls?.[0] ?? null;

  return {
    id: group.id,
    name: formatGroupedProductName(group),
    imageUrl,
    productFamily: group.product_family,
    productFamilyLabel:
      FAMILY_DISPLAY_NAMES[group.product_family] ??
      group.product_family.replace(/_/g, ' '),
    edition: group.edition,
    editionLabel: EDITION_LABELS[group.edition] ?? group.edition,
    storage: group.storage === 'UNKNOWN' ? '—' : group.storage,
    conditionLabel: resolveConditionLabel(groupListings),
    marketplaceCount: new Set(listingRows.map((row) => row.providerId)).size,
    lowestPrice,
    averagePrice: stats.average || group.average_price,
    highestPrice: stats.maximum || group.highest_price,
    medianPrice: stats.median,
    priceDifference: (stats.maximum || group.highest_price) - lowestPrice,
    listingCount: listingRows.length,
    lastUpdated,
    dealScore: group.deal_score,
    trustScore: averageTrust,
    trustLabel,
    listings: listingRows,
    bestDealListingId: bestDealListing?.listingId ?? null,
    cheapestListingId: cheapestListing?.listingId ?? null,
    recommendedListingId: pickRecommendedListing(listingRows),
  };
}
