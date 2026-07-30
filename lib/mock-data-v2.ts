import type {
  CategoryDTO,
  ProductDTO,
  ProviderDTO,
  SellerDTO,
  ListingResponse,
  MarketStatisticsResponse,
  PriceHistoryDTO,
  AIAnalysisResponse,
  AlarmDTO,
  FavoriteDTO,
  DashboardData,
  ListingCard,
  ListingSummary,
  Recommendation,
  OpportunityTier,
  RiskLevel,
  ConditionGrade,
} from '@/types';
import { AIEngine } from '@/lib/engines/ai-engine';
import { PriceEngine } from '@/lib/engines/price-engine';

// ============================================================================
// CONSTANTS
// ============================================================================
const ISTANBUL_DISTRICTS = [
  'Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Bakırköy', 'Maltepe',
  'Ataşehir', 'Beyoğlu', 'Fatih', 'Sarıyer', 'Beşiktas', 'Kartal',
  'Pendik', 'Ümraniye', 'Eyüpsultan', 'Başakşehir', 'Küçükçekmece',
  'Avcılar', 'Beylikdüzü', 'Sancaktepe', 'Çekmeköy', 'Şile',
];

const SELLER_NAMES = [
  'Mert K.', 'Ayşe T.', 'Can D.', 'Zeynep A.', 'Burak Y.', 'Elif S.',
  'Emre B.', 'Selin Ö.', 'Okan P.', 'Deniz R.', 'Kerem U.', 'Buse H.',
  'Arda M.', 'Gizem N.', 'Cem L.', 'Damla F.', 'Tolga E.', 'Pınar V.',
  'Serkan W.', 'Nazlı J.', 'Hakan G.', 'Sıla Z.', 'Barış X.', 'Derya Q.',
  'Mert K.', 'Ali C.', 'Murat S.', 'Hülya D.', 'Kaan A.', 'Yasemin E.',
];

const TITLE_SUFFIXES = [
  '1 controller', '2 controllers', 'box + cable', 'mint condition',
  'sealed', 'used', 'like new', 'warranty included', 'original box',
  'charging cable', 'extra game', 'case included', 'screen protector',
  '32GB storage', 'GPS + Cellular', 'stainless steel', 'aluminum',
];

const DESCRIPTIONS = [
  'Az kullanıldı, temiz ve sorunsuz. Orijinal kutusu ve kablosu mevcut. Garantisi devam ediyor.',
  'İki ay kullanıldı, yeni gibi. Hiçbir çiziği yok. Tüm aksesuarları kutusunda.',
  'Temiz kullanılmıştır. Şarj kablosu ve kutu dahil. Hediye oyun kasası.',
  'Sıfır aldım birkaç kez kullandım. Hiçbir sorunu yok. Acil satılık.',
  'Kusursuz durumda. Orijinal fatura mevcut. Pazarlık etmeyin lütfen.',
  'Garantili, faturalı, kutulu. Kullanılmamış gibi temiz.',
  '1 yıl kullanıldı. Çizik yok. Tüm parçaları tam. Fiyat sabittir.',
  'Yeni gibi durumda. Orijinal kutu ve aksesuarlar dahil. Hızlı teslim.',
  'Az kullanılmış, bakımlı. Hiçbir sorunu yok. Tüm fonksiyonlar çalışıyor.',
  'Temiz, sorunsuz, kutulu. Şarj aleti ve ekstra kablosu hediye.',
  'Çok temiz kullanılmış. Hiçbir darbe almamış. Garantisi var.',
  '2 ay kullanıldı sonra kullanmadım. Yeni gibi. Tüm aksesuarlar mevcut.',
  'Sahibinden temiz kullanılmış. Orijinal kutu ve fatura dahil.',
  'Az kullanılmış, çiziksiz, sorunsuz. Fiyat sabittir, pazarlık yok.',
  'Kutu, kablo ve kontrolcü dahil. Çok temiz durumda. Acil satılık.',
];

