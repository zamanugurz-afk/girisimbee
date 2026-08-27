import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type { UserId, ProfileId } from '@/lib/domain/ids';
import type { Company } from '@/features/companies/types/company.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { FranchiseBuyProfile } from '@/features/profiles/types/franchise-profile.types';
import {
  CATEGORY_IDS,
  LISTING_TYPE_IDS,
} from '@/features/listings/config/listing-type-config';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { MARKETPLACE_LISTING_TYPE_IDS } from '@/features/listings/config/marketplace-category-map';
import {
  buildFranchiseSeekerProfile,
  extractFranchiseOpportunityProfile,
  isFranchiseListing,
} from '@/features/franchise-matching/normalize';
import { calculateFranchiseMatch } from '@/features/franchise-matching/engine';
import {
  assertNoFranchiseContactLeak,
  toPublicFranchiseMatchCard,
} from '@/features/franchise-matching/adapters/public-card';
import type {
  FranchiseMatchCard,
  FranchiseMatchSection,
} from '@/features/franchise-matching/types';

export const FRANCHISE_MATCH_POOL_LIMIT = 100;
export const FRANCHISE_RESULT_LIMIT = 6;

export interface FranchiseMatchListingStore {
  search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
}

export interface FranchiseMatchCompanyStore {
  findByOwnerId(ownerId: UserId): Promise<Company[] | Company | null>;
}

export interface FranchiseMatchProfileStore {
  findByUserId(userId: UserId): Promise<Profile | null>;
}

export interface FranchiseMatchModuleProfileStore {
  findFranchiseProfile(profileId: ProfileId): Promise<FranchiseBuyProfile | any | null>;
}

export class FranchiseMatchService {
  constructor(
    private readonly listings: FranchiseMatchListingStore,
    private readonly companies?: FranchiseMatchCompanyStore,
    private readonly profiles?: FranchiseMatchProfileStore,
    private readonly moduleProfiles?: FranchiseMatchModuleProfileStore,
  ) {}

  /**
   * Recommendations for franchise detail page (/franchise/buy/[slug]).
   * Self-match prevention: strictly excludes sourceListing.id.
   */
  async getListingRecommendations(sourceListing: Listing): Promise<FranchiseMatchSection | null> {
    if (!isFranchiseListing(sourceListing)) return null;

    const seeker = buildFranchiseSeekerProfile({
      sourceOpportunityListing: sourceListing,
    });

    const pool = await this.listings.findPublished(
      {
        listingTypeIds: [
          LISTING_TYPE_IDS.franchiseGiveDefault,
          FRANCHISE_LISTING_TYPE_IDS.give,
          FRANCHISE_LISTING_TYPE_IDS.buy,
          MARKETPLACE_LISTING_TYPE_IDS.bayilikAl,
          MARKETPLACE_LISTING_TYPE_IDS.bayilikVer,
        ],
        sortBy: 'newest',
      },
      { page: 1, limit: FRANCHISE_MATCH_POOL_LIMIT },
    );

    // Candidates: must be published franchise listings, excluding current listing (Self-match prevention)
    const candidates = pool.data.filter((listing) => {
      if (listing.id === sourceListing.id) return false;
      if (sourceListing.ownerId && listing.ownerId === sourceListing.ownerId) return false;
      if (listing.status !== 'published') return false;
      return isFranchiseListing(listing);
    });

    const matches: FranchiseMatchCard[] = [];
    for (const listing of candidates) {
      const oppProfile = extractFranchiseOpportunityProfile(listing);
      const match = calculateFranchiseMatch(seeker, oppProfile);

      const card = toPublicFranchiseMatchCard(listing, match);
      if (card) {
        matches.push(card);
      }
    }

    matches.sort((a, b) => {
      const recency = (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0);
      return b.score - a.score || recency;
    });

    const section: FranchiseMatchSection = {
      title: 'Sana Uygun Diğer Franchise Fırsatları',
      description: 'Bütçenize, sektör tercihlerinize ve lokasyonunuza uygun franchise fırsatlarını keşfedin.',
      sourceListingId: String(sourceListing.id),
      matches: matches.slice(0, FRANCHISE_RESULT_LIMIT),
      totalMatchesCount: matches.length,
    };

    assertNoFranchiseContactLeak(section);
    return section;
  }

  /**
   * User-specific franchise matches based on user's profile and company context.
   */
  async getFranchiseMatches(userId: UserId): Promise<FranchiseMatchSection | null> {
    const [companyRaw, profile, pool] = await Promise.all([
      this.companies ? this.companies.findByOwnerId(userId) : Promise.resolve(null),
      this.profiles ? this.profiles.findByUserId(userId) : Promise.resolve(null),
      this.listings.findPublished(
        {
          categoryId: CATEGORY_IDS.bayilikAl,
          sortBy: 'newest',
        },
        { page: 1, limit: FRANCHISE_MATCH_POOL_LIMIT },
      ),
    ]);

    const company = Array.isArray(companyRaw) ? (companyRaw[0] ?? null) : companyRaw;

    const seeker = buildFranchiseSeekerProfile({
      company,
      profile,
    });

    const candidates = pool.data.filter((listing) => {
      if (listing.ownerId === userId) return false;
      if (listing.status !== 'published') return false;
      return isFranchiseListing(listing);
    });

    const matches: FranchiseMatchCard[] = [];
    for (const listing of candidates) {
      const oppProfile = extractFranchiseOpportunityProfile(listing);
      const match = calculateFranchiseMatch(seeker, oppProfile);

      const card = toPublicFranchiseMatchCard(listing, match);
      if (card) {
        matches.push(card);
      }
    }

    matches.sort((a, b) => {
      const recency = (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0);
      return b.score - a.score || recency;
    });

    const section: FranchiseMatchSection = {
      title: 'Size Uygun Franchise Fırsatları',
      description: 'Bütçenize, sektör tercihlerinize ve lokasyonunuza uygun franchise fırsatlarını keşfedin.',
      matches: matches.slice(0, FRANCHISE_RESULT_LIMIT),
      totalMatchesCount: matches.length,
    };

    assertNoFranchiseContactLeak(section);
    return section;
  }
}

export function createFranchiseMatchService(container: {
  listingRepository: FranchiseMatchListingStore;
  companyRepository?: FranchiseMatchCompanyStore;
  profileRepository?: FranchiseMatchProfileStore;
  moduleProfileRepository?: FranchiseMatchModuleProfileStore;
}): FranchiseMatchService {
  return new FranchiseMatchService(
    container.listingRepository,
    container.companyRepository,
    container.profileRepository,
    container.moduleProfileRepository,
  );
}
