import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type { UserId } from '@/lib/domain/ids';
import type { Company } from '@/features/companies/types/company.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import {
  buildDigitalSolutionConsumerProfile,
  isDigitalSolutionListing,
} from '@/features/digital-solution-matching/normalize';
import { calculateDigitalSolutionMatch } from '@/features/digital-solution-matching/engine';
import {
  assertNoDigitalSolutionContactLeak,
  toPublicDigitalSolutionMatchCard,
} from '@/features/digital-solution-matching/adapters/public-card';
import type {
  DigitalSolutionMatchCard,
  DigitalSolutionMatchesResult,
  DigitalSolutionMatchSection,
} from '@/features/digital-solution-matching/types';

export const DIGITAL_SOLUTION_MATCH_POOL_LIMIT = 100;
export const DIGITAL_SOLUTION_RESULT_LIMIT = 6;

export interface DigitalSolutionListingStore {
  search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
}

export interface DigitalSolutionCompanyStore {
  findByOwnerId(ownerId: UserId): Promise<Company[] | Company | null>;
}

export interface DigitalSolutionProfileStore {
  findByUserId(userId: UserId): Promise<Profile | null>;
}

export class DigitalSolutionMatchService {
  constructor(
    private readonly listings: DigitalSolutionListingStore,
    private readonly companies?: DigitalSolutionCompanyStore,
    private readonly profiles?: DigitalSolutionProfileStore,
  ) {}

  async getDigitalSolutionMatches(userId: UserId): Promise<DigitalSolutionMatchesResult> {
    const [companyRaw, profile, ownedListings, pool] = await Promise.all([
      this.companies ? this.companies.findByOwnerId(userId) : Promise.resolve(null),
      this.profiles ? this.profiles.findByUserId(userId) : Promise.resolve(null),
      this.listings.search({ ownerId: userId, status: ['published'] }, { page: 1, limit: 20 }),
      this.listings.findPublished(
        {
          categoryId: CATEGORY_IDS.dijitalAi,
          sortBy: 'newest',
        },
        { page: 1, limit: DIGITAL_SOLUTION_MATCH_POOL_LIMIT },
      ),
    ]);

    const company = Array.isArray(companyRaw) ? (companyRaw[0] ?? null) : companyRaw;

    const consumer = buildDigitalSolutionConsumerProfile({
      company,
      profile,
      activeListings: ownedListings.data,
    });

    const hasConsumerContext = Boolean(
      consumer.industry ||
      consumer.companySize ||
      (consumer.neededCapabilities && consumer.neededCapabilities.length > 0) ||
      (consumer.targetAudienceHints && consumer.targetAudienceHints.length > 0),
    );

    const candidates = pool.data.filter((listing) => {
      if (listing.ownerId === userId) return false;
      return isDigitalSolutionListing(listing);
    });

    const matches: DigitalSolutionMatchCard[] = [];
    for (const listing of candidates) {
      const match = calculateDigitalSolutionMatch(consumer, {
        listingId: String(listing.id),
        title: listing.title,
        shortDescription: listing.shortDescription,
        solutionType: String(listing.customFields?.solutionType || ''),
        deliveryModel: String(listing.customFields?.deliveryModel || ''),
        targetAudience: String(listing.customFields?.targetAudience || ''),
        priceRange: String(listing.customFields?.priceRange || ''),
        demoUrl: String(listing.customFields?.demoUrl || ''),
        capabilities: Array.isArray(listing.customFields?.capabilities)
          ? (listing.customFields.capabilities as string[])
          : [],
        supportedLanguages: Array.isArray(listing.customFields?.supportedLanguages)
          ? (listing.customFields.supportedLanguages as string[])
          : [],
        industry: listing.industry || String(listing.customFields?.sector || ''),
        city: listing.city,
        location: listing.location,
        publishedAt: listing.publishedAt,
      });

      const card = toPublicDigitalSolutionMatchCard(listing, match);
      if (card) {
        matches.push(card);
      }
    }

    matches.sort((a, b) => {
      const recency = (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0);
      return b.score - a.score || recency;
    });

    const section: DigitalSolutionMatchSection | null = matches.length > 0
      ? {
          title: 'Size Uygun Dijital & AI Çözümleri',
          description: 'İşletmenizin ölçeğine, sektörünüze ve ihtiyaçlarınıza uygun dijital ve yapay zeka çözümleri.',
          matches: matches.slice(0, DIGITAL_SOLUTION_RESULT_LIMIT),
          totalMatchesCount: matches.length,
        }
      : null;

    const result: DigitalSolutionMatchesResult = {
      solutions: section,
      hasConsumerContext,
      missingContextLabel: !hasConsumerContext
        ? 'Size uygun dijital çözümler bulabilmemiz için profilinizi veya şirket bilgilerinizi tamamlayın.'
        : null,
    };

    assertNoDigitalSolutionContactLeak(result);
    return result;
  }