// ============================================================================
// SEED DATA — matches database seed
// ============================================================================
const CATEGORIES_SEED: CategoryDTO[] = [
  { id: 'cat-gaming', name: 'Gaming Consoles', slug: 'gaming-consoles', icon: 'Gamepad2', sort_order: 1, created_at: '', updated_at: '' },
  { id: 'cat-controllers', name: 'Controllers', slug: 'controllers', icon: 'Gamepad', sort_order: 2, created_at: '', updated_at: '' },
];

const PROVIDERS_SEED: ProviderDTO[] = [
  { id: 'prov-sahibinden', name: 'Sahibinden', slug: 'sahibinden', logo_url: null, website: 'https://www.sahibinden.com', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'prov-letgo', name: 'Letgo', slug: 'letgo', logo_url: null, website: 'https://www.letgo.com', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'prov-dolap', name: 'Dolap', slug: 'dolap', logo_url: null, website: 'https://www.dolap.com', is_enabled: true, created_at: '', updated_at: '' },
];

interface ProductSeed {
  id: string;
  categoryId: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  refPrice: number;
}

const PRODUCTS_SEED: ProductSeed[] = [
  { id: 'prod-ps5', categoryId: 'cat-gaming', name: 'PlayStation 5', brand: 'Sony', model: 'PS5', slug: 'playstation-5', refPrice: 23500 },
  { id: 'prod-ps5-slim', categoryId: 'cat-gaming', name: 'PlayStation 5 Slim', brand: 'Sony', model: 'PS5 Slim', slug: 'playstation-5-slim', refPrice: 20800 },
  { id: 'prod-ps5-pro', categoryId: 'cat-gaming', name: 'PlayStation 5 Pro', brand: 'Sony', model: 'PS5 Pro', slug: 'playstation-5-pro', refPrice: 31500 },
  { id: 'prod-xbox-sx', categoryId: 'cat-gaming', name: 'Xbox Series X', brand: 'Microsoft', model: 'Series X', slug: 'xbox-series-x', refPrice: 21700 },
  { id: 'prod-xbox-ss', categoryId: 'cat-gaming', name: 'Xbox Series S', brand: 'Microsoft', model: 'Series S', slug: 'xbox-series-s', refPrice: 11900 },
  { id: 'prod-dualsense', categoryId: 'cat-controllers', name: 'Sony DualSense', brand: 'Sony', model: 'DualSense', slug: 'dualsense', refPrice: 2200 },
  { id: 'prod-dualsense-edge', categoryId: 'cat-controllers', name: 'Sony DualSense Edge', brand: 'Sony', model: 'DualSense Edge', slug: 'dualsense-edge', refPrice: 8200 },
  { id: 'prod-xbox-controller', categoryId: 'cat-controllers', name: 'Xbox Wireless Controller (Series)', brand: 'Microsoft', model: 'Wireless Controller', slug: 'xbox-wireless-controller', refPrice: 2100 },
  { id: 'prod-xbox-elite-2', categoryId: 'cat-controllers', name: 'Xbox Elite Wireless Controller Series 2', brand: 'Microsoft', model: 'Elite Series 2', slug: 'xbox-elite-series-2', refPrice: 5800 },
];

const PROVIDER_COLORS: Record<string, string> = {
  'sahibinden': '#FFE000',
  'letgo': '#FF5A5F',
  'dolap': '#7B61FF',
};

// ============================================================================
// SEEDED RANDOM
// ============================================================================
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  bool(prob = 0.5): boolean {
    return this.next() < prob;
  }
}

// ============================================================================
// GENERATOR
// ============================================================================
const rng = new SeededRandom(42);
const priceEngine = new PriceEngine();
const aiEngine = new AIEngine();

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}
function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString();
}
function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function listingSourceUrl(providerSlug: string, listingId: string): string {
  switch (providerSlug) {
    case 'sahibinden':
      return `https://www.sahibinden.com/ilan/${listingId}`;
    case 'letgo':
      return `https://www.letgo.com/item/${listingId}`;
    case 'dolap':
      return `https://dolap.com/urun/${listingId}`;
    default:
      return `https://www.${providerSlug}.com/item/${listingId}`;
  }
}

