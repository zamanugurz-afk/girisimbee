import type { Metadata } from 'next';
import { MarketplaceBrowseView } from '@/components/girisimco/marketplace/marketplace-browse-view';
import { startOfTodayIstanbulIso, endOfTodayIstanbulIso } from '@/features/home/lib/date-bounds';
import type {
  ListingSortBy,
  MarketplaceFilterState,
} from '@/features/listings/types/marketplace.types';
import {
  DEFAULT_SORT,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'İlanları Keşfet — Girisimbee Marketplace',
  description: 'Tüm kategorilerdeki güncel girişim, kariyer, franchise ve ortaklık ilanlarını inceleyin.',
};

const SORT_VALUES: ListingSortBy[] = ['newest', 'most_viewed', 'most_favorited', 'recently_updated'];

function parseExploreFilters(
  searchParams: Record<string, string | string[] | undefined>,
): Partial<MarketplaceFilterState> {
  const get = (key: string) => {
    const v = searchParams[key];
    return typeof v === 'string' ? v : undefined;
  };

  const filters: Partial<MarketplaceFilterState> = {};

  const sort = get('sort');
  if (sort && SORT_VALUES.includes(sort as ListingSortBy)) {
    filters.sortBy = sort as ListingSortBy;
  } else {
    filters.sortBy = DEFAULT_SORT;
  }

  const isExplicitUrgentTrue = get('urgent') === '1' || get('urgent') === 'true';
  if (isExplicitUrgentTrue) {
    filters.isUrgent = true;
  }

  const hasToday = get('today') === '1' || get('today') === 'true';
  if (hasToday) {
    filters.publishedAfter = startOfTodayIstanbulIso();
    filters.publishedBefore = endOfTodayIstanbulIso();
  }

  const city = get('city');
  if (city) filters.city = city;

  return filters;
}

function exploreTitle(searchParams: Record<string, string | string[] | undefined>): string {
  const get = (key: string) => {
    const v = searchParams[key];
    return typeof v === 'string' ? v : undefined;
  };

  const isExplicitUrgentTrue = get('urgent') === '1' || get('urgent') === 'true';
  if (isExplicitUrgentTrue) {
    return 'Süper İlanlar';
  }

  const hasToday = get('today') === '1' || get('today') === 'true';
  if (hasToday) return 'Bugünün İlanları';

  if (get('sort') === 'most_viewed') return 'En Çok Görüntülenenler';

  const category = get('category');
  if (category) {
    const meta = resolveCategorySlug(category);
    if (meta?.label) return meta.label;
  }

  return 'İlanları Keşfet';
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function ExplorePage({ searchParams }: PageProps) {
  const initialFilters = parseExploreFilters(searchParams);
  const q = typeof searchParams.q === 'string' ? searchParams.q.trim() : undefined;
  const categoryParam =
    typeof searchParams.category === 'string' ? searchParams.category.trim() : undefined;
  const categoryMeta = categoryParam ? resolveCategorySlug(categoryParam) : null;
  const categorySlug = categoryMeta ? categoryParam : undefined;

  return (
    <MarketplaceBrowseView
      categorySlug={categorySlug}
      title={exploreTitle(searchParams)}
      description={
        categoryMeta
          ? (categoryMeta.description ?? 'Bu kategorideki güncel ilanları inceleyin.')
          : 'Tüm kategorilerdeki güncel ilan ve fırsatları inceleyin.'
      }
      initialQuery={q}
      initialFilters={initialFilters}
      hideCategoryFilter={Boolean(categorySlug)}
    />
  );
}
