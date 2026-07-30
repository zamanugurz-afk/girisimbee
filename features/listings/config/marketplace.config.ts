import type { CategoryIntentId } from '@/features/categories/types/category.types';
import type { CategoryPageMeta, ListingSortBy } from '@/features/listings/types/marketplace.types';
import type { RemotePolicy } from '@/features/listings/types/listing.entity.types';
import type { ContentType } from '@/features/categories/types/category.types';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

/** Intent gateway ID → category slug (config-driven, no per-category pages). */
export const INTENT_TO_CATEGORY_SLUG: Record<CategoryIntentId, string> = {
  'find-investment': 'yatirim-bul',
  invest: 'yatirim-yap',
  'find-job': 'is-bul',
  hire: 'ise-al',
  'find-partner': 'ortak-bul',
};

/** Legacy/alternate URL slugs → canonical category slug. */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  'calisan-ariyorum': 'ise-al',
};

/** Category slug → page metadata for SEO and card rendering. */
export const CATEGORY_PAGE_CONFIG: Record<string, CategoryPageMeta> = {
  'yatirim-bul': {
    slug: 'yatirim-bul',
    categoryId: CATEGORY_IDS.yatirimBul,
    label: 'Yatırım Bul',
    description: 'Girişiminiz için yatırımcı arayın',
    accent: GC_CATEGORY_COLORS['yatirim-bul'],
    seoTitle: 'Yatırım Bul — Girişim İlanları | Girisimco',
    seoDescription: 'Yatırım arayan girişimler ve startup fırsatlarını keşfedin.',
  },
  'yatirim-yap': {
    slug: 'yatirim-yap',
    categoryId: CATEGORY_IDS.yatirimYap,
    label: 'Yatırım Yap',
    description: 'Yatırım yapmak isteyen profiller',
    accent: GC_CATEGORY_COLORS['yatirim-yap'],
    seoTitle: 'Yatırım Yap — Yatırımcı Profilleri | Girisimco',
    seoDescription: 'Yatırım yapmak isteyen melek yatırımcı ve fon profilleri.',
  },
  'is-bul': {
    slug: 'is-bul',
    categoryId: CATEGORY_IDS.isBul,
    label: 'İş Bul',
    description: 'Kariyer fırsatlarını keşfedin',
    accent: GC_CATEGORY_COLORS['is-bul'],
    seoTitle: 'İş Bul — Kariyer İlanları | Girisimco',
    seoDescription: 'Startup ve teknoloji şirketlerinde kariyer fırsatları.',
  },
  'ise-al': {
    slug: 'ise-al',
    categoryId: CATEGORY_IDS.iseAl,
    label: 'İşe Al',
    description: 'Ekibinize yetenek arayın',
    accent: GC_CATEGORY_COLORS['ise-al'],
    seoTitle: 'İşe Al — Açık Pozisyonlar | Girisimco',
    seoDescription: 'Ekibinize katılacak yetenekleri bulun.',
  },
  'ortak-bul': {
    slug: 'ortak-bul',
    categoryId: CATEGORY_IDS.ortakBul,
    label: 'Ortak Bul',
    description: 'Kurucu veya iş ortağı arayın',
    accent: GC_CATEGORY_COLORS['ortak-bul'],
    seoTitle: 'Ortak Bul — Ortaklık İlanları | Girisimco',
    seoDescription: 'Kurucu ortak ve iş ortaklığı fırsatları.',
  },
};

/** Category slug → card content type for ListingCard (ContentCard). */
export const CATEGORY_CONTENT_TYPE: Record<string, ContentType> = {
  'yatirim-bul': 'startup',
  'yatirim-yap': 'person',
  'is-bul': 'person',
  'ise-al': 'job',
  'ortak-bul': 'startup',
};

/** Category slug → display emoji for cards without images. */
export const CATEGORY_EMOJI: Record<string, string> = {
  'yatirim-bul': '🚀',
  'yatirim-yap': '💼',
  'is-bul': '👤',
  'ise-al': '📋',
  'ortak-bul': '🤝',
};

export const LISTING_SORT_OPTIONS: { value: ListingSortBy; label: string }[] = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'most_viewed', label: 'En Çok Görüntülenen' },
  { value: 'most_favorited', label: 'En Çok Favorilenen' },
  { value: 'recently_updated', label: 'Son Güncellenen' },
];

export const MARKETPLACE_CITY_OPTIONS = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Remote',
] as const;

export const REMOTE_POLICY_OPTIONS: { value: RemotePolicy; label: string }[] = [
  { value: 'remote', label: 'Uzaktan' },
  { value: 'hybrid', label: 'Hibrit' },
  { value: 'onsite', label: 'Ofis' },
];

export const DEFAULT_SORT: ListingSortBy = 'newest';
export const BROWSE_PAGE_SIZE = 12;

export function resolveCategorySlug(slug: string): CategoryPageMeta | null {
  const canonical = CATEGORY_SLUG_ALIASES[slug] ?? slug;
  return CATEGORY_PAGE_CONFIG[canonical] ?? null;
}

export function resolveCanonicalCategorySlug(slug: string): string {
  return CATEGORY_SLUG_ALIASES[slug] ?? slug;
}

export function getAllCategorySlugs(): string[] {
  return Object.keys(CATEGORY_PAGE_CONFIG);
}

export function getCategorySlugFromIntent(intentId: CategoryIntentId): string {
  return INTENT_TO_CATEGORY_SLUG[intentId];
}