function generateSellers(): SellerDTO[] {
  const sellers: SellerDTO[] = [];
  for (let i = 0; i < SELLER_NAMES.length; i++) {
    const provider = PROVIDERS_SEED[i % 3];
    sellers.push({
      id: `seller-${i + 1}`,
      provider_id: provider.id,
      external_id: `${provider.slug}-${i + 1}`,
      display_name: SELLER_NAMES[i],
      member_since: 2014 + rng.int(0, 10),
      listing_count: rng.int(3, 450),
      rating: Math.round((3.0 + rng.next() * 2.0) * 10) / 10,
      phone_verified: rng.bool(0.7),
      email_verified: rng.bool(0.4),
      created_at: isoDaysAgo(rng.int(30, 900)),
      updated_at: isoDaysAgo(rng.int(1, 30)),
    });
  }
  return sellers;
}

function generateAllListings(sellers: SellerDTO[]): ListingResponse[] {
  const listings: ListingResponse[] = [];
  const now = Date.now();

  for (let i = 0; i < 520; i++) {
    const product = PRODUCTS_SEED[i % PRODUCTS_SEED.length];
    const provider = PROVIDERS_SEED[i % 3];
    const seller = sellers[(i * 7) % sellers.length];

    const variance = (rng.next() - 0.45) * 0.4;
    const price = Math.round(product.refPrice * (1 + variance));
    const conditions: ConditionGrade[] = ['new', 'like-new', 'good', 'fair'];
    const condition = rng.pick(conditions);
    const ageHours = rng.int(1, 720);
    const firstSeen = new Date(now - ageHours * 3600000).toISOString();

    const imageCount = rng.int(0, 6);
    const image_urls = Array.from({ length: imageCount }, (_, idx) =>
      `https://images.pexels.com/photos/${1000000 + rng.int(0, 9000000)}/pexels-photo-${1000000 + rng.int(0, 9000000)}.jpeg?auto=compress&cs=tinysrgb&w=600&_idx=${idx}`,
    );

    const listingId = `listing-${i + 1}`;
    const sourceUrl = listingSourceUrl(provider.slug, listingId);

    const listing: ListingResponse = {
      id: listingId,
      provider_id: provider.id,
      product_id: product.id,
      external_listing_id: `${provider.slug}-ext-${i + 1}`,
      title: `${product.name} ${rng.pick(TITLE_SUFFIXES)}`,
      description: rng.pick(DESCRIPTIONS),
      url: sourceUrl,
      source_url: sourceUrl,
      image_urls,
      price,
      previous_price: null,
      currency: 'TRY',
      district: rng.pick(ISTANBUL_DISTRICTS),
      city: 'Istanbul',
      listing_date: firstSeen,
      first_seen_at: firstSeen,
      last_seen_at: isoMinutesAgo(rng.int(1, 120)),
      condition,
      seller_id: seller.id,
      is_active: rng.bool(0.92),
      deleted_at: null,
      created_at: firstSeen,
      updated_at: isoHoursAgo(rng.int(1, 48)),
      provider: provider,
      product: {
        id: product.id,
        category_id: product.categoryId,
        name: product.name,
        brand: product.brand,
        model: product.model,
        slug: product.slug,
        image_url: null,
        is_active: true,
        created_at: '',
        updated_at: '',
      },
      seller: seller,
      ai_analysis: undefined,
      market_stats: undefined,
      is_favorite: i % 12 === 0,
    };
    listings.push(listing);
  }
  return listings;
}

function generateAllMarketStats(listings: ListingResponse[]): MarketStatisticsResponse[] {
  const stats: MarketStatisticsResponse[] = [];
  for (const product of PRODUCTS_SEED) {
    const productPrices = listings
      .filter((l) => l.product_id === product.id)
      .map((l) => l.price);
    const ps = priceEngine.stats(productPrices);
    stats.push({
      id: `stat-${product.id}`,
      product_id: product.id,
      average_price: ps.average,
      median_price: ps.median,
      minimum_price: ps.minimum,
      maximum_price: ps.maximum,
      listing_count: ps.count,
      updated_at: isoMinutesAgo(5),
      created_at: isoDaysAgo(30),
      updated_at_row: isoMinutesAgo(5),
      spread_pct: ps.spread_pct,
      discount_depth_pct: ps.median > 0 ? Math.round(((ps.median - ps.minimum) / ps.median) * 1000) / 10 : 0,
    });
  }
  return stats;
}

