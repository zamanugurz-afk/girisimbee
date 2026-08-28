import type { CategoryIntentId } from '@/features/categories/types/category.types';
import type { CategoryPageMeta, ListingSortBy } from '@/features/listings/types/marketplace.types';
import type { ContentType } from '@/features/categories/types/category.types';
import {
  BROWSE_CATEGORY_MAP,
  BROWSE_CATEGORY_SLUG_ALIASES,
  getBrowseCategorySlugs,
  isBrowseCategoryDeferred,
  USER_DISCOVERY_HIDDEN_CATEGORY_SLUGS,
  resolveBrowseCategory,
  resolveBrowseCategorySlug,
} from '@/features/listings/config/marketplace-category-map';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

/** Intent gateway ID → category slug (config-driven, no per-category pages). */
export const INTENT_TO_CATEGORY_SLUG: Record<CategoryIntentId, string> = {
  'find-investment': 'yatirim-bul',
  invest: 'yatirim-yap',
  'find-job': 'is-ariyorum',
  hire: 'ise-al',
  'find-partner': 'ortak-bul',
  franchise: 'bayilik-al',
  'digital-ai': 'dijital-ai',
  services: 'hizmetler',
};

/** Legacy/alternate URL slugs → canonical category slug. */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  ...BROWSE_CATEGORY_SLUG_ALIASES,
};

/** Canonical English route paths for category browse pages. */
export const CATEGORY_ROUTE_PATHS: Record<string, string> = {
  'yatirim-yap': '/investors',
  'ise-al': '/is',
  'is-ariyorum': '/is-ariyorum',
  'ortak-bul': '/partners',
  'bayilik-al': '/franchise/buy',
  'dijital-ai': '/dijital-ai',
  'isletme-devri': '/isletme-devri',
  hizmetler: '/kategori/hizmetler',
};

/** English route path → canonical category slug. */
export const ROUTE_PATH_TO_CATEGORY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_ROUTE_PATHS).map(([slug, path]) => [path, slug]),
);

const CATEGORY_DESCRIPTIONS: Record<string, { description: string; seoTitle: string; seoDescription: string }> = {
  'yatirim-bul': {
    description: 'Girişiminiz için yatırımcı arayın',
    seoTitle: 'Yatırım Arıyorum — Girişim İlanları | Girisimbee',
    seoDescription: 'Yatırım arayan girişimler ve startup fırsatlarını keşfedin.',
  },
  'yatirim-yap': {
    description: 'Yatırım yapmak isteyen profiller',
    seoTitle: 'Yatırım Yap — Yatırımcı Profilleri | Girisimbee',
    seoDescription: 'Yatırım yapmak isteyen melek yatırımcı ve fon profilleri.',
  },
  'ise-al': {
    description: 'İşe alım ilanları ve iş arayan kariyer profilleri',
    seoTitle: 'İş İlanları | Girisimbee',
    seoDescription:
      'İşe Alıyorum açık pozisyonlarını ve İş Arıyorum kariyer profillerini tek yerde inceleyin.',
  },
  'is-ariyorum': {
    description: 'Anonim kariyer özetlerini inceleyin; iletişim talebi gönderin',
    seoTitle: 'İş Arıyorum — Kariyer Profilleri | Girisimbee',
    seoDescription: 'CV ve firma adı olmadan anonim kariyer profillerini keşfedin.',
  },
  'ortak-bul': {
    description: 'Kurucu veya iş ortağı arayın',
    seoTitle: 'Ortak Arıyorum — Ortaklık İlanları | Girisimbee',
    seoDescription: 'Kurucu ortak ve iş ortaklığı fırsatları.',
  },
  'bayilik-al': {
    description: 'Yatırım yapmak istediğiniz sektöre ve lokasyona uygun franchise fırsatlarını keşfedin',
    seoTitle: 'Franchise Fırsatları | Girisimbee',
    seoDescription: 'Yatırım yapmak istediğiniz sektöre ve lokasyona uygun franchise fırsatlarını keşfedin.',
  },
  'dijital-ai': {
    description: 'İşletmeniz için ihtiyaç duyduğunuz dijital ürünleri, yazılım çözümlerini ve yapay zeka uygulamalarını keşfedin.',
    seoTitle: 'Dijital ve AI Çözümleri | Girisimbee',
    seoDescription: 'İşletmeniz için dijital ürün, yazılım ve yapay zeka çözümlerini keşfedin.',
  },
  'isletme-devri': {
    description: 'Faal işletme devri ve hazır işletme devralma fırsatlarını keşfedin.',
    seoTitle: 'İşletme Devri İlanları | Girisimbee',
    seoDescription: 'Kafe, restoran, mağaza, e-ticaret ve faal şirket devir fırsatlarını keşfedin.',
  },
  hizmetler: {
    description: 'Temizlikten çilingire, nakliyeden elektrik ve tadilata tüm günlük hizmetleri doğrudan yerel ustalardan bulun.',
    seoTitle: 'Esnaf ve Hizmet İlanları | Girisimbee',
    seoDescription: 'Elektrik, tesisat, temizlik, nakliye, çilingir ve tadilat ustalarını doğrudan arayın.',
  },
  'genel-ilan': {
    description: 'Ürün, hizmet ve duyuru ilanları',
    seoTitle: 'Genel İlanlar | Girisimbee',
    seoDescription: 'Genel ürün, hizmet ve duyuru ilanlarını keşfedin.',
  },
};

