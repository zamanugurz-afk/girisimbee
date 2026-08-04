import type { CategoryIntentId } from '@/features/categories/types/category.types';
import type { CategoryPageMeta, ListingSortBy } from '@/features/listings/types/marketplace.types';
import type { ContentType } from '@/features/categories/types/category.types';
import {
  BROWSE_CATEGORY_MAP,
  BROWSE_CATEGORY_SLUG_ALIASES,
  getBrowseCategorySlugs,
  resolveBrowseCategory,
  resolveBrowseCategorySlug,
} from '@/features/listings/config/marketplace-category-map';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

/** Intent gateway ID → category slug (config-driven, no per-category pages). */
export const INTENT_TO_CATEGORY_SLUG: Record<CategoryIntentId, string> = {
  'find-investment': 'yatirim-bul',
  invest: 'yatirim-yap',
  'find-job': 'is-bul',
  hire: 'ise-al',
  'find-partner': 'ortak-bul',
  franchise: 'bayilik-al',
};

/** Legacy/alternate URL slugs → canonical category slug. */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  ...BROWSE_CATEGORY_SLUG_ALIASES,
};

/** Canonical English route paths for category browse pages. */
export const CATEGORY_ROUTE_PATHS: Record<string, string> = {
  'yatirim-bul': '/invest',
  'yatirim-yap': '/investors',
  'is-bul': '/jobs',
  'ise-al': '/hire',
  'ortak-bul': '/partners',
  'bayilik-al': '/franchise',
};

/** English route path → canonical category slug. */
export const ROUTE_PATH_TO_CATEGORY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_ROUTE_PATHS).map(([slug, path]) => [path, slug]),
);

const CATEGORY_DESCRIPTIONS: Record<string, { description: string; seoTitle: string; seoDescription: string }> = {
  'yatirim-bul': {
    description: 'Girişiminiz için yatırımcı arayın',
    seoTitle: 'Yatırım Bul — Girişim İlanları | Girisimco',
    seoDescription: 'Yatırım arayan girişimler ve startup fırsatlarını keşfedin.',
  },
  'yatirim-yap': {
    description: 'Yatırım yapmak isteyen profiller',
    seoTitle: 'Yatırım Yap — Yatırımcı Profilleri | Girisimco',
    seoDescription: 'Yatırım yapmak isteyen melek yatırımcı ve fon profilleri.',
  },
  'is-bul': {
    description: 'Kariyer fırsatlarını keşfedin',
    seoTitle: 'İş Bul — Kariyer İlanları | Girisimco',
    seoDescription: 'Startup ve teknoloji şirketlerinde kariyer fırsatları.',
  },
  'ise-al': {
    description: 'Ekibinize yetenek arayın',
    seoTitle: 'İşe Al — Açık Pozisyonlar | Girisimco',
    seoDescription: 'Ekibinize katılacak yetenekleri bulun.',
  },
  'ortak-bul': {
    description: 'Kurucu veya iş ortağı arayın',
    seoTitle: 'Ortak Bul — Ortaklık İlanları | Girisimco',
    seoDescription: 'Kurucu ortak ve iş ortaklığı fırsatları.',
  },
  'bayilik-al': {
    description: 'Yayınlanan franchise fırsatlarını keşfedin',
    seoTitle: 'Franchise İlanları | Girisimco',
    seoDescription: 'Türkiye genelinde yayınlanan franchise fırsatlarını keşfedin.',
  },
};

const CATEGORY_ACCENT_KEYS: Record<string, keyof typeof GC_CATEGORY_COLORS> = {
  'yatirim-bul': 'yatirim-bul',
  'yatirim-yap': 'yatirim-yap',
  'is-bul': 'is-bul',
  'ise-al': 'ise-al',
  'ortak-bul': 'ortak-bul',
  'bayilik-al': 'franchise',
};

/** Category slug → page metadata for SEO and card rendering. */
export const CATEGORY_PAGE_CONFIG: Record<string, CategoryPageMeta> = Object.fromEntries(
  Object.entries(BROWSE_CATEGORY_MAP).map(([slug, entry]) => {
    const copy = CATEGORY_DESCRIPTIONS[slug];
    const accentKey = CATEGORY_ACCENT_KEYS[slug] ?? slug;
    return [
      slug,
      {
        slug,
        categoryId: entry.appCategoryId,
        listingTypeId: entry.appListingTypeId,
        label: entry.label,
        description: copy?.description ?? entry.label,
        accent: GC_CATEGORY_COLORS[accentKey as keyof typeof GC_CATEGORY_COLORS] ?? GC_CATEGORY_COLORS['yatirim-bul'],
        seoTitle: copy?.seoTitle ?? `${entry.label} | Girisimco`,
        seoDescription: copy?.seoDescription ?? entry.label,
      } satisfies CategoryPageMeta,
    ];
  }),
);

/** Category slug → card content type for ListingCard (ContentCard). */
export const CATEGORY_CONTENT_TYPE: Record<string, ContentType> = {
  'yatirim-bul': 'startup',
  'yatirim-yap': 'person',
  'is-bul': 'person',
  'ise-al': 'job',
  'ortak-bul': 'startup',
  'bayilik-al': 'startup',
};

/** Category slug → display emoji for cards without images. */
export const CATEGORY_EMOJI: Record<string, string> = {
  'yatirim-bul': '🚀',
  'yatirim-yap': '💼',
  'is-bul': '👤',
  'ise-al': '📋',
  'ortak-bul': '🤝',
  'bayilik-al': '🏪',
};

export const LISTING_SORT_OPTIONS: { value: ListingSortBy; label: string }[] = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'most_viewed', label: 'En Çok Görüntülenen' },
  { value: 'most_favorited', label: 'En Çok Favorilenen' },
  { value: 'recently_updated', label: 'Son Güncellenen' },
];

export const MARKETPLACE_MAJOR_CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
] as const;

export const MARKETPLACE_OTHER_CITY_LABEL = 'Diğer' as const;

export const MARKETPLACE_CITY_OPTIONS = [
  ...MARKETPLACE_MAJOR_CITIES,
  MARKETPLACE_OTHER_CITY_LABEL,
] as const;

export const DEFAULT_SORT: ListingSortBy = 'newest';
export const BROWSE_PAGE_SIZE = 12;
/** Max published listings loaded for global most_favorited sort. */
export const BROWSE_FAVORITE_SORT_CAP = 5000;

export function resolveCategorySlug(slug: string): CategoryPageMeta | null {
  const canonical = resolveBrowseCategorySlug(slug);
  return CATEGORY_PAGE_CONFIG[canonical] ?? null;
}

export function resolveCanonicalCategorySlug(slug: string): string {
  return resolveBrowseCategorySlug(slug);
}

export function getAllCategorySlugs(): string[] {
  return getBrowseCategorySlugs();
}

export function getCategorySlugFromIntent(intentId: CategoryIntentId): string {
  return INTENT_TO_CATEGORY_SLUG[intentId];
}

export function getCategoryRoutePath(categorySlug: string): string {
  const canonical = resolveBrowseCategorySlug(categorySlug);
  return CATEGORY_ROUTE_PATHS[canonical] ?? `/kategori/${categorySlug}`;
}

export function resolveCategorySlugFromRoute(routePath: string): string | null {
  return ROUTE_PATH_TO_CATEGORY_SLUG[routePath] ?? null;
}

export function getAllCategoryRoutePaths(): string[] {
  return Object.values(CATEGORY_ROUTE_PATHS);
}

/** @deprecated Use resolveBrowseCategory from marketplace-category-map */
export { resolveBrowseCategory };