function generateAllAIAnalyses(listings: ListingResponse[], stats: MarketStatisticsResponse[]): AIAnalysisResponse[] {
  const analyses: AIAnalysisResponse[] = [];
  for (const listing of listings) {
    const stat = stats.find((s) => s.product_id === listing.product_id);
    const allPrices = listings
      .filter((l) => l.product_id === listing.product_id)
      .map((l) => l.price);
    const priceHistory = Array.from({ length: rng.int(3, 8) }, (_, idx) =>
      Math.round((stat?.median_price ?? listing.price) * (0.95 + rng.next() * 0.1)),
    );

    const result = aiEngine.analyze({
      listing: {
        id: listing.id,
        price: listing.price,
        condition: listing.condition,
        description: listing.description,
        image_urls: listing.image_urls,
        first_seen_at: listing.first_seen_at,
      },
      seller: listing.seller ?? null,
      marketMedian: stat?.median_price ?? listing.price,
      allPrices,
      priceHistory,
    });

    analyses.push({
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
      analyzed_at: isoMinutesAgo(rng.int(1, 60)),
      created_at: isoMinutesAgo(rng.int(1, 60)),
      updated_at: isoMinutesAgo(rng.int(1, 60)),
      opportunity_tier: result.opportunityTier,
      risk_level: result.riskLevel,
      reasons: result.reasons,
      suggested_offer: result.suggestedOffer,
      should_buy: result.shouldBuy,
    });
  }
  return analyses;
}

// ============================================================================
// CACHED DATASET
// ============================================================================
interface MockDataset {
  categories: CategoryDTO[];
  providers: ProviderDTO[];
  products: ProductDTO[];
  sellers: SellerDTO[];
  listings: ListingResponse[];
  stats: MarketStatisticsResponse[];
  analyses: AIAnalysisResponse[];
  alarms: AlarmDTO[];
  favorites: FavoriteDTO[];
  priceHistory: Record<string, PriceHistoryDTO[]>;
}

let _dataset: MockDataset | null = null;

function getDataset(): MockDataset {
  if (_dataset) return _dataset;
  const sellers = generateSellers();
  const listings = generateAllListings(sellers);
  const stats = generateAllMarketStats(listings);
  const analyses = generateAllAIAnalyses(listings, stats);

  const products: ProductDTO[] = PRODUCTS_SEED.map((p) => ({
    id: p.id,
    category_id: p.categoryId,
    name: p.name,
    brand: p.brand,
    model: p.model,
    slug: p.slug,
    image_url: null,
    is_active: true,
    created_at: '',
    updated_at: '',
  }));

  const alarms: AlarmDTO[] = [
    { id: 'alarm-1', product_id: 'prod-ps5', target_price: 20000, is_enabled: true, created_at: isoDaysAgo(10), updated_at: isoDaysAgo(2) },
    { id: 'alarm-2', product_id: 'prod-aw9', target_price: 11000, is_enabled: true, created_at: isoDaysAgo(5), updated_at: isoDaysAgo(1) },
    { id: 'alarm-3', product_id: 'prod-xbox-sx', target_price: 19000, is_enabled: false, created_at: isoDaysAgo(20), updated_at: isoDaysAgo(15) },
  ];

  const favorites: FavoriteDTO[] = listings
    .filter((l) => (l as ListingResponse).is_favorite)
    .slice(0, 8)
    .map((l) => ({
      id: `fav-${l.id}`,
      listing_id: l.id,
      notes: null,
      created_at: isoDaysAgo(rng.int(1, 15)),
      updated_at: isoDaysAgo(rng.int(0, 5)),
    }));

  const priceHistory: Record<string, PriceHistoryDTO[]> = {};
  for (const listing of listings.slice(0, 50)) {
    const points = rng.int(3, 10);
    priceHistory[listing.id] = Array.from({ length: points }, (_, idx) => ({
      id: `ph-${listing.id}-${idx}`,
      listing_id: listing.id,
      price: Math.round(listing.price * (0.95 + rng.next() * 0.1)),
      detected_at: isoDaysAgo(points - idx),
      created_at: isoDaysAgo(points - idx),
      updated_at: isoDaysAgo(points - idx),
    }));
  }

  _dataset = {
    categories: CATEGORIES_SEED,
    providers: PROVIDERS_SEED,
    products,
    sellers,
    listings,
    stats,
    analyses,
    alarms,
    favorites,
    priceHistory,
  };
  return _dataset;
}

