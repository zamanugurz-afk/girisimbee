import type {
  Listing,
  MarketStats,
  PricePoint,
  NotificationItem,
  SyncRun,
  DealInsight,
} from '@/types';
import { PRODUCT_MODELS, PROVIDERS } from '@/config/site';

const DISTRICTS = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Bakırköy', 'Maltepe', 'Ataşehir', 'Beyoğlu'];
const SELLER_NAMES = [
  'Mert K.', 'Ayşe T.', 'Can D.', 'Zeynep A.', 'Burak Y.', 'Elif S.', 'Emre B.',
  'Selin Ö.', 'Okan P.', 'Deniz R.', 'Kerem U.', 'Buse H.', 'Arda M.', 'Gizem N.',
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60000).toISOString();
}

const CONDITIONS: Listing['condition'][] = ['new', 'like-new', 'good', 'fair'];
const DEAL_SCORES = ['excellent', 'good', 'fair', 'overpriced', 'risky'] as const;

let seed = 42;
function rng() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function listingSourceUrl(providerId: string, listingId: string): string {
  switch (providerId) {
    case 'sahibinden':
      return `https://www.sahibinden.com/ilan/${listingId}`;
    case 'letgo':
      return `https://www.letgo.com/item/${listingId}`;
    case 'dolap':
      return `https://dolap.com/urun/${listingId}`;
    default:
      return `https://www.${providerId}.com/item/${listingId}`;
  }
}

export function generateListings(count = 48): Listing[] {
  seed = 42;
  const listings: Listing[] = [];
  for (let i = 0; i < count; i++) {
    const product = pick(PRODUCT_MODELS, i * 7 + 3);
    const provider = pick(PROVIDERS, i);
    const r = rng();
    const variance = (r - 0.5) * 0.45;
    const priceTry = Math.round(product.refPriceTry * (1 + variance));
    const priceVsMarketPct = Math.round(((priceTry - product.refPriceTry) / product.refPriceTry) * 1000) / 10;
    let dealScore: Listing['dealScore'];
    if (priceVsMarketPct <= -12) dealScore = 'excellent';
    else if (priceVsMarketPct <= -4) dealScore = 'good';
    else if (priceVsMarketPct <= 6) dealScore = 'fair';
    else dealScore = 'overpriced';
    if (r > 0.93) dealScore = 'risky';
    const sellerIdx = Math.floor(rng() * SELLER_NAMES.length);
    const seller = {
      id: `seller-${sellerIdx}`,
      providerId: provider.id,
      externalId: `${provider.id}-${sellerIdx}`,
      displayName: SELLER_NAMES[sellerIdx],
      rating: Math.round((3.4 + rng() * 1.6) * 10) / 10,
      totalSales: Math.floor(rng() * 480) + 5,
      memberSince: 2016 + Math.floor(rng() * 9),
      verified: rng() > 0.6,
      riskLevel: (rng() > 0.78 ? 'high' : rng() > 0.45 ? 'medium' : 'low') as Listing['seller']['riskLevel'],
    };
    const listingId = `listing-${i + 1}`;
    const sourceUrl = listingSourceUrl(provider.id, listingId);
    listings.push({
      id: listingId,
      providerId: provider.id,
      productModelId: product.id,
      title: `${product.name} ${pick(['1 controller', '2 controllers', 'box + cable', 'mint condition', 'sealed', 'used'], i)}`,
      priceTry,
      condition: pick(CONDITIONS, i),
      city: 'Istanbul',
      district: pick(DISTRICTS, i),
      seller,
      url: sourceUrl,
      source_url: sourceUrl,
      imageUrl: undefined,
      postedAt: hoursAgo(Math.floor(rng() * 96)),
      scrapedAt: minutesAgo(Math.floor(rng() * 50)),
      dealScore,
      priceVsMarketPct,
      negotiable: rng() > 0.4,
      flagged: dealScore === 'risky',
      favorited: i % 9 === 0,
    });
  }
  return listings;
}

