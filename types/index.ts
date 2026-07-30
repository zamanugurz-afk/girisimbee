// ============================================================================
// İkinciBazar — Core Domain Types
// Every model has: DTO, Response, Update, Create, Filter, Table, Card, Summary
// ============================================================================

export type UUID = string;
export type ISODate = string;
export type Currency = 'TRY' | 'USD' | 'EUR';
export type ConditionGrade = 'new' | 'like-new' | 'good' | 'fair' | 'poor';
export type ProviderSlug = 'sahibinden' | 'letgo' | 'dolap';
export type SourceUrlStatus = 'valid' | 'invalid' | 'unchecked';
export type Recommendation = 'buy' | 'good-deal' | 'negotiate' | 'wait' | 'avoid';
export type ConfidenceLabel = 'very-high' | 'high' | 'medium' | 'low';
export type OpportunityTier = 'excellent' | 'very-good' | 'good' | 'average' | 'poor';
export type RiskLevel = 'low' | 'medium' | 'high';
export type SortOption =
  | 'lowest-price'
  | 'newest'
  | 'highest-ai'
  | 'highest-opportunity'
  | 'biggest-discount';
export type ListingAgeFilter = '24h' | '3d' | '7d' | '15d' | '30d' | 'all';
export type PriceTrendDirection = 'up' | 'down' | 'stable';

export type TrustScoreLabel = 'excellent' | 'good' | 'fair' | 'poor' | 'risky';

export type PrimaryProductType =
  | 'CONSOLE'
  | 'GAME'
  | 'CONTROLLER'
  | 'ACCESSORY'
  | 'ACCOUNT'
  | 'DIGITAL_CODE'
  | 'SUBSCRIPTION'
  | 'BUNDLE'
  | 'UNKNOWN';

export interface PrimaryProductValidationScores {
  console: number;
  game: number;
  controller: number;
  accessory: number;
  account: number;
  digital_code: number;
  subscription: number;
  bundle: number;
}

export interface PrimaryProductValidationResult {
  primary_type: PrimaryProductType;
  confidence: number;
  scores: PrimaryProductValidationScores;
  reasons: string[];
  accepted: boolean;
  reject_reason: string;
}

export interface TrustScoreResult {
  score: number;
  label: TrustScoreLabel;
  trust_score: number;
  trust_label: TrustScoreLabel;
  label_display: string;
  reasons: string[];
  rejected: boolean;
}

