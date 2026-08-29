import type { MarketItem } from '@/features/admin/market/types/market.types';
import { MARKET_MAX_PUBLISHED } from '@/features/admin/market/types/market.types';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';

/** Homepage MARKET teaser — 4 sponsored opportunity ads for 4-col bento grid symmetry. */
export const MARKET_HOME_PREVIEW_COUNT = 4;

/** Verified corporate sponsored opportunities and strategic business solutions. */
export const MOCK_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'market-ad-1',
    title: 'iyzico ile Girişiminiz İçin Güvenli ve Hızlı Ödeme Altyapısı',
    description:
      'Tüm kredi kartlarından tek tıkla ödeme alın, ertesi gün hesabınıza geçsin. Girişimbee üyelerine özel komisyon avantajı.',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Çözümü İncele',
    sortOrder: 1,
    status: 'published',
    publishedAt: '2026-08-15T10:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'market-ad-2',
    title: 'AWS Cloud ve Yapay Zeka Girişimlerine 5.000$ Bulut Kredisi',
    description:
      'Ölçeklenebilir sunucu, GPU altyapısı ve teknik mimari mentorluğu ile girişiminizi AWS üzerinde hızla büyütün.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Fırsatı Keşfet',
    sortOrder: 2,
    status: 'published',
    publishedAt: '2026-08-15T11:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-15T11:00:00.000Z',
    updatedAt: '2026-08-15T11:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'market-ad-3',
    title: 'GrowthBee ile B2B ve E-Ticaret Büyüme ve Reklam Çözümleri',
    description:
      'Yüksek bütçeli Meta ve Google Ads kampanyalarınızı ROAS odaklı yönetin. Kurumsal performans pazarlama iş birliği.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Detaylara Bak',
    sortOrder: 3,
    status: 'published',
    publishedAt: '2026-08-15T12:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-15T12:00:00.000Z',
    updatedAt: '2026-08-15T12:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'market-ad-4',
    title: 'LegalTech ile Otomatik Hissedar ve Yatırım Sözleşmeleri Paketi',
    description:
      'Girişimler için standart SAFE, Gizlilik (NDA) ve Ortaklık sözleşmelerini avukat onaylı şablonlarla dakikalar içinde hazırlayın.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Paketi İncele',
    sortOrder: 4,
    status: 'published',
    publishedAt: '2026-08-16T09:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-16T09:00:00.000Z',
    updatedAt: '2026-08-16T09:00:00.000Z',
    deletedAt: null,
  },
];

export function cloneMockMarketItems(): MarketItem[] {
  return MOCK_MARKET_ITEMS.map((item) => ({ ...item }));
}

/** All published MARKET ads (full catalog page). */
export function getMockPublishedMarketItems(items?: MarketItem[]): MarketItem[] {
  const source = items ?? MOCK_MARKET_ITEMS;
  return source
    .filter((item) => item.status === 'published' && !item.deletedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, MARKET_MAX_PUBLISHED)
    .map(toPublicMarketItem);
}

/** Homepage teaser — fixed 4 sponsored ads. */
export function getMockHomeMarketAds(items?: MarketItem[]): MarketItem[] {
  return getMockPublishedMarketItems(items).slice(0, MARKET_HOME_PREVIEW_COUNT);
}

export function createMockMarketId(): string {
  return `mock-market-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