  /**
   * Recommendations for digital solution listing detail page (/ilan/[slug]).
   * Self-match prevention: skips sourceListing.id.
   */
  async getListingRecommendations(sourceListing: Listing): Promise<DigitalSolutionMatchSection | null> {
    if (!isDigitalSolutionListing(sourceListing)) return null;

    const consumer = buildDigitalSolutionConsumerProfile({
      sourceSolutionListing: sourceListing,
    });

    const pool = await this.listings.findPublished(
      {
        categoryId: CATEGORY_IDS.dijitalAi,
        sortBy: 'newest',
      },
      { page: 1, limit: DIGITAL_SOLUTION_MATCH_POOL_LIMIT },
    );

    // Filter candidates and exclude current listing ID (Self-match prevention)
    const candidates = pool.data.filter((listing) => {
      if (listing.id === sourceListing.id) return false;
      if (sourceListing.ownerId && listing.ownerId === sourceListing.ownerId) return false;
      return isDigitalSolutionListing(listing);
    });

    const matches: DigitalSolutionMatchCard[] = [];
    for (const listing of candidates) {
      const match = calculateDigitalSolutionMatch(consumer, {
        listingId: String(listing.id),
        title: listing.title,
        shortDescription: listing.shortDescription,
        solutionType: String(listing.customFields?.solutionType || ''),
        deliveryModel: String(listing.customFields?.deliveryModel || ''),
        targetAudience: String(listing.customFields?.targetAudience || ''),
        priceRange: String(listing.customFields?.priceRange || ''),
        demoUrl: String(listing.customFields?.demoUrl || ''),
        capabilities: Array.isArray(listing.customFields?.capabilities)
          ? (listing.customFields.capabilities as string[])
          : [],
        supportedLanguages: Array.isArray(listing.customFields?.supportedLanguages)
          ? (listing.customFields.supportedLanguages as string[])
          : [],
        industry: listing.industry || String(listing.customFields?.sector || ''),
        city: listing.city,
        location: listing.location,
        publishedAt: listing.publishedAt,
      });

      const card = toPublicDigitalSolutionMatchCard(listing, match);
      if (card) {
        matches.push(card);
      }
    }

    matches.sort((a, b) => {
      const recency = (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0);
      return b.score - a.score || recency;
    });

    const section: DigitalSolutionMatchSection = {
      title: 'Sana Uygun Çözümler',
      description: 'Girişiminiz ve operasyonlarınız için öne çıkan diğer dijital ve yapay zeka çözümlerini keşfedin.',
      sourceListingId: String(sourceListing.id),
      matches: matches.slice(0, DIGITAL_SOLUTION_RESULT_LIMIT),
      totalMatchesCount: matches.length,
    };

    assertNoDigitalSolutionContactLeak(section);
    return section;
  }
}

export function createDigitalSolutionMatchService(container: {
  listingRepository: DigitalSolutionListingStore;
  companyRepository?: DigitalSolutionCompanyStore;
  profileRepository?: DigitalSolutionProfileStore;
}): DigitalSolutionMatchService {
  return new DigitalSolutionMatchService(
    container.listingRepository,
    container.companyRepository,
    container.profileRepository,
  );
}
