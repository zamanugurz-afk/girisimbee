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

export const metadata: Metadata = {
  title: 'Keşfet — Girisimbee Marketplace',
  description: 'Kariyer, ortaklık ve fırsat ilanlarını keşfedin.',
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

  const isExplicitAll = get('all') === '1' || get('all') === 'true';
  const isExplicitUrgentFalse = get('urgent') === '0' || get('urgent') === 'false';
  const isExplicitUrgentTrue = get('urgent') === '1' || get('urgent') === 'true';
  const hasCategory = Boolean(get('category'));
  const hasQuery = Boolean(get('q'));
  const hasToday = get('today') === '1' || get('today') === 'true';

  // İlk açılışta veya urgent=1 durumunda SADECE Süper İlanlar gösterilir
  if (isExplicitUrgentTrue || (!isExplicitAll && !isExplicitUrgentFalse && !hasCategory && !hasQuery && !hasToday)) {
    filters.isUrgent = true;
  }

  if (hasToday) {
    filters.publishedAfter = startOfTodayIstanbulIso();
    filters.publishedBefore = endOfTodayIstanbulIso();
  }

  const city = get('city');
  if (city) filters.city = city;

  return filters;
}

function exploreTitle(searchParams: Record<string, string | string[] | undefined>): string {
  const isExplicitAll = searchParams.all === '1' || searchParams.all === 'true';
  const isExplicitUrgentFalse = searchParams.urgent === '0' || searchParams.urgent === 'false';
  const isExplicitUrgentTrue = searchParams.urgent === '1' || searchParams.urgent === 'true';
  const hasCategory = Boolean(searchParams.category);
  const hasQuery = Boolean(searchParams.q);
  const hasToday = searchParams.today === '1' || searchParams.today === 'true';

  if (isExplicitUrgentTrue || (!isExplicitAll && !isExplicitUrgentFalse && !hasCategory && !hasQuery && !hasToday)) {
    return 'Süper İlanlar';
  }
  if (hasToday) return 'Bugünün İlanları';
  if (searchParams.sort === 'most_viewed') return 'En Çok Görüntülenenler';
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  if (category) {
    const meta = resolveCategorySlug(category);
    if (meta?.label) return meta.label;
  }
  return 'Keşfet';
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
          : 'Tüm kategorilerdeki güncel ilanları inceleyin.'
      }
      initialQuery={q}
      initialFilters={initialFilters}
      hideCategoryFilter={Boolean(categorySlug)}
    />
  );
}
