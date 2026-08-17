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

  if (get('featured') === '1' || get('featured') === 'true') {
    filters.isFeatured = true;
    filters.activeFeaturedOnly = true;
  }

  if (get('urgent') === '1' || get('urgent') === 'true') {
    filters.isUrgent = true;
    filters.activeUrgentOnly = true;
  }

  if (get('today') === '1' || get('today') === 'true') {
    filters.publishedAfter = startOfTodayIstanbulIso();
    filters.publishedBefore = endOfTodayIstanbulIso();
  }

  const city = get('city');
  if (city) filters.city = city;

  return filters;
}

function exploreTitle(searchParams: Record<string, string | string[] | undefined>): string {
  if (searchParams.featured === '1' || searchParams.featured === 'true') return 'Öne Çıkan İlanlar';
  if (searchParams.today === '1' || searchParams.today === 'true') return 'Bugünün İlanları';
  if (searchParams.urgent === '1' || searchParams.urgent === 'true') return 'Acil İlanlar';
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