// ============================================================================
// PUBLIC API
// ============================================================================
export function getMockCategories(): CategoryDTO[] {
  return getDataset().categories;
}

export function getMockProviders(): ProviderDTO[] {
  return getDataset().providers;
}

export function getMockProducts(): ProductDTO[] {
  return getDataset().products;
}

export function getMockSellers(): SellerDTO[] {
  return getDataset().sellers;
}

export function getMockListings(): ListingResponse[] {
  return getDataset().listings;
}

export function getMockStats(): MarketStatisticsResponse[] {
  return getDataset().stats;
}

export function getMockAnalyses(): AIAnalysisResponse[] {
  return getDataset().analyses;
}

export function getMockAlarms(): AlarmDTO[] {
  return getDataset().alarms;
}

export function getMockFavorites(): FavoriteDTO[] {
  return getDataset().favorites;
}

export function getMockPriceHistory(listingId: string): PriceHistoryDTO[] {
  return getDataset().priceHistory[listingId] ?? [];
}

export function getMockDashboardData(): DashboardData {
  const ds = getDataset();
  const listings = ds.listings;
  const priceEng = new PriceEngine();

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.is_active).length;

  const analysisById = new Map(ds.analyses.map((a) => [a.listing_id, a]));
  const enriched = listings.map((l) => {
    const ai = analysisById.get(l.id);
    const stat = ds.stats.find((s) => s.product_id === l.product_id);
    const oppPct = stat ? priceEng.opportunityPct(l.price, stat.median_price) : 0;
    return { listing: l, ai, oppPct };
  });

  const excellentDeals = enriched.filter((e) => e.ai && e.ai.opportunity_score >= 80).length;
  const goodDeals = enriched.filter((e) => e.ai && e.ai.opportunity_score >= 55 && e.ai.opportunity_score < 80).length;
  const flagged = enriched.filter((e) => e.ai && e.ai.fake_probability >= 40).length;
  const belowMarket = enriched.filter((e) => e.oppPct > 0);
  const avgDiscount = belowMarket.length > 0
    ? Math.round((belowMarket.reduce((a, e) => a + e.oppPct, 0) / belowMarket.length) * 10) / 10
    : 0;

  const verifiedSellers = ds.sellers.filter((s) => s.phone_verified || s.email_verified).length;

  const providerStats = ds.providers.map((p) => {
    const pListings = listings.filter((l) => l.provider_id === p.id);
    return {
      provider_id: p.id,
      provider_name: p.name,
      provider_slug: p.slug,
      provider_color: PROVIDER_COLORS[p.slug] ?? '#3B82F6',
      listing_count: pListings.length,
      active_listings: pListings.filter((l) => l.is_active).length,
      new_today: pListings.filter((l) => Date.now() - new Date(l.first_seen_at).getTime() < 86400000).length,
    };
  });

  const categoryStats = ds.categories.map((c) => {
    const cProducts = ds.products.filter((p) => p.category_id === c.id);
    const cStats = ds.stats.filter((s) => cProducts.some((p) => p.id === s.product_id));
    const avgMedian = cStats.length > 0 ? Math.round(cStats.reduce((a, s) => a + s.median_price, 0) / cStats.length) : 0;
    const totalListings = cStats.reduce((a, s) => a + s.listing_count, 0);
    return {
      category_id: c.id,
      category_name: c.name,
      category_slug: c.slug,
      category_icon: c.icon,
      product_count: cProducts.length,
      total_listings: totalListings,
      avg_median: avgMedian,
      avg_trend: 0,
    };
  });

  const topDeals = enriched
    .filter((e) => e.ai && e.ai.opportunity_score >= 55)
    .sort((a, b) => (b.ai!.opportunity_score) - (a.ai!.opportunity_score))
    .slice(0, 6)
    .map((e) => listingToCard(e.listing, e.ai!, ds, PROVIDER_COLORS));

  const recentListings = enriched
    .sort((a, b) => +new Date(b.listing.first_seen_at) - +new Date(a.listing.first_seen_at))
    .slice(0, 6)
    .map((e) => listingToCard(e.listing, e.ai!, ds, PROVIDER_COLORS));

  return {
    stats: {
      total_listings: totalListings,
      active_listings: activeListings,
      excellent_deals: excellentDeals,
      good_deals: goodDeals,
      flagged_listings: flagged,
      avg_discount: avgDiscount,
      total_sellers: ds.sellers.length,
      verified_sellers: verifiedSellers,
      total_products: ds.products.length,
      active_providers: ds.providers.length,
      total_favorites: ds.favorites.length,
      active_alarms: ds.alarms.filter((a) => a.is_enabled).length,
      triggered_alarms: 1,
    },
    providers: providerStats,
    categories: categoryStats,
    top_deals: topDeals,
    recent_listings: recentListings,
  };
}