export function generateMarketStats(): MarketStats[] {
  return PRODUCT_MODELS.map((p, idx) => {
    const r = (idx * 37) % 100;
    const median = p.refPriceTry;
    const min = Math.round(median * (0.78 + (r % 10) / 100));
    const max = Math.round(median * (1.2 + (r % 12) / 100));
    return {
      productModelId: p.id,
      medianPriceTry: median,
      minPriceTry: min,
      maxPriceTry: max,
      avgPriceTry: Math.round((min + max) / 2),
      sampleCount: 20 + (r % 80),
      trendPct7d: ((r % 20) - 10) / 1,
      trendPct30d: ((r % 40) - 20) / 1,
    };
  });
}

export function generatePriceHistory(productModelId: string, days = 30): PricePoint[] {
  const product = PRODUCT_MODELS.find((p) => p.id === productModelId);
  if (!product) return [];
  const base = product.refPriceTry;
  const points: PricePoint[] = [];
  for (let d = days; d >= 0; d--) {
    const t = (days - d) / days;
    const wave = Math.sin(d / 4) * 0.03 + Math.cos(d / 9) * 0.02;
    const drift = t * 0.04;
    const median = Math.round(base * (1 + wave + drift));
    points.push({
      date: daysAgo(d),
      median,
      min: Math.round(median * 0.86),
      max: Math.round(median * 1.18),
    });
  }
  return points;
}

export function generateInsight(listingId: string): DealInsight {
  const r = (parseInt(listingId.split('-')[1] ?? '1') * 13) % 100;
  const shouldBuy = r > 55;
  const confidence = Math.round(60 + (r % 38));
  const reasons: string[] = [];
  if (r > 70) reasons.push('Price is 12% below the 30-day median for this model.');
  if (r > 55) reasons.push('Seller rating above 4.5 with verified badge.');
  if (r > 80) reasons.push('Similar listings sold within 4 days on average.');
  if (r < 45) reasons.push('Price sits above current market median.');
  if (r < 30) reasons.push('Seller account is younger than 30 days — verify identity.');
  return {
    listingId,
    shouldBuy,
    confidence,
    reasons: reasons.length ? reasons : ['Not enough signal to recommend a buy.'],
    suggestedOfferTry: shouldBuy ? undefined : Math.round(20000 * (0.8 + (r % 20) / 100)),
    betterListings: r > 50 ? [`listing-${(r % 12) + 1}`, `listing-${(r % 8) + 20}`] : [],
    fakeProbability: r < 25 ? Math.round(35 + (r % 40)) : Math.round(r % 18),
  };
}

export function generateNotifications(): NotificationItem[] {
  const base = process.env.NEXT_PUBLIC_OWNER_TOKEN ? `/${process.env.NEXT_PUBLIC_OWNER_TOKEN}` : '/demo-token';
  return [
    { id: 'n1', kind: 'deal', title: 'New excellent deal — PS5 Slim', body: 'Found at ₺18,400, 11% below market.', createdAt: minutesAgo(8), read: false, link: `${base}/deals` },
    { id: 'n2', kind: 'price-drop', title: 'Apple Watch Series 9 dropped 6%', body: 'Median fell from ₺13,900 to ₺13,100.', createdAt: hoursAgo(2), read: false, link: `${base}/analytics` },
    { id: 'n3', kind: 'risk', title: 'Risky listing flagged', body: 'Seller risk high on Letgo Xbox Series X.', createdAt: hoursAgo(5), read: true, link: `${base}/listings` },
    { id: 'n4', kind: 'sync', title: 'Sahibinden sync complete', body: '38 new listings, 0 errors.', createdAt: hoursAgo(6), read: true, link: `${base}/sources` },
    { id: 'n5', kind: 'system', title: 'Daily report ready', body: '12 deals surfaced today across 3 sources.', createdAt: hoursAgo(22), read: true },
  ];
}

export function generateSyncRuns(): SyncRun[] {
  return PROVIDERS.map((p, i) => ({
    id: `sync-${p.id}`,
    providerId: p.id,
    status: i === 2 ? 'running' : i === 1 ? 'error' : 'success',
    startedAt: hoursAgo(i + 1),
    finishedAt: i === 2 ? undefined : hoursAgo(i),
    foundCount: 30 + i * 12,
    newCount: 8 + i * 4,
    updatedCount: 5 + i * 3,
    errorCount: i === 1 ? 3 : 0,
    avgResponseMs: 180 + i * 60,
    durationMs: 2400 + i * 1200,
  }));
}
