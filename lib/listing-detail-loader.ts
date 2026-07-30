import {
  listingService,
  priceHistoryService,
  statisticsService,
  aiService,
  sellerService,
} from '@/lib/services';
import {
  analysisFromListingJoin,
  buildPriceHistorySummary,
  computeClientMarketStats,
  enrichAnalysis,
  normalizeAiAnalysis,
  toPeerListings,
} from '@/lib/listing-detail-helpers';
import type {
  AIAnalysisResponse,
  ListingResponse,
  MarketStatisticsResponse,
  PriceHistoryDTO,
  SellerDTO,
} from '@/types';

export interface SimilarListingRow {
  listing: ListingResponse;
  analysis: AIAnalysisResponse | undefined;
  priceDiff: number;
  aiScore: number;
}

export interface LoadedListingDetail {
  listing: ListingResponse;
  analysis: AIAnalysisResponse | undefined;
  marketStats: MarketStatisticsResponse | undefined;
  seller: SellerDTO | undefined;
  priceHistory: PriceHistoryDTO[];
  similarListings: SimilarListingRow[];
  betterAlternatives: SimilarListingRow[];
}

async function resolveMarketStats(
  productId: string,
  prices: number[],
): Promise<MarketStatisticsResponse | undefined> {
  let marketStats = await statisticsService.getByProduct(productId);

  if (!marketStats && prices.length > 0) {
    await statisticsService.recomputeForProduct(productId, prices);
    marketStats = await statisticsService.getByProduct(productId);
  }

  return marketStats ?? computeClientMarketStats(productId, prices);
}

async function resolveAnalysis(
  listing: ListingResponse,
  marketStats: MarketStatisticsResponse | undefined,
  allPrices: number[],
  priceHistory: PriceHistoryDTO[],
  peerListings: ListingResponse[],
): Promise<AIAnalysisResponse | undefined> {
  const median = marketStats?.median_price ?? listing.price;
  const priceHistoryPrices = priceHistory.map((p) => p.price);
  const peers = toPeerListings(peerListings);

  const joined = analysisFromListingJoin(
    listing,
    median,
    allPrices,
    priceHistoryPrices,
    peers,
  );
  if (joined) return joined;

  const stored = await aiService.getByListing(listing.id);
  if (stored) {
    return enrichAnalysis(stored, listing, median, allPrices, priceHistoryPrices, peers);
  }

  const { analysis } = await aiService.analyzeAndSave(
    listing,
    median,
    allPrices,
    priceHistoryPrices,
    peers,
  );

  return enrichAnalysis(analysis, listing, median, allPrices, priceHistoryPrices, peers);
}

function resolveSimilarAnalysis(
  listing: ListingResponse,
  marketStats: MarketStatisticsResponse | undefined,
  allPrices: number[],
  peerListings: ListingResponse[],
): AIAnalysisResponse | undefined {
  const median = marketStats?.median_price ?? listing.price;
  const joined = analysisFromListingJoin(listing, median, allPrices, [], toPeerListings(peerListings));
  if (joined) return joined;

  const stored = normalizeAiAnalysis(listing.ai_analysis);
  if (stored) {
    return enrichAnalysis(stored, listing, median, allPrices, [], toPeerListings(peerListings));
  }

  const result = aiService.analyzeOnly(listing, median, allPrices, [], toPeerListings(peerListings));
  return {
    id: `ai-${listing.id}`,
    listing_id: listing.id,
    opportunity_score: result.opportunityScore,
    seller_score: result.sellerScore,
    image_score: result.imageScore,
    description_score: result.descriptionScore,
    negotiation_score: result.negotiationScore,
    fake_probability: result.fakeProbability,
    confidence: result.confidence,
    confidence_label: result.confidenceLabel,
    ai_summary: result.summary,
    overall_score: result.overallScore,
    price_score: result.priceScore,
    risk_score: result.riskScore,
    expected_accepted_price: result.expectedAcceptedPrice,
    negotiation_probability: result.negotiationProbability,
    content_hash: result.contentHash,
    recommendation: result.recommendation,
    explanation: result.explanation,
    analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opportunity_tier: result.opportunityTier,
    risk_level: result.riskLevel,
    reasons: result.reasons,
    suggested_offer: result.suggestedOffer,
    should_buy: result.shouldBuy,
  };
}

export async function loadListingDetail(listingId: string): Promise<LoadedListingDetail | null> {
  const listing = await listingService.getById(listingId);
  if (!listing) return null;

  const [priceHistory, productListings] = await Promise.all([
    priceHistoryService.getByListing(listingId),
    listingService.getAll(
      { product_id: listing.product_id, is_active: true, exclude_deleted: true },
      100,
    ),
  ]);

  let seller: SellerDTO | undefined = listing.seller ?? undefined;
  if (!seller && listing.seller_id) {
    seller = (await sellerService.getById(listing.seller_id)) ?? undefined;
  }

  const sameProductListings = productListings.filter((l) => l.id !== listingId);
  const allPrices = [listing.price, ...sameProductListings.map((l) => l.price)];
  const marketStats = await resolveMarketStats(listing.product_id, allPrices);
  const analysis = await resolveAnalysis(
    listing,
    marketStats,
    allPrices,
    priceHistory,
    sameProductListings,
  );

  const similarRows: SimilarListingRow[] = sameProductListings
    .map((l) => {
      const rowAnalysis = resolveSimilarAnalysis(l, marketStats, allPrices, sameProductListings);
      return {
        listing: l,
        analysis: rowAnalysis,
        priceDiff: l.price - listing.price,
        aiScore: rowAnalysis?.opportunity_score ?? 0,
      };
    })
    .sort((a, b) => a.listing.price - b.listing.price);

  const similarListings = similarRows.slice(0, 8);
  const betterAlternatives = similarRows
    .filter(
      (s) =>
        s.listing.price < listing.price &&
        s.aiScore >= (analysis?.opportunity_score ?? 0) - 5,
    )
    .slice(0, 4);

  return {
    listing,
    analysis,
    marketStats,
    seller,
    priceHistory: [...priceHistory].sort(
      (a, b) => +new Date(a.detected_at) - +new Date(b.detected_at),
    ),
    similarListings,
    betterAlternatives,
  };
}

export { buildPriceHistorySummary };
