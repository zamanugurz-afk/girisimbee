import type { GroupedProductDealScore, GroupedDealScoreLabel, ProductMatchGroup } from '@/types';

export const GROUPED_DEAL_LABEL_DISPLAY: Record<GroupedDealScoreLabel, string> = {
  'excellent-deal': 'Excellent Deal',
  'good-deal': 'Good Deal',
  'fair-price': 'Fair Price',
  expensive: 'Expensive',
  overpriced: 'Overpriced',
};

/** Thresholds derived from grouped-product deal examples (lowest vs market average). */
const EXCELLENT_MAX = -8;
const GOOD_MAX = -3;
const FAIR_MAX = 3;
const EXPENSIVE_MAX = 6;

function roundPct(value: number): number {
  return Math.round(value * 10) / 10;
}

function weightedAveragePrice(groups: ProductMatchGroup[]): number {
  if (groups.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const group of groups) {
    const weight = Math.max(1, group.listing_count);
    weightedSum += group.average_price * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/** Family-level market average from grouped products (excluding the target group when peers exist). */
export function resolveMarketAverage(
  group: ProductMatchGroup,
  contextGroups: ProductMatchGroup[],
): number {
  const familyPeers = contextGroups.filter(
    (candidate) =>
      candidate.product_family === group.product_family && candidate.id !== group.id,
  );

  if (familyPeers.length > 0) {
    return weightedAveragePrice(familyPeers);
  }

  const familyGroups = contextGroups.filter(
    (candidate) => candidate.product_family === group.product_family,
  );
  const familyAverage = weightedAveragePrice(familyGroups);
  if (familyAverage > 0) return familyAverage;

  return group.average_price;
}

export function resolveDealLabel(dealPercentage: number): GroupedDealScoreLabel {
  if (dealPercentage <= EXCELLENT_MAX) return 'excellent-deal';
  if (dealPercentage <= GOOD_MAX) return 'good-deal';
  if (dealPercentage <= FAIR_MAX) return 'fair-price';
  if (dealPercentage <= EXPENSIVE_MAX) return 'expensive';
  return 'overpriced';
}

export function computeDealConfidence(group: ProductMatchGroup, peerCount: number): number {
  let score = 20;

  score += Math.min(40, group.listing_count * 12);
  score += Math.min(25, group.providers.length * 8);
  score += Math.min(15, peerCount * 5);

  return Math.round(Math.min(100, score));
}

/** Score a single grouped product using precomputed market context. */
export function scoreGroupedProduct(
  group: ProductMatchGroup,
  contextGroups: ProductMatchGroup[],
): GroupedProductDealScore {
  const marketAverage = resolveMarketAverage(group, contextGroups);
  const dealPercentage =
    marketAverage > 0
      ? roundPct(((group.lowest_price - marketAverage) / marketAverage) * 100)
      : 0;

  const label = resolveDealLabel(dealPercentage);
  const peerCount = contextGroups.filter(
    (candidate) =>
      candidate.product_family === group.product_family && candidate.id !== group.id,
  ).length;

  return {
    lowest_price: group.lowest_price,
    highest_price: group.highest_price,
    average_price: group.average_price,
    market_average: marketAverage,
    deal_percentage: dealPercentage,
    confidence: computeDealConfidence(group, peerCount),
    label,
    label_display: GROUPED_DEAL_LABEL_DISPLAY[label],
  };
}

/** Attach deal scores to grouped products without modifying matching output. */
export function attachDealScoresToGroups(
  groups: ProductMatchGroup[],
  marketContextGroups: ProductMatchGroup[],
): ProductMatchGroup[] {
  const context =
    marketContextGroups.length > 0 ? marketContextGroups : groups;

  return groups.map((group) => ({
    ...group,
    deal_score: scoreGroupedProduct(group, context),
  }));
}

export class DealScoreEngine {
  scoreGroup(group: ProductMatchGroup, contextGroups: ProductMatchGroup[]): GroupedProductDealScore {
    return scoreGroupedProduct(group, contextGroups);
  }

  scoreGroups(
    groups: ProductMatchGroup[],
    marketContextGroups?: ProductMatchGroup[],
  ): ProductMatchGroup[] {
    return attachDealScoresToGroups(groups, marketContextGroups ?? groups);
  }
}

export const dealScoreEngine = new DealScoreEngine();
