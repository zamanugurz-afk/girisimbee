import { aiService } from '@/lib/services';
import type {
  AIAnalysisDTO,
  AIAnalysisResponse,
  ListingResponse,
  MarketStatisticsResponse,
  PriceHistoryDTO,
} from '@/types';

export function normalizeAiAnalysis(
  raw: AIAnalysisDTO | AIAnalysisDTO[] | null | undefined,
): AIAnalysisDTO | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

export function enrichAnalysis(
  dbAnalysis: AIAnalysisDTO,
  listing: ListingResponse,
  marketMedian: number,
  allPrices: number[],
  priceHistory: number[],
  peerListings?: Array<{
    id: string;
    title: string;
    price: number;
    description: string | null;
    image_urls: string[];
  }>,
): AIAnalysisResponse {
  const result = aiService.analyzeOnly(
    listing,
    marketMedian,
    allPrices,
    priceHistory,
    peerListings,
  );

  return {
    ...dbAnalysis,
    opportunity_tier: result.opportunityTier,
    risk_level: result.riskLevel,
    reasons: result.reasons,
    suggested_offer: result.suggestedOffer,
    should_buy: result.shouldBuy,
  };
}

export function analysisFromListingJoin(
  listing: ListingResponse,
  marketMedian: number,
  allPrices: number[],
  priceHistory: number[],
  peerListings?: Array<{
    id: string;
    title: string;
    price: number;
    description: string | null;
    image_urls: string[];
  }>,
): AIAnalysisResponse | undefined {
  const stored = normalizeAiAnalysis(listing.ai_analysis);
  if (!stored) return undefined;
  return enrichAnalysis(stored, listing, marketMedian, allPrices, priceHistory, peerListings);
}

export function buildPriceHistorySummary(
  priceHistory: PriceHistoryDTO[],
  listingPrice: number,
): {
  lowestEver: number;
  highestEver: number;
  changeCount: number;
  currentTrend: 'up' | 'down' | 'stable';
  changePct: number;
} {
  const sortedHistory = [...priceHistory].sort(
    (a, b) => +new Date(a.detected_at) - +new Date(b.detected_at),
  );
  const prices = sortedHistory.map((p) => p.price);
  const lowestEver = prices.length > 0 ? Math.min(...prices) : listingPrice;
  const highestEver = prices.length > 0 ? Math.max(...prices) : listingPrice;
  const changeCount =
    sortedHistory.length > 1
      ? sortedHistory.reduce((acc, p, idx) => {
          if (idx === 0) return 0;
          return p.price !== sortedHistory[idx - 1].price ? acc + 1 : acc;
        }, 0)
      : 0;
  const firstPrice = prices[0] ?? listingPrice;
  const lastPrice = prices[prices.length - 1] ?? listingPrice;
  const changePct =
    firstPrice > 0 ? Math.round(((lastPrice - firstPrice) / firstPrice) * 1000) / 10 : 0;
  const currentTrend: 'up' | 'down' | 'stable' =
    changePct > 1 ? 'up' : changePct < -1 ? 'down' : 'stable';

  return { lowestEver, highestEver, changeCount, currentTrend, changePct };
}

export function toPeerListings(listings: ListingResponse[]) {
  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    description: l.description,
    image_urls: l.image_urls,
  }));
}

export function computeClientMarketStats(
  productId: string,
  prices: number[],
): MarketStatisticsResponse | undefined {
  if (prices.length === 0) return undefined;

  const sorted = [...prices].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const roundedMedian = Math.round(median);

  return {
    id: `computed-${productId}`,
    product_id: productId,
    average_price: Math.round(avg),
    median_price: roundedMedian,
    minimum_price: min,
    maximum_price: max,
    listing_count: prices.length,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at_row: new Date().toISOString(),
    spread_pct:
      roundedMedian > 0 ? ((max - min) / roundedMedian) * 100 : 0,
    discount_depth_pct:
      roundedMedian > 0 ? ((roundedMedian - min) / roundedMedian) * 100 : 0,
  };
}
