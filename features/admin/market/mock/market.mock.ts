import type { MarketItem } from '@/features/admin/market/types/market.types';
import { MARKET_MAX_PUBLISHED } from '@/features/admin/market/types/market.types';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';

/** Homepage MARKET teaser — 4 sponsored opportunity ads for 4-col bento grid symmetry. */
export const MARKET_HOME_PREVIEW_COUNT = 4;

/** Temporary UI-only seed. Replace with API when Supabase MARKET tables are live. */
export const MOCK_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'mock-ad-1',
    title: 'Seed turu arayan SaaS girişimi',
    description:
      'B2B abonelik modeliyle büyüyen yazılım ekibi, stratejik yatırımcı ve mentor arıyor.',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop&q=80',
    linkUrl: null,
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
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop&q=80',
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
    id: 'mock-ad-4',
    title: 'Erken aşama fintech büyüme turu',
    description:
      'Ödeme altyapısı geliştiren ekip, sektör deneyimli yatırımcı ve iş geliştirme ortağı arıyor.',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop&q=80',
    linkUrl: null,
    ctaLabel: 'Fırsatı incele',
    sortOrder: 4,
    status: 'published',
    publishedAt: '2026-08-02T09:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-02T09:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'mock-ad-5',
    title: 'Operasyon ortağı — e-ticaret markası',
    description:
      'Ölçeklenen D2C marka, lojistik ve operasyon tarafında deneyimli iş ortağı arıyor.',
    imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=500&fit=crop&q=80',
    linkUrl: '/partners',
    ctaLabel: 'Detaylara bak',
    sortOrder: 5,
    status: 'published',
    publishedAt: '2026-08-02T10:00:00.000Z',
    createdBy: null,
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 'mock-ad-draft',
    title: 'Taslak — medya ajansı işbirliği',
    description: 'Yayına alınmamış örnek taslak reklam.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80',
    linkUrl: '/partners',
    ctaLabel: 'İncele',
    sortOrder: 99,
    status: 'draft',
    publishedAt: null,
    createdBy: null,
    createdAt: '2026-08-02T14:00:00.000Z',
    updatedAt: '2026-08-02T14:00:00.000Z',
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

/** Homepage teaser — fixed 3 sponsored ads. */
export function getMockHomeMarketAds(items?: MarketItem[]): MarketItem[] {
  return getMockPublishedMarketItems(items).slice(0, MARKET_HOME_PREVIEW_COUNT);
}

export function createMockMarketId(): string {
  return `mock-market-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
