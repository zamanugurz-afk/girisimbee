import { resolveDealLabel } from '@/lib/engines/deal-score-engine';
import { calculateTrustScore } from '@/lib/engines/trust-score-engine';
import type {
  GroupedDealScoreLabel,
  ListingResponse,
  PriceAlertDTO,
  ProductMatchGroup,
} from '@/types';

const DEAL_QUALITY_SCORE: Record<GroupedDealScoreLabel, number> = {
  'excellent-deal': 90,
  'good-deal': 75,
  'fair-price': 55,
  expensive: 35,
  overpriced: 15,
};

export function dealQualityScoreFromPercentage(dealPercentage: number): number {
  return DEAL_QUALITY_SCORE[resolveDealLabel(dealPercentage)];
}

export function canReNotifyAlert(alert: PriceAlertDTO): boolean {
  if (!alert.is_active) return false;
  if (!alert.last_triggered_at) return true;

  if (alert.notify_once && alert.notify_again_after_days <= 0) {
    return false;
  }

  if (alert.notify_again_after_days > 0) {
    const daysSince =
      (Date.now() - new Date(alert.last_triggered_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= alert.notify_again_after_days;
  }

  return !alert.notify_once;
}

function computeListingDealPercentage(price: number, marketAverage: number): number {
  return marketAverage > 0
    ? Math.round(((price - marketAverage) / marketAverage) * 1000) / 10
    : 0;
}

export interface MatchedListing {
  listing: ListingResponse;
  dealScore: number;
  trustScore: number;
  price: number;
}

export function enrichListingsWithTrust(listings: ListingResponse[]): ListingResponse[] {
  return listings.map((listing) => ({
    ...listing,
    trust:
      listing.trust ??
      calculateTrustScore({
        title: listing.title,
        description: listing.description,
        image_urls: listing.image_urls,
        seller: listing.seller ?? null,
      }),
  }));
}

export function findMatchingListings(
  group: ProductMatchGroup,
  listings: ListingResponse[],
  alert: PriceAlertDTO,
): MatchedListing[] {
  const groupListings = group.listing_ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is ListingResponse => listing != null);

  const marketAverage = group.deal_score?.market_average ?? group.average_price;
  const matches: MatchedListing[] = [];

  for (const listing of groupListings) {
    const price = listing.price;
    if (price > alert.max_price) continue;

    const trustScore = listing.trust?.trust_score ?? listing.trust?.score ?? 0;
    if (trustScore < alert.min_trust_score) continue;

    const dealPercentage = computeListingDealPercentage(price, marketAverage);
    const dealScore = dealQualityScoreFromPercentage(dealPercentage);
    if (dealScore < alert.min_deal_score) continue;

    matches.push({ listing, dealScore, trustScore, price });
  }

  return matches;
}

export function pickBestMatch(matches: MatchedListing[]): MatchedListing | null {
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => a.price - b.price)[0] ?? null;
}

export function buildNotificationMessage(
  groupLabel: string,
  match: MatchedListing,
  listing: ListingResponse,
): string {
  const provider = listing.provider?.name ?? listing.provider?.slug ?? 'marketplace';
  return `Price alert: ${groupLabel} — ${match.price.toLocaleString('tr-TR')} TRY on ${provider} (deal ${match.dealScore}, trust ${match.trustScore})`;
}
