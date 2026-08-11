import { createClient } from '@/lib/supabase/server';
import { ok, apiError } from '@/lib/api/response';
import { getServerContainer } from '@/lib/persistence/container';
import {
  HOME_LISTING_SECTIONS,
  type HomeListingSectionId,
} from '@/features/home/config/home-sections.config';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { MarketplaceBrowseParams } from '@/features/listings/types/marketplace.types';

export const dynamic = 'force-dynamic';

const FEATURED_TAB_CATEGORY: Record<string, string> = {
  entrepreneur: 'yatirim-bul',
  investor: 'yatirim-yap',
  job: 'ise-al',
  partner: 'ortak-bul',
};

const FEATURED_TAB_LIMIT = 4;

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

async function fetchFeaturedTabItems(
  browseService: ReturnType<typeof getServerContainer>['listingBrowseService'],
  tab: string,
): Promise<ContentItem[]> {
  const categorySlug = FEATURED_TAB_CATEGORY[tab];
  if (!categorySlug) return [];

  const featured = await browseService.browse({
    page: 1,
    limit: FEATURED_TAB_LIMIT,
    categorySlug,
    isFeatured: true,
    activeFeaturedOnly: true,
    sortBy: 'newest',
  });

  if (featured.data.length > 0) {
    return featured.data;
  }

  const newest = await browseService.browse({
    page: 1,
    limit: FEATURED_TAB_LIMIT,
    categorySlug,
    sortBy: 'newest',
  });

  return newest.data;
}

/** GET — homepage listing sections, or a single featured category tab via ?featuredTab= */
export async function GET(request: Request) {
  try {
    const featuredTab = new URL(request.url).searchParams.get('featuredTab')?.trim() ?? '';
    const container = getServerContainer(createClient());

    if (featuredTab && featuredTab !== 'all') {
      if (!FEATURED_TAB_CATEGORY[featuredTab]) {
        return apiError('Geçersiz öne çıkan sekmesi.', 400);
      }
      const items = await fetchFeaturedTabItems(container.listingBrowseService, featuredTab);
      return ok({ items, tab: featuredTab });
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
