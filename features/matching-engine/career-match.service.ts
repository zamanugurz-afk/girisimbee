import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { CompanyId, ListingTypeId, UserId } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { extractCareerMatchProfile } from '@/features/matching-engine/adapters/career-fields';
import { scoreNormalizedCareerSources } from '@/features/matching-engine/normalized-match';
import {
  classifyCareerListingKind,
  getCareerHireListingTypeIds,
  getCareerSeekListingTypeIds,
} from '@/features/matching-engine/adapters/career-listing-kinds';
import { toPublicCareerMatchCard } from '@/features/matching-engine/adapters/public-card';
import { calculateCareerProfileCompletion } from '@/features/career-profile/completion';
import { MATCH_SECTION_COPY } from '@/features/matching-engine/presentation/career-match-copy';
import { resolveMatchPartyLabel } from '@/features/matching-engine/presentation/career-match-party';
import type {
  CareerListingKind,
  CareerMatchCard,
  CareerMatchCompletionSummary,
  CareerMatchesResult,
  CareerMatchSection,
} from '@/features/matching-engine/types';

export const CAREER_MATCH_POOL_LIMIT = 80;
export const CAREER_MATCH_RESULT_LIMIT = 6;

export interface CareerMatchListingStore {
  search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
}

export interface CareerMatchDirectories {
  findProfilesByUserIds?(userIds: UserId[]): Promise<Array<{ userId: UserId; displayName: string }>>;
  findCompaniesByIds?(companyIds: CompanyId[]): Promise<Array<{ id: CompanyId; name: string }>>;
}

function listingRecency(listing: Listing): number {
  const stamp = listing.publishedAt || listing.updatedAt || listing.createdAt;
  const time = stamp ? Date.parse(stamp) : 0;
  return Number.isFinite(time) ? time : 0;
}

function pickLatest(listings: Listing[]): Listing | null {
  if (!listings.length) return null;
  return [...listings].sort((a, b) => listingRecency(b) - listingRecency(a))[0] ?? null;
}

function toCompletionSummary(listing: Listing, kind: CareerListingKind): CareerMatchCompletionSummary {
  const completion = calculateCareerProfileCompletion({
    kind,
    listingId: String(listing.id),
    source: { city: listing.city, location: listing.location, customFields: listing.customFields },
  });
  return {
    kind,
    listingId: completion.listingId,
    percent: completion.percent,
    complete: completion.complete,
    missingLabels: completion.missingLabels,
  };
}