export function getMockListingSummary(): ListingSummary {
  const ds = getDataset();
  const priceEng = new PriceEngine();
  const active = ds.listings.filter((l) => l.is_active).length;
  const excellent = ds.analyses.filter((a) => a.opportunity_score >= 80).length;
  const flagged = ds.analyses.filter((a) => a.fake_probability >= 40).length;
  const belowMarket = ds.listings.filter((l) => {
    const stat = ds.stats.find((s) => s.product_id === l.product_id);
    return stat && priceEng.opportunityPct(l.price, stat.median_price) > 0;
  });
  const avgDiscount = belowMarket.length > 0
    ? Math.round((belowMarket.reduce((a, l) => {
        const stat = ds.stats.find((s) => s.product_id === l.product_id)!;
        return a + priceEng.opportunityPct(l.price, stat.median_price);
      }, 0) / belowMarket.length) * 10) / 10
    : 0;
  return {
    total: ds.listings.length,
    active,
    excellent_deals: excellent,
    flagged,
    avg_discount: avgDiscount,
  };
}

// ============================================================================
// HELPERS
// ============================================================================
function listingToCard(
  listing: ListingResponse,
  ai: AIAnalysisResponse,
  ds: MockDataset,
  colors: Record<string, string>,
): ListingCard {
  const stat = ds.stats.find((s) => s.product_id === listing.product_id);
  const priceEng = new PriceEngine();
  const oppPct = stat ? priceEng.opportunityPct(listing.price, stat.median_price) : 0;
  const discPct = stat ? priceEng.discountPct(listing.price, stat.median_price) : 0;
  const seller = listing.seller;
  const provider = listing.provider;
  const product = listing.product;

  const conditionLabels: Record<string, string> = {
    'new': 'New', 'like-new': 'Like new', 'good': 'Good', 'fair': 'Fair', 'poor': 'Poor',
  };

  let dealScore = 'fair';
  if (oppPct <= -12 || ai.opportunity_score >= 80) dealScore = 'excellent';
  else if (oppPct <= -4 || ai.opportunity_score >= 68) dealScore = 'good';
  else if (oppPct > 6) dealScore = 'overpriced';
  if (ai.fake_probability >= 40) dealScore = 'risky';

  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    currency: listing.currency,
    formatted_price: `₺${listing.price.toLocaleString('tr-TR')}`,
    product_name: product?.name ?? '',
    product_slug: product?.slug ?? '',
    product_brand: product?.brand ?? '',
    provider_name: provider?.name ?? '',
    provider_slug: provider?.slug ?? '',
    provider_color: provider ? (colors[provider.slug] ?? '#3B82F6') : '#3B82F6',
    image_url: listing.image_urls[0] ?? null,
    district: listing.district,
    city: listing.city,
    condition: listing.condition,
    condition_label: conditionLabels[listing.condition] ?? listing.condition,
    seller_name: seller?.display_name ?? 'Unknown',
    seller_rating: seller?.rating ?? 0,
    seller_verified: (seller?.phone_verified ?? false) || (seller?.email_verified ?? false),
    seller_trust_score: ai.seller_score,
    seller_risk_level: ai.risk_level ?? 'medium',
    opportunity_score: ai.opportunity_score,
    opportunity_tier: ai.opportunity_tier as OpportunityTier ?? 'average',
    discount_pct: discPct,
    price_vs_market_pct: oppPct,
    deal_score: dealScore,
    flagged: ai.fake_probability >= 40,
    negotiable: ai.negotiation_score >= 50,
    is_favorite: ds.favorites.some((f) => f.listing_id === listing.id),
    listing_date: listing.listing_date,
    first_seen_at: listing.first_seen_at,
    time_ago: formatTimeAgo(listing.first_seen_at),
    url: listing.source_url,
    source_url: listing.source_url,
  };
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ============================================================================
// LEGACY COMPATIBILITY — old mock-data exports used by existing pages
// ============================================================================
export interface LegacyListing {
  id: string;
  providerId: string;
  productModelId: string;
  title: string;
  priceTry: number;
  condition: string;
  city: string;
  district: string;
  seller: {
    id: string;
    providerId: string;
    externalId: string;
    displayName: string;
    avatarUrl?: string;
    rating: number;
    totalSales: number;
    memberSince: number;
    verified: boolean;
    riskLevel: string;
  };
  url: string;
  source_url: string;
  imageUrl?: string;
  postedAt: string;
  scrapedAt: string;
  dealScore: string;
  priceVsMarketPct: number;
  negotiable: boolean;
  flagged: boolean;
  favorited: boolean;
}

