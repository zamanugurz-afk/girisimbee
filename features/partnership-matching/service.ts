import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type { UserId } from '@/lib/domain/ids';
import { scorePartnershipSources } from '@/features/partnership-matching/engine';
import {
  calculatePartnershipProfileCompletion,
  getPartnershipListingTypeIds,
  isPartnershipListing,
  normalizePartnershipSource,
  oppositePartnershipIntent,
} from '@/features/partnership-matching/normalize';
import { PARTNERSHIP_MATCH_SECTION_COPY } from '@/features/partnership-matching/presentation/partnership-match-copy';
import {
  assertNoPartnershipContactLeak,
  toPublicPartnershipMatchCard,
} from '@/features/partnership-matching/presentation/partnership-match-party';
import type {
  PartnershipMatchCard,
  PartnershipMatchDirection,
  PartnershipMatchIntent,
  PartnershipMatchesResult,
  PartnershipMatchSection,
  PartnershipSourcePresence,
} from '@/features/partnership-matching/types';

export const PARTNERSHIP_MATCH_POOL_LIMIT = 100;

export interface PartnershipMatchListingStore {
  search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
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

function presenceOf(published: Listing | null, drafts: Listing[]): PartnershipSourcePresence {
  if (published) return 'published';
  if (pickLatest(drafts)) return 'draft';
  return 'none';
}

export class PartnershipMatchService {
  constructor(private readonly listings: PartnershipMatchListingStore) {}

  async getPartnershipMatches(userId: UserId): Promise<PartnershipMatchesResult> {
    const [owned, unpublished] = await Promise.all([
      this.listings.search({ ownerId: userId, status: ['published'] }, { page: 1, limit: 100 }),
      this.listings.search({ ownerId: userId, status: ['draft', 'paused'] }, { page: 1, limit: 100 }),
    ]);

    const seekingPublished: Listing[] = [];
    const joiningPublished: Listing[] = [];
    const seekingDrafts: Listing[] = [];
    const joiningDrafts: Listing[] = [];

    for (const listing of owned.data) {
      if (!isPartnershipListing(listing)) continue;
      const intent = normalizePartnershipSource(listing).intent;
      if (intent === 'seeking') seekingPublished.push(listing);
      if (intent === 'joining') joiningPublished.push(listing);
    }
    for (const listing of unpublished.data) {
      if (!isPartnershipListing(listing)) continue;
      const intent = normalizePartnershipSource(listing).intent;
      if (intent === 'seeking') seekingDrafts.push(listing);
      if (intent === 'joining') joiningDrafts.push(listing);
    }

    const seekingSource = pickLatest(seekingPublished);
    const joiningSource = pickLatest(joiningPublished);

    const [partners, ventures] = await Promise.all([
      seekingSource ? this.buildSection(userId, seekingSource, 'seeking') : Promise.resolve(null),
      joiningSource ? this.buildSection(userId, joiningSource, 'joining') : Promise.resolve(null),
    ]);

    const result = {
      partners,
      ventures,
      completion: {
        seeking: seekingSource ? calculatePartnershipProfileCompletion(seekingSource) : null,
        joining: joiningSource ? calculatePartnershipProfileCompletion(joiningSource) : null,
      },
      presence: {
        seeking: presenceOf(seekingSource, seekingDrafts),
        joining: presenceOf(joiningSource, joiningDrafts),
      },
      editListingId: String(
        seekingSource?.id ?? joiningSource?.id ?? pickLatest([...seekingDrafts, ...joiningDrafts])?.id ?? '',
      ) || null,
    };

    assertNoPartnershipContactLeak(result);
    return result;
  }

  private async buildSection(
    userId: UserId,
    source: Listing,
    sourceIntent: PartnershipMatchIntent,
  ): Promise<PartnershipMatchSection> {
    const counterpartIntent = oppositePartnershipIntent(sourceIntent);
    const pool = await this.listings.findPublished(
      {
        listingTypeIds: getPartnershipListingTypeIds(),
        sortBy: 'newest',
      },
      { page: 1, limit: PARTNERSHIP_MATCH_POOL_LIMIT },
    );

    const counterparts = pool.data.filter((listing) => {
      if (listing.ownerId === userId) return false;
      if (listing.id === source.id) return false;
      if (!isPartnershipListing(listing)) return false;
      return normalizePartnershipSource(listing).intent === counterpartIntent;
    });

    const matches: PartnershipMatchCard[] = [];
    for (const listing of counterparts) {
      const match = scorePartnershipSources(source, listing);
      const card = toPublicPartnershipMatchCard(listing, match);
      if (card) matches.push(card);
    }

    matches.sort((a, b) => {
      const recency = (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0);
      return b.score - a.score || recency;
    });

    const direction: PartnershipMatchDirection = sourceIntent === 'seeking' ? 'partners' : 'ventures';
    const copy = PARTNERSHIP_MATCH_SECTION_COPY[direction];

    return {
      direction,
      title: copy.title,
      description: copy.description,
      sourceListingId: String(source.id),
      sourceTitle: source.title,
      sourceIntent,
      matches,
      totalMatchesCount: matches.length,
    };
  }

  /**
   * Recommendations for partnership listing detail page (/ilan/[slug]).
   * Matches seeking (Ortak Arıyorum) with joining (Ortak Olmak İstiyorum) and vice versa.
   */
  async getListingRecommendations(sourceListing: Listing): Promise<PartnershipMatchSection | null> {
    if (!isPartnershipListing(sourceListing)) return null;

    const sourceIntent = normalizePartnershipSource(sourceListing).intent;
    const counterpartIntent = oppositePartnershipIntent(sourceIntent);

    const pool = await this.listings.findPublished(
      {
        listingTypeIds: getPartnershipListingTypeIds(),
        sortBy: 'newest',
      },
      { page: 1, limit: PARTNERSHIP_MATCH_POOL_LIMIT },
    );

    const counterparts = pool.data.filter((listing) => {
      if (listing.id === sourceListing.id) return false;
      if (sourceListing.ownerId && listing.ownerId === sourceListing.ownerId) return false;
      if (!isPartnershipListing(listing)) return false;
      return normalizePartnershipSource(listing).intent === counterpartIntent;
    });

    const matches: PartnershipMatchCard[] = [];
    for (const listing of counterparts) {
      const match = scorePartnershipSources(sourceListing, listing);
      const card = toPublicPartnershipMatchCard(listing, match);
      if (card) matches.push(card);
    }

    matches.sort((a, b) => {
      const recency = (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0);
      return b.score - a.score || recency;
    });

    const isSeeking = sourceIntent === 'seeking';
    const direction: PartnershipMatchDirection = isSeeking ? 'partners' : 'ventures';

    const section: PartnershipMatchSection = {
      direction,
      title: isSeeking ? 'Sana Uygun Ortaklar' : 'Sana Uygun Girişimler',
      description: isSeeking
        ? 'Girişiminize ve aradığınız uzmanlıklara uygun kurucu / iş ortağı profillerini keşfedin.'
        : 'Uzmanlığınıza ve tercihlerinize uygun ortak arayan girişimleri keşfedin.',
      sourceListingId: String(sourceListing.id),
      sourceTitle: sourceListing.title,
      sourceIntent,
      matches: matches.slice(0, 6),
      totalMatchesCount: matches.length,
    };

    assertNoPartnershipContactLeak(section);
    return section;
  }
}

export function createPartnershipMatchService(container: {
  listingRepository: PartnershipMatchListingStore;
}): PartnershipMatchService {
  return new PartnershipMatchService(container.listingRepository);
}