function readCompanyNameFromListing(listing: Listing): string | null {
  const value = listing.customFields?.companyName;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export class CareerMatchService {
  constructor(
    private readonly listings: CareerMatchListingStore,
    private readonly directories: CareerMatchDirectories = {},
  ) {}

  async getCareerMatches(userId: UserId): Promise<CareerMatchesResult> {
    const [owned, unpublished] = await Promise.all([
      this.listings.search({ ownerId: userId, status: ['published'] }, { page: 1, limit: 100 }),
      this.listings.search({ ownerId: userId, status: ['draft', 'paused'] }, { page: 1, limit: 100 }),
    ]);

    const seekSources: Listing[] = [];
    const hireSources: Listing[] = [];
    const seekDrafts: Listing[] = [];
    const hireDrafts: Listing[] = [];
    for (const listing of owned.data) {
      const kind = classifyCareerListingKind(listing);
      if (kind === 'seek') seekSources.push(listing);
      if (kind === 'hire') hireSources.push(listing);
    }
    for (const listing of unpublished.data) {
      const kind = classifyCareerListingKind(listing);
      if (kind === 'seek') seekDrafts.push(listing);
      if (kind === 'hire') hireDrafts.push(listing);
    }

    const seekSource = pickLatest(seekSources);
    const hireSource = pickLatest(hireSources);

    const [opportunities, candidates] = await Promise.all([
      seekSource
        ? this.buildSection({
            userId,
            source: seekSource,
            sourceKind: 'seek',
            counterpartKind: 'hire',
            counterpartTypeIds: getCareerHireListingTypeIds(),
          })
        : Promise.resolve(null),
      hireSource
        ? this.buildSection({
            userId,
            source: hireSource,
            sourceKind: 'hire',
            counterpartKind: 'seek',
            counterpartTypeIds: getCareerSeekListingTypeIds(),
          })
        : Promise.resolve(null),
    ]);

    return {
      opportunities,
      candidates,
      completion: {
        seek: seekSource ? toCompletionSummary(seekSource, 'seek') : null,
        hire: hireSource ? toCompletionSummary(hireSource, 'hire') : null,
      },
      presence: {
        seek: seekSource ? 'published' : pickLatest(seekDrafts) ? 'draft' : 'none',
        hire: hireSource ? 'published' : pickLatest(hireDrafts) ? 'draft' : 'none',
      },
    };
  }

  /**
   * Recommendations for listing detail page (/ilan/[slug]).
   * Calculates matches using the exact same Career Matching Engine.
   */
  async getListingRecommendations(sourceListing: Listing): Promise<CareerMatchSection | null> {
    const kind = classifyCareerListingKind(sourceListing);
    if (!kind) return null;

    const counterpartKind: CareerListingKind = kind === 'seek' ? 'hire' : 'seek';
    const counterpartTypeIds =
      counterpartKind === 'hire'
        ? getCareerHireListingTypeIds()
        : getCareerSeekListingTypeIds();

    const pool = await this.listings.findPublished(
      {
        listingTypeIds: counterpartTypeIds,
        sortBy: 'newest',
      },
      { page: 1, limit: CAREER_MATCH_POOL_LIMIT },
    );

    const counterparts = pool.data.filter((listing) => {
      if (listing.id === sourceListing.id) return false;
      if (sourceListing.ownerId && listing.ownerId === sourceListing.ownerId) return false;
      return classifyCareerListingKind(listing) === counterpartKind;
    });

    const { profileByUser, companyById } = await this.loadDirectories(counterparts);

    const matches: CareerMatchCard[] = [];

    for (const listing of counterparts) {
      const counterpart = extractCareerMatchProfile(listing);
      const match =
        kind === 'seek'
          ? scoreNormalizedCareerSources(sourceListing, listing)
          : scoreNormalizedCareerSources(listing, sourceListing);
      const companyName =
        counterpartKind === 'hire'
          ? (listing.companyId ? companyById.get(listing.companyId) : null) ?? readCompanyNameFromListing(listing)
          : null;
      const card = toPublicCareerMatchCard(listing, counterpartKind, match, {
        profile: counterpart,
        partyLabel: resolveMatchPartyLabel({
          kind: counterpartKind,
          companyName,
          ownerDisplayName: profileByUser.get(listing.ownerId) ?? null,
        }),
      });
      if (card) matches.push(card);
    }

    matches.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'tr'));

    const isSeeker = kind === 'seek';
    return {
      direction: isSeeker ? 'opportunities' : 'candidates',
      title: isSeeker ? 'Sana Uygun İş İlanları' : 'Sana Uygun Adaylar',
      description: isSeeker
        ? 'Profilinize, deneyiminize ve tercihlerinize uygun iş ilanlarını keşfedin.'
        : 'İlanınızın gereksinimlerine uygun aday profillerini keşfedin.',
      sourceListingId: String(sourceListing.id),
      sourceTitle: sourceListing.title,
      sourceKind: kind,
      matches: matches.slice(0, CAREER_MATCH_RESULT_LIMIT),
      totalMatchesCount: matches.length,
    };
  }

  private async buildSection(input: {
    userId: UserId;
    source: Listing;
    sourceKind: CareerListingKind;
    counterpartKind: CareerListingKind;
    counterpartTypeIds: ListingTypeId[];
  }): Promise<CareerMatchSection> {
    const pool = await this.listings.findPublished(
      {
        listingTypeIds: input.counterpartTypeIds,
        sortBy: 'newest',
      },
      { page: 1, limit: CAREER_MATCH_POOL_LIMIT },
    );

    const counterparts = pool.data.filter((listing) => {
      if (listing.ownerId === input.userId) return false;
      if (listing.id === input.source.id) return false;
      return classifyCareerListingKind(listing) === input.counterpartKind;
    });

    const { profileByUser, companyById } = await this.loadDirectories(counterparts);

    const matches: CareerMatchCard[] = [];

    for (const listing of counterparts) {
      const counterpart = extractCareerMatchProfile(listing);
      const match =
        input.sourceKind === 'seek'
          ? scoreNormalizedCareerSources(input.source, listing)
          : scoreNormalizedCareerSources(listing, input.source);
      const companyName =
        input.counterpartKind === 'hire'
          ? (listing.companyId ? companyById.get(listing.companyId) : null) ?? readCompanyNameFromListing(listing)
          : null;
      const card = toPublicCareerMatchCard(listing, input.counterpartKind, match, {
        profile: counterpart,
        partyLabel: resolveMatchPartyLabel({
          kind: input.counterpartKind,
          companyName,
          ownerDisplayName: profileByUser.get(listing.ownerId) ?? null,
        }),
      });
      if (card) matches.push(card);
    }

    matches.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'tr'));

    const copy = MATCH_SECTION_COPY[input.sourceKind === 'seek' ? 'opportunities' : 'candidates'];
    return {
      direction: input.sourceKind === 'seek' ? 'opportunities' : 'candidates',
      title: copy.title,
      description: copy.description,
      sourceListingId: String(input.source.id),
      sourceTitle: input.source.title,
      sourceKind: input.sourceKind,
      matches: matches.slice(0, CAREER_MATCH_RESULT_LIMIT),
      totalMatchesCount: matches.length,
    };
  }

  private async loadDirectories(listings: Listing[]): Promise<{
    profileByUser: Map<UserId, string>;
    companyById: Map<CompanyId, string>;
  }> {
    const userIds = [...new Set(listings.map((listing) => listing.ownerId))];
    const companyIds = [...new Set(
      listings
        .map((listing) => listing.companyId)
        .filter((id): id is CompanyId => Boolean(id)),
    )];

    const [profiles, companies] = await Promise.all([
      userIds.length && this.directories.findProfilesByUserIds
        ? this.directories.findProfilesByUserIds(userIds).catch(() => [])
        : Promise.resolve([]),
      companyIds.length && this.directories.findCompaniesByIds
        ? this.directories.findCompaniesByIds(companyIds).catch(() => [])
        : Promise.resolve([]),
    ]);

    return {
      profileByUser: new Map(profiles.map((profile) => [profile.userId, profile.displayName])),
      companyById: new Map(companies.map((company) => [company.id, company.name])),
    };
  }
}

export function createCareerMatchService(container: {
  listingRepository: CareerMatchListingStore;
  profileRepository: { findByUserIds: NonNullable<CareerMatchDirectories['findProfilesByUserIds']> };
  companyRepository: { findByIds: NonNullable<CareerMatchDirectories['findCompaniesByIds']> };
}): CareerMatchService {
  return new CareerMatchService(container.listingRepository, {
    findProfilesByUserIds: (userIds) => container.profileRepository.findByUserIds(userIds),
    findCompaniesByIds: (companyIds) => container.companyRepository.findByIds(companyIds),
  });
}