export function generateListings(count = 48): LegacyListing[] {
  const ds = getDataset();
  const priceEng = new PriceEngine();
  return ds.listings.slice(0, count).map((l) => {
    const stat = ds.stats.find((s) => s.product_id === l.product_id);
    const ai = ds.analyses.find((a) => a.listing_id === l.id);
    const oppPct = stat ? priceEng.opportunityPct(l.price, stat.median_price) : 0;
    let dealScore = 'fair';
    if (oppPct <= -12) dealScore = 'excellent';
    else if (oppPct <= -4) dealScore = 'good';
    else if (oppPct > 6) dealScore = 'overpriced';
    if (ai && ai.fake_probability >= 40) dealScore = 'risky';
    return {
      id: l.id,
      providerId: l.provider_id,
      productModelId: l.product_id,
      title: l.title,
      priceTry: l.price,
      condition: l.condition,
      city: l.city,
      district: l.district,
      seller: {
        id: l.seller?.id ?? '',
        providerId: l.seller?.provider_id ?? '',
        externalId: l.seller?.external_id ?? '',
        displayName: l.seller?.display_name ?? 'Unknown',
        rating: l.seller?.rating ?? 0,
        totalSales: l.seller?.listing_count ?? 0,
        memberSince: l.seller?.member_since ?? 2020,
        verified: (l.seller?.phone_verified ?? false) || (l.seller?.email_verified ?? false),
        riskLevel: ai?.risk_level ?? 'low',
      },
      url: l.url,
      source_url: l.source_url,
      imageUrl: l.image_urls[0],
      postedAt: l.first_seen_at,
      scrapedAt: l.last_seen_at,
      dealScore,
      priceVsMarketPct: oppPct,
      negotiable: ai ? ai.negotiation_score >= 50 : false,
      flagged: ai ? ai.fake_probability >= 40 : false,
      favorited: ds.favorites.some((f) => f.listing_id === l.id),
    };
  });
}

export interface LegacyMarketStats {
  productModelId: string;
  medianPriceTry: number;
  minPriceTry: number;
  maxPriceTry: number;
  avgPriceTry: number;
  sampleCount: number;
  trendPct7d: number;
  trendPct30d: number;
}

export function generateMarketStats(): LegacyMarketStats[] {
  const ds = getDataset();
  return ds.stats.map((s) => ({
    productModelId: s.product_id,
    medianPriceTry: s.median_price,
    minPriceTry: s.minimum_price,
    maxPriceTry: s.maximum_price,
    avgPriceTry: s.average_price,
    sampleCount: s.listing_count,
    trendPct7d: rng.int(-8, 8),
    trendPct30d: rng.int(-15, 15),
  }));
}