// ============================================================================
// CATEGORY
// ============================================================================
export interface CategoryDTO {
  id: UUID;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CategoryResponse extends CategoryDTO {
  product_count?: number;
}

export type CategoryUpdate = Partial<Pick<CategoryDTO, 'name' | 'slug' | 'icon' | 'sort_order'>>;

export type CategoryCreate = Pick<CategoryDTO, 'name' | 'slug' | 'icon' | 'sort_order'>;

export interface CategoryFilter {
  search?: string;
  is_active?: boolean;
}

export interface CategoryTable extends CategoryDTO {
  product_count: number;
}

export interface CategoryCard {
  id: UUID;
  name: string;
  slug: string;
  icon: string;
  product_count: number;
  total_listings: number;
  avg_price: number;
}

export interface CategorySummary {
  total: number;
  total_products: number;
  total_listings: number;
}

// ============================================================================
// PRODUCT
// ============================================================================
export interface ProductDTO {
  id: UUID;
  category_id: UUID;
  name: string;
  brand: string;
  model: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface ProductResponse extends ProductDTO {
  category?: CategoryDTO | null;
  ref_price?: number;
  msrp?: number;
}

export type ProductUpdate = Partial<Pick<ProductDTO, 'name' | 'brand' | 'model' | 'slug' | 'image_url' | 'is_active' | 'category_id'>>;

export type ProductCreate = Pick<ProductDTO, 'category_id' | 'name' | 'brand' | 'model' | 'slug' | 'image_url'> & {
  is_active?: boolean;
};

export interface ProductFilter {
  search?: string;
  category_id?: UUID;
  brand?: string;
  is_active?: boolean;
}

export interface ProductTable extends ProductDTO {
  category_name: string;
  category_slug: string;
  listing_count: number;
  median_price: number;
  min_price: number;
  trend_pct: number;
}

export interface ProductCard {
  id: UUID;
  name: string;
  brand: string;
  model: string;
  slug: string;
  image_url: string | null;
  category_name: string;
  category_slug: string;
  median_price: number;
  min_price: number;
  max_price: number;
  listing_count: number;
  trend_pct: number;
  best_deal_price: number;
  best_deal_discount_pct: number;
}

export interface ProductSummary {
  total: number;
  active: number;
  by_brand: Record<string, number>;
}

// ============================================================================
// PROVIDER
// ============================================================================
export interface ProviderDTO {
  id: UUID;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  is_enabled: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface ProviderResponse extends ProviderDTO {
  listing_count?: number;
  active_listings?: number;
}

export type ProviderUpdate = Partial<Pick<ProviderDTO, 'name' | 'slug' | 'logo_url' | 'website' | 'is_enabled'>>;

export type ProviderCreate = Pick<ProviderDTO, 'name' | 'slug' | 'logo_url' | 'website'> & {
  is_enabled?: boolean;
};

export interface ProviderFilter {
  is_enabled?: boolean;
}

export interface ProviderTable extends ProviderDTO {
  listing_count: number;
  active_listings: number;
  new_today: number;
}

export interface ProviderCard {
  id: UUID;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  listing_count: number;
  active_listings: number;
  color: string;
}

export interface ProviderSummary {
  total: number;
  enabled: number;
  total_listings: number;
}

// ============================================================================
// SELLER
// ============================================================================
export interface SellerDTO {
  id: UUID;
  provider_id: UUID;
  external_id: string;
  display_name: string;
  member_since: number | null;
  listing_count: number;
  rating: number;
  phone_verified: boolean;
  email_verified: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface SellerResponse extends SellerDTO {
  provider?: ProviderDTO | null;
  trust_score?: number;
  risk_level?: RiskLevel;
}

export type SellerUpdate = Partial<Pick<SellerDTO, 'display_name' | 'member_since' | 'listing_count' | 'rating' | 'phone_verified' | 'email_verified'>>;

export type SellerCreate = Pick<SellerDTO, 'provider_id' | 'external_id' | 'display_name'> & {
  member_since?: number;
  listing_count?: number;
  rating?: number;
  phone_verified?: boolean;
  email_verified?: boolean;
};

export interface SellerFilter {
  provider_id?: UUID;
  search?: string;
  min_rating?: number;
  verified_only?: boolean;
}

export interface SellerTable extends SellerDTO {
  provider_name: string;
  trust_score: number;
  risk_level: RiskLevel;
}

export interface SellerCard {
  id: UUID;
  display_name: string;
  provider_name: string;
  provider_slug: string;
  provider_color: string;
  rating: number;
  listing_count: number;
  member_since: number | null;
  verified: boolean;
  trust_score: number;
  risk_level: RiskLevel;
}

export interface SellerSummary {
  total: number;
  verified: number;
  avg_rating: number;
  avg_trust: number;
}

// ============================================================================
// LISTING
// ============================================================================
export interface ListingDTO {
  id: UUID;
  provider_id: UUID;
  product_id: UUID;
  external_listing_id: string;
  title: string;
  description: string | null;
  url: string;
  source_url: string;
  image_urls: string[];
  price: number;
  previous_price: number | null;
  currency: Currency;
  district: string;
  city: string;
  listing_date: ISODate | null;
  first_seen_at: ISODate;
  last_seen_at: ISODate;
  condition: ConditionGrade;
  product_family?: string | null;
  edition?: string | null;
  storage?: string | null;
  item_condition?: string | null;
  bundle_type?: string | null;
  is_bundle?: boolean | null;
  brand?: string | null;
  platform?: string | null;
  generation?: string | null;
  model?: string | null;
  color?: string | null;
  seller_id: UUID | null;
  source_url_status?: SourceUrlStatus | null;
  source_url_issue?: string | null;
  is_active: boolean;
  deleted_at: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface ListingResponse extends ListingDTO {
  provider?: ProviderDTO | null;
  product?: ProductDTO | null;
  seller?: SellerDTO | null;
  ai_analysis?: AIAnalysisDTO | null;
  market_stats?: MarketStatisticsDTO | null;
  is_favorite?: boolean;
  favorite_notes?: string | null;
  opportunity_score?: number;
  opportunity_tier?: OpportunityTier;
  discount_pct?: number;
  price_vs_market_pct?: number;
  deal_score?: string;
  flagged?: boolean;
  negotiable?: boolean;
  trust?: TrustScoreResult;
}

export type ListingUpdate = Partial<
  Pick<ListingDTO, 'title' | 'description' | 'url' | 'image_urls' | 'price' | 'currency' | 'district' | 'city' | 'listing_date' | 'condition' | 'seller_id' | 'is_active' | 'last_seen_at'>
>;

export type ListingCreate = Pick<
  ListingDTO,
  'provider_id' | 'product_id' | 'external_listing_id' | 'title' | 'url' | 'price'
> & {
  description?: string;
  image_urls?: string[];
  currency?: Currency;
  district?: string;
  city?: string;
  listing_date?: ISODate;
  condition?: ConditionGrade;
  seller_id?: UUID;
};

export interface ListingFilter {
  search?: string;
  provider_id?: UUID | null;
  product_id?: UUID | null;
  category_id?: UUID | null;
  city?: string;
  district?: string;
  condition?: ConditionGrade | 'all';
  listing_age?: ListingAgeFilter;
  min_price?: number | null;
  max_price?: number | null;
  sort?: SortOption;
  is_active?: boolean;
  exclude_deleted?: boolean;
  favorites_only?: boolean;
}

export interface ListingTable extends ListingDTO {
  product_name: string;
  product_brand: string;
  provider_name: string;
  provider_slug: string;
  seller_name: string | null;
  seller_rating: number | null;
  opportunity_score: number | null;
  discount_pct: number | null;
  condition_label: string;
}

export interface ListingCard {
  id: UUID;
  title: string;
  price: number;
  currency: Currency;
  formatted_price: string;
  product_name: string;
  product_slug: string;
  product_brand: string;
  provider_name: string;
  provider_slug: string;
  provider_color: string;
  image_url: string | null;
  district: string;
  city: string;
  condition: ConditionGrade;
  condition_label: string;
  seller_name: string;
  seller_rating: number;
  seller_verified: boolean;
  seller_trust_score: number;
  seller_risk_level: RiskLevel;
  opportunity_score: number;
  opportunity_tier: OpportunityTier;
  discount_pct: number;
  price_vs_market_pct: number;
  deal_score: string;
  flagged: boolean;
  negotiable: boolean;
  is_favorite: boolean;
  listing_date: ISODate | null;
  first_seen_at: ISODate;
  time_ago: string;
  url: string;
  source_url: string;
}

export interface ListingSummary {
  total: number;
  active: number;
  excellent_deals: number;
  flagged: number;
  avg_discount: number;
}

// ============================================================================
// FAVORITE
// ============================================================================
export interface FavoriteDTO {
  id: UUID;
  listing_id: UUID;
  notes: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface FavoriteResponse extends FavoriteDTO {
  listing?: ListingDTO | null;
}

export type FavoriteUpdate = Partial<Pick<FavoriteDTO, 'notes'>>;

export type FavoriteCreate = Pick<FavoriteDTO, 'listing_id'> & {
  notes?: string;
};

export interface FavoriteFilter {
  listing_id?: UUID;
}

export interface FavoriteTable extends FavoriteDTO {
  listing_title: string;
  listing_price: number;
  listing_url: string;
}

export interface FavoriteCard {
  id: UUID;
  listing_id: UUID;
  notes: string | null;
  listing_title: string;
  listing_price: number;
  listing_image: string | null;
  listing_url: string;
  created_at: ISODate;
}

export interface FavoriteSummary {
  total: number;
}

// ============================================================================
// ALARM
// ============================================================================
export interface AlarmDTO {
  id: UUID;
  product_id: UUID;
  target_price: number;
  is_enabled: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface AlarmResponse extends AlarmDTO {
  product?: ProductDTO | null;
  current_min_price?: number;
  current_median_price?: number;
  is_triggered?: boolean;
}

export type AlarmUpdate = Partial<Pick<AlarmDTO, 'target_price' | 'is_enabled'>>;

export type AlarmCreate = Pick<AlarmDTO, 'product_id' | 'target_price'> & {
  is_enabled?: boolean;
};

export interface AlarmFilter {
  product_id?: UUID;
  is_enabled?: boolean;
}

export interface AlarmTable extends AlarmDTO {
  product_name: string;
  product_brand: string;
  current_min_price: number;
  current_median_price: number;
  is_triggered: boolean;
}

export interface AlarmCard {
  id: UUID;
  product_name: string;
  product_brand: string;
  target_price: number;
  current_min_price: number;
  current_median_price: number;
  is_triggered: boolean;
  is_enabled: boolean;
  created_at: ISODate;
}

export interface AlarmSummary {
  total: number;
  enabled: number;
  triggered: number;
}

// ============================================================================
// PRICE_HISTORY
// ============================================================================
export interface PriceHistoryDTO {
  id: UUID;
  listing_id: UUID;
  price: number;
  detected_at: ISODate;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface PriceHistoryResponse extends PriceHistoryDTO {
  listing?: ListingDTO | null;
}

export type PriceHistoryCreate = Pick<PriceHistoryDTO, 'listing_id' | 'price'> & {
  detected_at?: ISODate;
};

export interface PriceHistoryFilter {
  listing_id?: UUID;
  from_date?: ISODate;
  to_date?: ISODate;
}

export interface PriceHistoryPoint {
  date: ISODate;
  price: number;
  label: string;
}

export interface PriceHistorySummary {
  points: PriceHistoryPoint[];
  change_pct: number;
  trend: PriceTrendDirection;
  min: number;
  max: number;
  avg: number;
  range_pct: number;
}

// ============================================================================
// GROUPED PRODUCT PRICE HISTORY
// ============================================================================
export type GroupedPriceHistoryPeriod = '7d' | '30d' | '90d' | 'all';

export interface GroupedProductPriceSnapshotDTO {
  id: UUID;
  group_id: string;
  snapshot_date: string;
  lowest_price: number;
  average_price: number;
  highest_price: number;
  listing_count: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface GroupedAveragePricePoint {
  date: string;
  average_price: number;
}

export interface GroupedPriceTrendResult {
  period: GroupedPriceHistoryPeriod;
  change_pct: number;
  direction: PriceTrendDirection;
  start_average: number;
  end_average: number;
  lowest_ever: number;
  highest_ever: number;
  snapshots: GroupedProductPriceSnapshotDTO[];
}

// ============================================================================
// PRICE ALERTS (grouped products)
// ============================================================================
export interface PriceAlertDTO {
  id: UUID;
  group_id: string;
  label: string | null;
  max_price: number;
  min_deal_score: number;
  min_trust_score: number;
  notify_once: boolean;
  notify_again_after_days: number;
  is_active: boolean;
  last_triggered_at: ISODate | null;
  last_matched_listing_id: UUID | null;
  trigger_count: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface PriceNotificationDTO {
  id: UUID;
  alert_id: UUID;
  group_id: string;
  listing_id: UUID | null;
  matched_price: number;
  matched_deal_score: number;
  matched_trust_score: number;
  message: string;
  is_read: boolean;
  created_at: ISODate;
}

export interface PriceAlertCreateInput {
  group_id: string;
  max_price: number;
  min_deal_score: number;
  min_trust_score: number;
  notify_once?: boolean;
  notify_again_after_days?: number;
  label?: string | null;
  is_active?: boolean;
}

export type PriceAlertUpdateInput = Partial<
  Pick<
    PriceAlertDTO,
    | 'group_id'
    | 'label'
    | 'max_price'
    | 'min_deal_score'
    | 'min_trust_score'
    | 'notify_once'
    | 'notify_again_after_days'
    | 'is_active'
  >
>;

export interface PriceAlertCheckResult {
  checked: number;
  triggered: number;
  notifications: PriceNotificationDTO[];
}

// ============================================================================
// MARKET_STATISTICS
// ============================================================================
export interface MarketStatisticsDTO {
  id: UUID;
  product_id: UUID;
  average_price: number;
  median_price: number;
  minimum_price: number;
  maximum_price: number;
  listing_count: number;
  updated_at: ISODate;
  created_at: ISODate;
  updated_at_row: ISODate;
}

export interface MarketStatisticsResponse extends MarketStatisticsDTO {
  product?: ProductDTO | null;
  spread_pct?: number;
  discount_depth_pct?: number;
}

export type MarketStatisticsUpdate = Partial<
  Pick<MarketStatisticsDTO, 'average_price' | 'median_price' | 'minimum_price' | 'maximum_price' | 'listing_count'>
>;

export type MarketStatisticsCreate = Pick<
  MarketStatisticsDTO,
  'product_id' | 'average_price' | 'median_price' | 'minimum_price' | 'maximum_price' | 'listing_count'
>;

export interface MarketStatisticsFilter {
  product_id?: UUID;
  min_listings?: number;
}

export interface MarketStatisticsTable extends MarketStatisticsDTO {
  product_name: string;
  product_brand: string;
  spread_pct: number;
  discount_depth_pct: number;
}

export interface MarketStatisticsCard {
  product_id: UUID;
  product_name: string;
  product_brand: string;
  median_price: number;
  average_price: number;
  minimum_price: number;
  maximum_price: number;
  formatted_median: string;
  formatted_min: string;
  formatted_max: string;
  listing_count: number;
  spread_pct: number;
  discount_depth_pct: number;
  trend_pct: number;
}

export interface MarketStatisticsSummary {
  total_products: number;
  total_listings: number;
  avg_median: number;
  avg_spread: number;
}

// ============================================================================
// AI_ANALYSIS
// ============================================================================
export interface AIAnalysisDTO {
  id: UUID;
  listing_id: UUID;
  opportunity_score: number;
  seller_score: number;
  image_score: number;
  description_score: number;
  negotiation_score: number;
  fake_probability: number;
  confidence: number;
  recommendation: Recommendation;
  explanation: string | null;
  price_score?: number | null;
  risk_score?: number | null;
  overall_score?: number | null;
  confidence_label?: ConfidenceLabel | null;
  ai_summary?: string | null;
  expected_accepted_price?: number | null;
  negotiation_probability?: number | null;
  content_hash?: string | null;
  analyzed_at: ISODate;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface AIAnalysisResponse extends AIAnalysisDTO {
  listing?: ListingDTO | null;
  opportunity_tier?: OpportunityTier;
  risk_level?: RiskLevel;
  reasons?: string[];
  suggested_offer?: number | null;
  should_buy?: boolean;
}

export type AIAnalysisUpdate = Partial<
  Pick<AIAnalysisDTO, 'opportunity_score' | 'seller_score' | 'image_score' | 'description_score' | 'negotiation_score' | 'fake_probability' | 'confidence' | 'recommendation' | 'explanation' | 'price_score' | 'risk_score' | 'overall_score' | 'confidence_label' | 'ai_summary' | 'expected_accepted_price' | 'negotiation_probability' | 'content_hash'>
>;

export type AIAnalysisCreate = Pick<
  AIAnalysisDTO,
  'listing_id' | 'opportunity_score' | 'seller_score' | 'image_score' | 'description_score' | 'negotiation_score' | 'fake_probability' | 'confidence' | 'recommendation'
> & {
  explanation?: string;
  price_score?: number;
  risk_score?: number;
  overall_score?: number;
  confidence_label?: ConfidenceLabel;
  ai_summary?: string;
  expected_accepted_price?: number;
  negotiation_probability?: number;
  content_hash?: string;
};

export interface AIAnalysisFilter {
  listing_id?: UUID;
  min_opportunity?: number;
  min_confidence?: number;
  recommendation?: Recommendation;
}

export interface AIAnalysisTable extends AIAnalysisDTO {
  listing_title: string;
  listing_price: number;
  opportunity_tier: OpportunityTier;
  risk_level: RiskLevel;
}

export interface AIAnalysisCard {
  listing_id: UUID;
  listing_title: string;
  listing_price: number;
  opportunity_score: number;
  opportunity_tier: OpportunityTier;
  seller_score: number;
  image_score: number;
  description_score: number;
  negotiation_score: number;
  price_score: number;
  risk_score: number;
  overall_score: number;
  fake_probability: number;
  risk_level: RiskLevel;
  confidence: number;
  confidence_label: ConfidenceLabel;
  recommendation: Recommendation;
  ai_summary: string;
  reasons: string[];
  suggested_offer: number | null;
  expected_accepted_price: number | null;
  negotiation_probability: number;
  should_buy: boolean;
}

export interface AIAnalysisSummary {
  total: number;
  avg_opportunity: number;
  avg_seller: number;
  avg_confidence: number;
  buy_recommendations: number;
  avoid_count: number;
}

// ============================================================================
// SEARCH
// ============================================================================
export type SearchEntityType = 'listing' | 'product' | 'seller' | 'district' | 'provider';

export interface SearchResult {
  type: SearchEntityType;
  id: UUID;
  title: string;
  subtitle: string;
  href: string;
  score: number;
  icon: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  product_groups?: ProductMatchGroup[];
  total: number;
  duration_ms: number;
}

export interface ProductMatchProvider {
  id: UUID;
  slug: string;
  name: string;
}

export type GroupedDealScoreLabel =
  | 'excellent-deal'
  | 'good-deal'
  | 'fair-price'
  | 'expensive'
  | 'overpriced';

export interface GroupedProductDealScore {
  lowest_price: number;
  highest_price: number;
  average_price: number;
  market_average: number;
  deal_percentage: number;
  confidence: number;
  label: GroupedDealScoreLabel;
  label_display: string;
}

export interface ProductMatchGroup {
  id: string;
  product_family: string;
  edition: string;
  storage: string;
  label: string;
  listing_count: number;
  lowest_price: number;
  highest_price: number;
  average_price: number;
  providers: ProductMatchProvider[];
  listing_ids: UUID[];
  deal_score?: GroupedProductDealScore;
}

export interface GroupedProductSearchResponse {
  query: string;
  groups: ProductMatchGroup[];
  total_listings: number;
  duration_ms: number;
}

// ============================================================================
// DASHBOARD
// ============================================================================
export interface DashboardStats {
  total_listings: number;
  active_listings: number;
  excellent_deals: number;
  good_deals: number;
  flagged_listings: number;
  avg_discount: number;
  total_sellers: number;
  verified_sellers: number;
  total_products: number;
  active_providers: number;
  total_favorites: number;
  active_alarms: number;
  triggered_alarms: number;
}

export interface DashboardProviderStat {
  provider_id: UUID;
  provider_name: string;
  provider_slug: string;
  provider_color: string;
  listing_count: number;
  active_listings: number;
  new_today: number;
}

export interface DashboardCategoryStat {
  category_id: UUID;
  category_name: string;
  category_slug: string;
  category_icon: string;
  product_count: number;
  total_listings: number;
  avg_median: number;
  avg_trend: number;
}

export interface DashboardData {
  stats: DashboardStats;
  providers: DashboardProviderStat[];
  categories: DashboardCategoryStat[];
  top_deals: ListingCard[];
  recent_listings: ListingCard[];
}

// ============================================================================
// LEGACY COMPATIBILITY TYPES — used by existing pages, config/site, mock-data
// These preserve the old camelCase shapes so existing code compiles unchanged.
// ============================================================================

export type DealScore = 'excellent' | 'good' | 'fair' | 'overpriced' | 'risky';
export type ProviderId = 'sahibinden' | 'letgo' | 'dolap';
export type SyncStatus = 'idle' | 'running' | 'success' | 'error' | 'paused';

export interface Provider {
  id: ProviderId;
  name: string;
  domain: string;
  color: string;
  enabled: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface ProductModel {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  brand: string;
  releaseYear: number;
  msrpTry: number;
  refPriceTry: number;
}

export interface Seller {
  id: string;
  providerId: string;
  externalId: string;
  displayName: string;
  avatarUrl?: string;
  rating: number;
  totalSales: number;
  memberSince: number;
  verified: boolean;
  riskLevel: RiskLevel;
}

export interface Listing {
  id: string;
  providerId: ProviderId;
  productModelId: string;
  title: string;
  priceTry: number;
  condition: ConditionGrade;
  city: string;
  district: string;
  seller: Seller;
  url: string;
  source_url: string;
  imageUrl?: string;
  postedAt: string;
  scrapedAt: string;
  dealScore: DealScore;
  priceVsMarketPct: number;
  negotiable: boolean;
  flagged: boolean;
  favorited: boolean;
}

export interface MarketStats {
  productModelId: string;
  medianPriceTry: number;
  minPriceTry: number;
  maxPriceTry: number;
  avgPriceTry: number;
  sampleCount: number;
  trendPct7d: number;
  trendPct30d: number;
}

export interface PricePoint {
  date: string;
  median: number;
  min: number;
  max: number;
}

export interface DealInsight {
  listingId: string;
  shouldBuy: boolean;
  confidence: number;
  reasons: string[];
  suggestedOfferTry?: number;
  betterListings: string[];
  fakeProbability: number;
}

export interface NotificationItem {
  id: string;
  kind: 'deal' | 'price-drop' | 'risk' | 'sync' | 'system';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface SyncRun {
  id: string;
  providerId: ProviderId;
  status: SyncStatus;
  startedAt: string;
  finishedAt?: string;
  foundCount: number;
  newCount: number;
  updatedCount: number;
  errorCount: number;
  avgResponseMs: number;
  durationMs: number;
}

// ============================================================================
// PROVIDER ARCHITECTURE — sync infrastructure types
// ============================================================================
export type SyncRunStatus = 'running' | 'success' | 'partial' | 'error';
export type SyncLogLevel = 'info' | 'warn' | 'error';
export type ProviderStatusValue = 'idle' | 'running' | 'success' | 'error' | 'paused';

/** Raw listing as returned by a provider's API/HTML before normalization. */
export interface RawListing {
  externalId: string;
  title: string;
  price: number;
  currency?: string;
  url: string;
  imageUrls?: string[];
  description?: string;
  district?: string;
  city?: string;
  listingDate?: string;
  condition?: string;
  sellerName?: string;
  sellerRating?: number;
  sellerMemberSince?: number;
  sellerVerified?: boolean;
}

/** Normalized listing ready for database insertion. */
export interface NormalizedListing {
  external_listing_id: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  source_url: string;
  image_urls: string[];
  description: string | null;
  district: string;
  city: string;
  listing_date: string | null;
  condition: string;
  seller_display_name: string | null;
  seller_rating: number | null;
  seller_member_since: number | null;
  seller_verified: boolean;
}

export interface ProviderSearchResult {
  listings: RawListing[];
  totalFound: number;
  durationMs: number;
}

export interface ProviderHealthCheck {
  healthy: boolean;
  responseMs: number;
  message: string;
}

export interface SyncLogEntry {
  level: SyncLogLevel;
  message: string;
  timestamp: string;
}

export interface ProviderStatusDTO {
  id: string;
  provider_id: string;
  status: ProviderStatusValue;
  last_sync_at: string | null;
  last_sync_duration_ms: number | null;
  total_listings_imported: number;
  total_errors: number;
  avg_response_ms: number | null;
  interval_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SyncRunDTO {
  id: string;
  status: SyncRunStatus;
  interval_minutes: number;
  started_at: string;
  finished_at: string | null;
  total_found: number;
  total_imported: number;
  total_updated: number;
  total_failed: number;
  error_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncLogDTO {
  id: string;
  sync_run_id: string;
  provider_id: string;
  status: SyncRunStatus | 'skipped';
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  found_count: number;
  imported_count: number;
  updated_count: number;
  failed_count: number;
  error_message: string | null;
  avg_response_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSyncData {
  providerStatus: ProviderStatusDTO[];
  lastSync: SyncRunDTO | null;
  importedToday: number;
  listingsToday: number;
  priceChangesToday: number;
  recentLogs: SyncLogDTO[];
}