const CATEGORY_ACCENT_KEYS: Record<string, keyof typeof GC_CATEGORY_COLORS> = {
  'yatirim-bul': 'yatirim-bul',
  'yatirim-yap': 'yatirim-yap',
  'ise-al': 'ise-al',
  'is-ariyorum': 'ise-al',
  'ortak-bul': 'ortak-bul',
  'bayilik-al': 'franchise',
  'dijital-ai': 'dijital-ai',
  'isletme-devri': 'isletme-devri',
  hizmetler: 'hizmetler',
  'genel-ilan': 'ilan',
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
        seoTitle: copy?.seoTitle ?? `${entry.label} | Girisimbee`,
        seoDescription: copy?.seoDescription ?? entry.label,
      } satisfies CategoryPageMeta,
    ];
  }),
);

/** Category slug → card content type for ListingCard (ContentCard). */
export const CATEGORY_CONTENT_TYPE: Record<string, ContentType> = {
  'yatirim-bul': 'startup',
  'yatirim-yap': 'person',
  'ise-al': 'job',
  'is-ariyorum': 'person',
  'ortak-bul': 'startup',
  'bayilik-al': 'startup',
  'dijital-ai': 'startup',
  'isletme-devri': 'startup',
  'genel-ilan': 'startup',
};

/** Category slug → display emoji for cards without images (legacy / gallery fallback). */
export const CATEGORY_EMOJI: Record<string, string> = {
  'yatirim-bul': '💰',
  'yatirim-yap': '💼',
  'ise-al': '💼',
  'is-ariyorum': '👤',
  'ortak-bul': '🤝',
  'bayilik-al': '🏪',
  'dijital-ai': '🧠',
  'isletme-devri': '🏢',
  'genel-ilan': '📢',
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
  if (isBrowseCategoryDeferred(canonical)) return null;
  return CATEGORY_PAGE_CONFIG[canonical] ?? null;
}

export function resolveCanonicalCategorySlug(slug: string): string {
  return resolveBrowseCategorySlug(slug);
}

export function getAllCategorySlugs(): string[] {
  return getBrowseCategorySlugs();
}

/** Mixed discovery pickers (ara / keşfet) — no investment categories. */
export function getUserDiscoverableCategorySlugs(): string[] {
  return getBrowseCategorySlugs().filter(
    (slug) => !(USER_DISCOVERY_HIDDEN_CATEGORY_SLUGS as readonly string[]).includes(slug),
  );
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
