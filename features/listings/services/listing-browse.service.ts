import type { PaginatedResult } from '@/lib/domain/pagination';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ListingImageRepository } from '@/features/listings/repository/listing-image.repository';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import type { Favorite } from '@/features/favorites/types/favorite.types';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { MarketplaceBrowseParams } from '@/features/listings/types/marketplace.types';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { ListingId, UserId, CompanyId } from '@/lib/domain/ids';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import {
  expandListingTypeIdFilter,
  isInvestmentSeekingBrowseSlug,
  isUserDiscoverableListing,
  MARKETPLACE_LISTING_TYPE_IDS,
  resolveBrowseCategory,
  resolveListingTypeIdsFromBrowseSlug,
} from '@/features/listings/config/marketplace-category-map';
import { LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import {
  BROWSE_FAVORITE_SORT_CAP,
  BROWSE_PAGE_SIZE,
} from '@/features/listings/config/marketplace.config';
import { resolvePartnershipIntent } from '@/features/founders/partnership-intent';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { loadListingCoverUrlsByIds } from '@/features/listings/utils/load-listing-cover-urls';
import { sortListings } from '@/features/listings/utils/listing-sort';

type MostFavoritedCacheEntry = {
  sorted: Listing[];
  cachedAt: number;
};

/** Published listings fetched per loop iteration for most_favorited global sort. */
const MOST_FAVORITED_FETCH_PAGE_LIMIT = 500;

/** Shared TTL with use-marketplace-browse first-page cache. */
const MOST_FAVORITED_CACHE_TTL_MS = 30_000;

const mostFavoritedCache = new Map<string, MostFavoritedCacheEntry>();
const mostFavoritedInflight = new Map<string, Promise<Listing[]>>();

function mostFavoritedCacheKey(filter: ListingFilter): string {
  return JSON.stringify(filter);
}

function readMostFavoritedCache(filter: ListingFilter): Listing[] | null {
  const key = mostFavoritedCacheKey(filter);
  const hit = mostFavoritedCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.cachedAt > MOST_FAVORITED_CACHE_TTL_MS) {
    mostFavoritedCache.delete(key);
    return null;
  }
  return hit.sorted;
}

function writeMostFavoritedCache(filter: ListingFilter, sorted: Listing[]): void {
  mostFavoritedCache.set(mostFavoritedCacheKey(filter), { sorted, cachedAt: Date.now() });
}

export class ListingBrowseService {
  constructor(
    private listingRepo: ListingRepository,
    private favoriteRepo: FavoriteRepository,
    private profileRepo: ProfileRepository,
    private companyRepo: CompanyRepository,
    private imageRepo: ListingImageRepository,
  ) {}

  async countPublished(params: MarketplaceBrowseParams = {}): Promise<number> {
    const filter = this.buildFilter(params);
    const partnershipIntent =
      params.partnershipIntent
      ?? (params.categorySlug === 'ortak-bul' ? 'seeking' : undefined);
    if (!partnershipIntent) {
      return this.listingRepo.count({ ...filter, status: 'published' });
    }
    const { listings } = await this.fetchPublishedUpToCap(filter, BROWSE_FAVORITE_SORT_CAP);
    return listings.filter((listing) => resolvePartnershipIntent(listing) === partnershipIntent).length;
  }

  async browse(params: MarketplaceBrowseParams = {}): Promise<PaginatedResult<ContentItem>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? BROWSE_PAGE_SIZE;

    // Unmapped categorySlug must never browse unfiltered published listings.
    if (params.categorySlug) {
      const mappedTypeIds = resolveListingTypeIdsFromBrowseSlug(params.categorySlug);
      if (mappedTypeIds.length === 0) {
        return { data: [], total: 0, page, limit, hasMore: false };
      }
    }

    const filter = this.buildFilter(params);
    const partnershipIntent =
      params.partnershipIntent
      ?? (params.categorySlug === 'ortak-bul' ? 'seeking' : undefined);

