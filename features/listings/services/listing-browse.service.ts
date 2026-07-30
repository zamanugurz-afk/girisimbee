import type { PaginatedResult } from '@/lib/domain/pagination';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { MarketplaceBrowseParams } from '@/features/listings/types/marketplace.types';
import type { ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { ListingId, UserId, CompanyId } from '@/lib/domain/ids';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  BROWSE_PAGE_SIZE,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { sortListings } from '@/features/listings/utils/listing-sort';

export class ListingBrowseService {
  constructor(
    private listingRepo: ListingRepository,
    private favoriteRepo: FavoriteRepository,
    private profileRepo: ProfileRepository,
    private companyRepo: CompanyRepository,
  ) {}

  async browse(params: MarketplaceBrowseParams = {}): Promise<PaginatedResult<ContentItem>> {
    const filter = this.buildFilter(params);
    const page = params.page ?? 1;
    const limit = params.limit ?? BROWSE_PAGE_SIZE;

    let result = await this.listingRepo.findPublished(filter, { page, limit });

    if (params.sortBy === 'most_favorited' && result.data.length > 0) {
      const counts = await Promise.all(
        result.data.map((l) => this.favoriteRepo.countByListingId(l.id)),
      );
      const favoriteCounts = new Map<string, number>(
        result.data.map((l, i) => [l.id, counts[i]]),
      );
      result = {
        ...result,
        data: sortListings(result.data, 'most_favorited', favoriteCounts),
      };
    }

    const trustByListingId = await this.buildTrustMap(result.data);

    return {
      ...result,
      data: listingsToContentItems(result.data, trustByListingId),
    };
  }

  async browseFavorites(
    userId: UserId,
    params: Pick<MarketplaceBrowseParams, 'page' | 'limit' | 'sortBy'> = {},
  ): Promise<PaginatedResult<ContentItem>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? BROWSE_PAGE_SIZE;

    const favorites = await this.favoriteRepo.paginate(
      { userId, status: 'active' },
      { page, limit },
    );

    const listings = (
      await Promise.all(
        favorites.data.map((f) => this.listingRepo.findById(f.listingId)),
      )
    ).filter((l): l is NonNullable<typeof l> => Boolean(l));

    const sorted = sortListings(listings, params.sortBy ?? 'newest');
    const trustByListingId = await this.buildTrustMap(sorted);

    return {
      data: listingsToContentItems(sorted, trustByListingId),
      total: favorites.total,
      page: favorites.page,
      limit: favorites.limit,
      hasMore: favorites.hasMore,
    };
  }

  private async buildTrustMap(
    listings: Awaited<ReturnType<ListingRepository['findPublished']>>['data'],
  ): Promise<Map<ListingId, TrustBadges>> {
    const ownerIds = [...new Set(listings.map((l) => l.ownerId))];
    const companyIds = [
      ...new Set(listings.map((l) => l.companyId).filter(Boolean)),
    ] as CompanyId[];

    const [profiles, companies] = await Promise.all([
      this.profileRepo.findByUserIds(ownerIds),
      this.companyRepo.findByIds(companyIds),
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
    const filter: ListingFilter = {
      query: params.query,
      city: params.city,
      remotePolicy: params.remotePolicy,
      isVerified: params.isVerified,
      isFeatured: params.isFeatured,
      sortBy: params.sortBy,
    };

    if (params.categorySlug) {
      const meta = resolveCategorySlug(params.categorySlug);
      if (meta) filter.categoryId = meta.categoryId;
    } else if (params.categoryId) {
      filter.categoryId = params.categoryId;
    }

    return filter;
  }

  async getListingIdsForFavorites(userId: UserId): Promise<Set<ListingId>> {
    const { data } = await this.favoriteRepo.paginate(
      { userId, status: 'active' },
      { page: 1, limit: 500 },
    );
    return new Set(data.map((f) => f.listingId));
  }
}