export interface LegacyPricePoint {
  date: string;
  median: number;
  min: number;
  max: number;
}

export function generatePriceHistory(productModelId: string, days = 30): LegacyPricePoint[] {
  const ds = getDataset();
  const stat = ds.stats.find((s) => s.product_id === productModelId);
  const base = stat?.median_price ?? 20000;
  const points: LegacyPricePoint[] = [];
  for (let d = days; d >= 0; d--) {
    const wave = Math.sin(d / 4) * 0.03 + Math.cos(d / 9) * 0.02;
    const median = Math.round(base * (1 + wave));
    points.push({
      date: isoDaysAgo(d),
      median,
      min: Math.round(median * 0.86),
      max: Math.round(median * 1.18),
    });
  }
  return points;
}

export interface LegacyNotification {
  id: string;
  kind: 'deal' | 'price-drop' | 'risk' | 'sync' | 'system';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export function generateNotifications(): LegacyNotification[] {
  const base = process.env.NEXT_PUBLIC_OWNER_TOKEN ? `/${process.env.NEXT_PUBLIC_OWNER_TOKEN}` : '/demo-token';
  return [
    { id: 'n1', kind: 'deal', title: 'New excellent deal — PS5 Slim', body: 'Found at ₺18,400, 11% below market.', createdAt: isoMinutesAgo(8), read: false, link: `${base}/deals` },
    { id: 'n2', kind: 'price-drop', title: 'Apple Watch Series 9 dropped 6%', body: 'Median fell from ₺13,900 to ₺13,100.', createdAt: isoHoursAgo(2), read: false, link: `${base}/analytics` },
    { id: 'n3', kind: 'risk', title: 'Risky listing flagged', body: 'Seller risk high on Letgo Xbox Series X.', createdAt: isoHoursAgo(5), read: true, link: `${base}/listings` },
    { id: 'n4', kind: 'sync', title: 'Sahibinden sync complete', body: '38 new listings, 0 errors.', createdAt: isoHoursAgo(6), read: true, link: `${base}/sources` },
    { id: 'n5', kind: 'system', title: 'Daily report ready', body: '12 deals surfaced today across 3 sources.', createdAt: isoHoursAgo(22), read: true },
  ];
}

export interface LegacySyncRun {
  id: string;
  providerId: string;
  status: 'idle' | 'running' | 'success' | 'error' | 'paused';
  startedAt: string;
  finishedAt?: string;
  foundCount: number;
  newCount: number;
  errorCount: number;
}

export function generateSyncRuns(): LegacySyncRun[] {
  return PROVIDERS_SEED.map((p, i) => ({
    id: `sync-${p.id}`,
    providerId: p.id,
    status: i === 2 ? 'running' : i === 1 ? 'error' : 'success',
    startedAt: isoHoursAgo(i + 1),
    finishedAt: i === 2 ? undefined : isoHoursAgo(i),
    foundCount: 30 + i * 12,
    newCount: 8 + i * 4,
    errorCount: i === 1 ? 3 : 0,
  }));
}

export interface LegacyInsight {
  listingId: string;
  shouldBuy: boolean;
  confidence: number;
  reasons: string[];
  suggestedOfferTry?: number;
  betterListings: string[];
  fakeProbability: number;
}

export function generateInsight(listingId: string): LegacyInsight {
  const ds = getDataset();
  const ai = ds.analyses.find((a) => a.listing_id === listingId);
  if (ai) {
    return {
      listingId,
      shouldBuy: ai.recommendation === 'buy' || ai.recommendation === 'negotiate',
      confidence: ai.confidence,
      reasons: ai.reasons ?? [],
      suggestedOfferTry: ai.suggested_offer ?? undefined,
      betterListings: [],
      fakeProbability: ai.fake_probability,
    };
  }
  return {
    listingId,
    shouldBuy: false,
    confidence: 50,
    reasons: ['No analysis available.'],
    betterListings: [],
    fakeProbability: 0,
  };
}

// Re-export for types used by existing code
export type { Recommendation, OpportunityTier, RiskLevel };