    let result: PaginatedResult<Listing>;
    if ((params.sortBy ?? filter.sortBy) === 'most_favorited') {
      const sorted = await this.resolveMostFavoritedSortedListings(filter);
      const scoped = partnershipIntent
        ? sorted.filter((listing) => resolvePartnershipIntent(listing) === partnershipIntent)
        : sorted;
      const start = (page - 1) * limit;
      result = {
        data: scoped.slice(start, start + limit),
        total: scoped.length,
        page,
        limit,
        hasMore: start + limit < scoped.length,
      };
    } else if (partnershipIntent) {
      result = await this.browsePartnershipIntent(filter, partnershipIntent, page, limit);
    } else {
      result = await this.listingRepo.findPublished(filter, { page, limit });
    }

    const pageListings = isInvestmentSeekingBrowseSlug(params.categorySlug)
      ? []
      : result.data.filter(isUserDiscoverableListing);

    const [trustByListingId, coverByListingId] = await Promise.all([
      this.buildTrustMap(pageListings),
      this.buildCoverMap(pageListings),
    ]);

    return {
      ...result,
      data: listingsToContentItems(pageListings, trustByListingId, coverByListingId),
    };
  }

  private async browsePartnershipIntent(
    filter: ListingFilter,
    intent: 'seeking' | 'joining',
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Listing>> {
    const { listings } = await this.fetchPublishedUpToCap(filter, BROWSE_FAVORITE_SORT_CAP);
    const filtered = listings.filter((listing) => resolvePartnershipIntent(listing) === intent);
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      hasMore: start + limit < filtered.length,
    };
  }

  private async resolveMostFavoritedSortedListings(filter: ListingFilter): Promise<Listing[]> {
    const cached = readMostFavoritedCache(filter);
    if (cached) return cached;

    const key = mostFavoritedCacheKey(filter);
    const inflight = mostFavoritedInflight.get(key);
    if (inflight) return inflight;

    const promise = this.computeMostFavoritedSortedListings(filter)
      .then((sorted) => {
        writeMostFavoritedCache(filter, sorted);
        return sorted;
      })
      .finally(() => {
        mostFavoritedInflight.delete(key);
      });

    mostFavoritedInflight.set(key, promise);
    return promise;
  }

  private async computeMostFavoritedSortedListings(filter: ListingFilter): Promise<Listing[]> {
    const { listings } = await this.fetchPublishedUpToCap(filter, BROWSE_FAVORITE_SORT_CAP);

    let favoriteCounts = new Map<string, number>();
    if (listings.length > 0) {
      try {
        favoriteCounts = await this.favoriteRepo.countActiveByListingIds(listings.map((l) => l.id));
      } catch {
        favoriteCounts = new Map();
      }
    }

    const withFavorites = listings.filter((l) => (favoriteCounts.get(l.id) ?? 0) > 0);
    return sortListings(withFavorites, 'most_favorited', favoriteCounts);
  }

  /** Fetch all published listings matching filter, up to cap (respects MAX_LIMIT per page). */
  private async fetchPublishedUpToCap(
    filter: ListingFilter,
    cap: number,
  ): Promise<{ listings: Listing[]; total: number }> {
    const listings: Listing[] = [];
    let total = 0;
    let fetchPage = 1;

    while (listings.length < cap) {
      const batch = await this.listingRepo.findPublished(filter, {
        page: fetchPage,
        limit: MOST_FAVORITED_FETCH_PAGE_LIMIT,
      });
      total = batch.total;
      listings.push(...batch.data);
      if (!batch.hasMore || batch.data.length === 0) break;
      fetchPage += 1;
    }

    return { listings: listings.slice(0, cap), total };
  }

  async browseFavorites(
    userId: UserId,
    params: Pick<MarketplaceBrowseParams, 'page' | 'limit' | 'sortBy'> = {},
  ): Promise<PaginatedResult<ContentItem>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? BROWSE_PAGE_SIZE;

    let favorites: PaginatedResult<Favorite>;
    try {
      favorites = await this.favoriteRepo.paginate(
        { userId, status: 'active' },
        { page, limit },
      );
    } catch {
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    const listings = (
      await Promise.all(
        favorites.data.map((f) => this.listingRepo.findById(f.listingId)),
      )
    ).filter((l): l is NonNullable<typeof l> => Boolean(l));

    const sorted = sortListings(listings, params.sortBy ?? 'newest');
    const [trustByListingId, coverByListingId] = await Promise.all([
      this.buildTrustMap(sorted),
      this.buildCoverMap(sorted),
    ]);

    return {
      data: listingsToContentItems(sorted, trustByListingId, coverByListingId),
      total: favorites.total,
      page: favorites.page,
      limit: favorites.limit,
      hasMore: favorites.hasMore,
    };
  }

  private async buildCoverMap(listings: Listing[]): Promise<Map<ListingId, string>> {
    try {
      return await loadListingCoverUrlsByIds(
        listings.map((listing) => listing.id),
        this.imageRepo,
      );
    } catch {
      return new Map();
    }
  }

  private async buildTrustMap(
    listings: Listing[],
  ): Promise<Map<ListingId, TrustBadges>> {
    const ownerIds = [...new Set(listings.map((l) => l.ownerId))];
    const companyIds = [
      ...new Set(listings.map((l) => l.companyId).filter(Boolean)),
    ] as CompanyId[];

    const [profiles, companies] = await Promise.all([
      this.profileRepo.findByUserIds(ownerIds).catch(() => [] as Awaited<ReturnType<ProfileRepository['findByUserIds']>>),
      this.companyRepo.findByIds(companyIds).catch(() => [] as Awaited<ReturnType<CompanyRepository['findByIds']>>),
    ]);

    const profileByUser = new Map(profiles.map((p) => [p.userId, p]));
    const companyById = new Map(companies.map((c) => [c.id, c]));

    const map = new Map<ListingId, TrustBadges>();
    for (const listing of listings) {
      const profile = profileByUser.get(listing.ownerId);
      const company = listing.companyId ? companyById.get(listing.companyId) : null;
      map.set(listing.id, {
        user: profile?.isVerified ?? false,
        investor: profile?.investorVerified ?? false,
        company: company?.isVerified ?? false,
      });
    }
    return map;
  }

  private buildFilter(params: MarketplaceBrowseParams): ListingFilter {
    const combinedQuery = [
      params.query,
      params.position,
      params.sector,
      params.careerLevel,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const filter: ListingFilter = {
      query: combinedQuery || undefined,
      city: params.city,
      isFeatured: params.isFeatured,
      isUrgent: params.isUrgent,
      activeFeaturedOnly: params.activeFeaturedOnly,
      activeUrgentOnly: params.activeUrgentOnly,
      publishedAfter: params.publishedAfter,
      publishedBefore: params.publishedBefore,
      sortBy: params.sortBy,
    };

    if (params.categorySlug) {
      const entry = resolveBrowseCategory(params.categorySlug);
      if (entry) {
        filter.categoryId = entry.appCategoryId;
      }
      const listingTypeIds = resolveListingTypeIdsFromBrowseSlug(params.categorySlug);
      if (listingTypeIds.length === 1) {
        filter.listingTypeId = listingTypeIds[0];
      } else if (listingTypeIds.length > 1) {
        filter.listingTypeIds = listingTypeIds;
      }
    } else if (params.listingTypeId) {
      filter.listingTypeId = params.listingTypeId;
    } else if (params.categoryId) {
      filter.categoryId = params.categoryId;
    }

    if (params.jobFlow === 'hire') {
      filter.listingTypeId = undefined;
      filter.listingTypeIds = [
        ...new Set([
          ...expandListingTypeIdFilter(MARKETPLACE_LISTING_TYPE_IDS.iseAliyorum),
          ...expandListingTypeIdFilter(LISTING_TYPE_IDS.iseAlDefault),
        ]),
      ];
    } else if (params.jobFlow === 'seek') {
      filter.listingTypeId = undefined;
      filter.listingTypeIds = [
        ...new Set([
          ...expandListingTypeIdFilter(MARKETPLACE_LISTING_TYPE_IDS.isAriyorum),
          ...expandListingTypeIdFilter(LISTING_TYPE_IDS.isBulDefault),
        ]),
      ];
    }

    return filter;
  }

  async getListingIdsForFavorites(userId: UserId): Promise<Set<ListingId>> {
    try {
      const { data } = await this.favoriteRepo.paginate(
        { userId, status: 'active' },
        { page: 1, limit: 500 },
      );
      return new Set(data.map((f) => f.listingId));
    } catch {
      return new Set();
    }
  }
}
