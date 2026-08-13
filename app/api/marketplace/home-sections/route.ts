import { createClient } from '@/lib/supabase/server';
import { ok, apiError } from '@/lib/api/response';
import { getServerContainer } from '@/lib/persistence/container';
import {
  HOME_LISTING_SECTIONS,
  type HomeListingSectionId,
} from '@/features/home/config/home-sections.config';
import { HOME_CATEGORY_TAB_SLUG } from '@/features/home/config/home-category-tabs';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { MarketplaceBrowseParams } from '@/features/listings/types/marketplace.types';

export const dynamic = 'force-dynamic';

const SECTION_TAB_LIMIT = 4;
const SECTION_IDS = new Set(HOME_LISTING_SECTIONS.map((section) => section.id));

function isDynamicServerUsageError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    (err as { digest?: unknown }).digest === 'DYNAMIC_SERVER_USAGE'
  );
}

async function fetchPublished(
  listingRepository: ReturnType<typeof getServerContainer>['listingRepository'],
  params: MarketplaceBrowseParams,
): Promise<{ listings: Listing[]; total: number }> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 8;
  const { page: _page, limit: _limit, categorySlug: _categorySlug, ...filter } = params;
  const result = await listingRepository.findPublished(filter, { page, limit });
  return { listings: result.data, total: result.total };
}

async function fetchSection(
  listingRepository: ReturnType<typeof getServerContainer>['listingRepository'],
  sectionId: HomeListingSectionId,
  params: MarketplaceBrowseParams,
): Promise<{ id: HomeListingSectionId; items: ContentItem[]; total: number }> {
  let { listings, total } = await fetchPublished(listingRepository, params);

  if (listings.length === 0 && (sectionId === 'featured' || sectionId === 'today')) {
    const fallback = await fetchPublished(listingRepository, {
      page: 1,
      limit: params.limit ?? 8,
      sortBy: 'newest',
    });
    listings = fallback.listings;
    total = fallback.total;
  }

  return {
    id: sectionId,
    items: listingsToContentItems(listings),
    total,
  };
}

async function fetchSectionCategoryTabItems(
  browseService: ReturnType<typeof getServerContainer>['listingBrowseService'],
  sectionId: HomeListingSectionId,
  tab: string,
): Promise<ContentItem[]> {
  const categorySlug = HOME_CATEGORY_TAB_SLUG[tab as keyof typeof HOME_CATEGORY_TAB_SLUG];
  if (!categorySlug) return [];

  const section = HOME_LISTING_SECTIONS.find((entry) => entry.id === sectionId);
  if (!section) return [];

  const base = section.resolveBrowseParams();
  const filtered = await browseService.browse({
    ...base,
    page: 1,
    limit: SECTION_TAB_LIMIT,
    categorySlug,
  });

  if (filtered.data.length > 0) {
    return filtered.data;
  }

  // Featured only: if no featured hits in this category, show newest in-category.
  if (sectionId === 'featured') {
    const newest = await browseService.browse({
      page: 1,
      limit: SECTION_TAB_LIMIT,
      categorySlug,
      sortBy: 'newest',
    });
    return newest.data;
  }

  return [];
}

/** GET — homepage listing sections, or a category tab slice via ?categoryTab=&sectionId= */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryTab =
      url.searchParams.get('categoryTab')?.trim()
      || url.searchParams.get('featuredTab')?.trim()
      || '';
    const sectionParam = url.searchParams.get('sectionId')?.trim() || 'featured';
    const container = getServerContainer(createClient());

    if (categoryTab && categoryTab !== 'all') {
      if (!HOME_CATEGORY_TAB_SLUG[categoryTab as keyof typeof HOME_CATEGORY_TAB_SLUG]) {
        return apiError('Geçersiz kategori sekmesi.', 400);
      }
      if (!SECTION_IDS.has(sectionParam as HomeListingSectionId)) {
        return apiError('Geçersiz ana sayfa bölümü.', 400);
      }
      const sectionId = sectionParam as HomeListingSectionId;
      const items = await fetchSectionCategoryTabItems(
        container.listingBrowseService,
        sectionId,
        categoryTab,
      );
      return ok({ items, tab: categoryTab, sectionId });
    }

    const { listingRepository } = container;

    const settled = await Promise.allSettled(
      HOME_LISTING_SECTIONS.map((section) =>
        fetchSection(listingRepository, section.id, section.resolveBrowseParams()),
      ),
    );

    const sections = HOME_LISTING_SECTIONS.map((section, index) => {
      const result = settled[index];
      if (result.status === 'fulfilled') {
        return {
          id: result.value.id,
          items: result.value.items,
          total: result.value.total,
          error: null as string | null,
        };
      }
      return {
        id: section.id,
        items: [] as ContentItem[],
        total: 0,
        error: result.reason instanceof Error ? result.reason.message : 'Yüklenemedi',
      };
    });

    const response = ok({ sections });
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=120',
    );
    return response;
  } catch (error) {
    if (isDynamicServerUsageError(error)) throw error;
    console.error('[home-sections]', error);
    const message = error instanceof Error ? error.message : 'Bölümler yüklenemedi';
    return apiError(message, 500);
  }
}
