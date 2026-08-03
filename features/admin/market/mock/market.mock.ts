import type { MarketItem } from '@/features/admin/market/types/market.types';
import { MARKET_MAX_PUBLISHED } from '@/features/admin/market/types/market.types';

/** Homepage MARKET teaser — always 3 sponsored ads. */
export const MARKET_HOME_PREVIEW_COUNT = 3;

/** Temporary UI-only seed. Replace with API when Supabase MARKET tables are live. */
export const MOCK_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'mock-ad-1',
    title: 'Seed turu arayan SaaS girişimi',
    description:
      'B2B abonelik modeliyle büyüyen yazılım ekibi, stratejik yatırımcı ve mentor arıyor.',
    imageUrl: null,
    linkUrl: '/invest',
    ctaLabel: 'Fırsatı incele',
    sortOrder: 1,
    status: 'published',
    publishedAt: '2026-08-01T10:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'mock-ad-2',
    title: 'Teknoloji ortaklığı — ürün geliştirme',
    description:
      'Ürünleştirme aşamasındaki ekip, teknik kurucu ortak ve uzun vadeli iş birliği arıyor.',
    imageUrl: null,
    linkUrl: '/partners',
    ctaLabel: 'Detaylara bak',
    sortOrder: 2,
    status: 'published',
    publishedAt: '2026-08-01T11:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-01T11:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'mock-ad-3',
    title: 'Ulusal franchise genişleme paketi',
    description:
      'Kanıtlanmış operasyon modeliyle yeni şehirlerde bayilik vermek isteyen marka.',
    imageUrl: null,
    linkUrl: '/franchise/buy',
    ctaLabel: 'Bayiliği incele',
    sortOrder: 3,
    status: 'published',
    publishedAt: '2026-08-01T12:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'mock-market-4',
    title: 'Kariyer ilanları',
    description: 'Kariyer yolculuğunuz için doğru fırsatları keşfedin.',
    imageUrl: null,
    linkUrl: '/jobs',
    ctaLabel: 'İş bul',
    sortOrder: 4,
    status: 'draft',
    publishedAt: null,
    createdBy: null,
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-02T09:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'mock-market-5',
    title: 'Yetenek avı',
    description: 'Ekibinizi güçlendirecek adaylarla tanışın.',
    imageUrl: null,
    linkUrl: '/hire',
    ctaLabel: 'İşe al',
    sortOrder: 5,
    status: 'archived',
    publishedAt: null,
    createdBy: null,
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
    deletedAt: null,
  },
];

export function cloneMockMarketItems(): MarketItem[] {
  return MOCK_MARKET_ITEMS.map((item) => ({ ...item }));
}

/** All published MARKET items (for admin / full catalog of ads). */
export function getMockPublishedMarketItems(items?: MarketItem[]): MarketItem[] {
  const source = items ?? MOCK_MARKET_ITEMS;
  return source
    .filter((item) => item.status === 'published' && !item.deletedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, MARKET_MAX_PUBLISHED);
}

/** Homepage teaser — fixed 3 sponsored ads. */
export function getMockHomeMarketAds(items?: MarketItem[]): MarketItem[] {
  return getMockPublishedMarketItems(items).slice(0, MARKET_HOME_PREVIEW_COUNT);
}

export function createMockMarketId(): string {
  return `mock-market-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
