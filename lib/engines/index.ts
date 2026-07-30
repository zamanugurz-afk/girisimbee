export { PriceEngine, type PriceStats, type OpportunityResult, type TrendResult } from './price-engine';
export { FilterEngine } from './filter-engine';
export {
  SearchEngine,
  resolveListingSearchCategory,
  listingMatchesSearchForListing,
  groupedProductMatchesSearchQuery,
  searchGroupedProductGroups,
} from './search-engine';
export {
  ProductMatchingEngine,
  productMatchingEngine,
  groupListingsByProduct,
  searchGroupedProducts,
  buildProductMatchKey,
  buildProductMatchLabel,
  groupingEdition,
  type ProductMatchKey,
} from './product-matching-engine';
export {
  analyzeProduct,
  buildStructuredMatchKey,
  buildStructuredLabel,
  resolveStructuredIntelligence,
  structuredIntelligenceColumns,
  type StructuredProductIntelligence,
} from '../product-analyzer';
export {
  shouldRejectBundledConsoleListing,
  getBundleRejection,
  isBundleFilteredConsole,
  bundleDetectionEngine,
  type BundleRejectionResult,
  /** @deprecated */
  detectBundle,
  /** @deprecated */
  bundleDetectionColumns,
  /** @deprecated */
  isBundleEligibleConsole,
} from '../bundle-detection-engine';
export {
  DealScoreEngine,
  dealScoreEngine,
  attachDealScoresToGroups,
  scoreGroupedProduct,
  resolveDealLabel,
  resolveMarketAverage,
  GROUPED_DEAL_LABEL_DISPLAY,
} from './deal-score-engine';
export {
  GroupedPriceHistoryEngine,
  groupedPriceHistoryEngine,
  captureGroupedProductPriceSnapshots,
  captureGroupedProductPriceSnapshotsWithClient,
  buildGroupedPriceSnapshots,
  getPriceHistory,
  getLowestEverPrice,
  getHighestEverPrice,
  getAverageHistory,
  getPriceTrend,
  type GroupedPriceHistoryPeriod,
} from './grouped-price-history-engine';
export {
  ProductValidationEngine,
  productValidationEngine,
  validatePrimaryProduct,
  type PrimaryProductValidationInput,
} from './product-validation-engine';
export {
  TrustScoreEngine,
  trustScoreEngine,
  calculateTrustScore,
  TRUST_LABEL_DISPLAY,
  type TrustScoreListingInput,
} from './trust-score-engine';
export {
  PriceAlertEngine,
  priceAlertEngine,
  createPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
  getPriceAlerts,
  checkAlertsAfterSync,
  checkAlertsAfterSyncWithClient,
  canReNotifyAlert,
  dealQualityScoreFromPercentage,
} from './price-alert-engine';
export { AIEngine, type AIAnalysisInput, type AIAnalysisResult } from './ai-engine';
export { generateAISummary, confidenceLabelFromScore, recommendationLabel, confidenceLabelToString } from './analyzers/summary-analyzer';
export { OpportunityAnalyzer } from './analyzers/opportunity-analyzer';
export { SellerAnalyzer } from './analyzers/seller-analyzer';
export { PriceAnalyzer } from './analyzers/price-analyzer';
export { DescriptionAnalyzer } from './analyzers/description-analyzer';
export { ImageAnalyzer } from './analyzers/image-analyzer';
export { NegotiationAnalyzer, type NegotiationResult } from './analyzers/negotiation-analyzer';
export { RiskAnalyzer, type RiskResult } from './analyzers/risk-analyzer';
export { RecommendationEngine, type RecommendationResult } from './analyzers/recommendation-engine';
