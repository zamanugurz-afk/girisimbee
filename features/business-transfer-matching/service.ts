import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type { UserId } from '@/lib/domain/ids';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import {
  extractBusinessTransferOpportunity,
  extractBusinessTransferSeeker,
  formatPriceCurrency,
  isBusinessTransferListing,
} from '@/features/business-transfer-matching/normalize';
import { calculateBusinessTransferMatch } from '@/features/business-transfer-matching/engine';
import type {
  BusinessTransferMatchCard,
  BusinessTransferMatchSection,
} from '@/features/business-transfer-matching/types';

export const BUSINESS_TRANSFER_MATCH_POOL_LIMIT = 100;
export const BUSINESS_TRANSFER_RESULT_LIMIT = 6;

export interface BusinessTransferMatchListingStore {
  search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
}

export class BusinessTransferMatchService {
  constructor(private readonly listings: BusinessTransferMatchListingStore) {}

  /**
   * Recommendations for business transfer detail page.
   * Self-match prevention: strictly excludes sourceListing.id.
   * Ecosystem boundary: strictly only searches within Business Transfer ecosystem.
   */
  async getListingRecommendations(sourceListing: Listing): Promise<BusinessTransferMatchSection | null> {
    if (!isBusinessTransferListing(sourceListing)) return null;

    const seeker = extractBusinessTransferSeeker({ listing: sourceListing });

    const pool = await this.listings.findPublished(
      {
        categoryId: CATEGORY_IDS.isletmeDevri,
        status: ['published'],
        sortBy: 'newest',
      },
      { page: 1, limit: BUSINESS_TRANSFER_MATCH_POOL_LIMIT },
    );

    // Candidates: must be published business transfer listings, strictly excluding source/own
    const candidates = pool.data.filter((listing) => {
      if (listing.id === sourceListing.id) return false;
      if (sourceListing.ownerId && listing.ownerId === sourceListing.ownerId) return false;
      if (listing.status !== 'published') return false;
      return isBusinessTransferListing(listing);
    });

    const matches: BusinessTransferMatchCard[] = [];
    for (const listing of candidates) {
      const opp = extractBusinessTransferOpportunity(listing);
      const match = calculateBusinessTransferMatch(seeker, opp);

      if (match.recommendable && match.band !== 'below_threshold') {
        matches.push({
          listingId: opp.listingId,
          slug: opp.slug,
          href: `/ilan/${opp.slug || opp.listingId}`,
          title: opp.title,
          businessName: opp.businessName,
          businessType: opp.businessType,
          sector: opp.sector,
          transferPrice: opp.transferPrice,
          formattedPrice: formatPriceCurrency(opp.transferPrice),
          location: opp.city ? `${opp.city}${opp.district ? ` / ${opp.district}` : ''}` : null,
          publishedAt: opp.publishedAt,
          score: match.score,
          band: match.band as Exclude<typeof match.band, 'below_threshold'>,
          bandLabel: match.bandLabel,
          reasons: match.reasons,
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, BUSINESS_TRANSFER_RESULT_LIMIT);

    if (topMatches.length === 0) return null;

    return {
      title: 'Benzer İşletme Fırsatları',
      description: 'Görüntülediğiniz işletmeye benzer sektör ve bütçedeki devir fırsatları',
      sourceListingId: String(sourceListing.id),
      matches: topMatches,
      totalMatchesCount: matches.length,
    };
  }

  /**
   * Matches for a user based on their active business transfer listings.
   */
  async getUserMatches(userId: UserId): Promise<BusinessTransferMatchSection | null> {
    const userListings = await this.listings.search(
      {
        ownerId: userId,
        status: ['published'],
      },
      { page: 1, limit: 10 },
    );

    const userTransferListings = userListings.data.filter(isBusinessTransferListing);
    if (userTransferListings.length === 0) return null;

    const latest = userTransferListings[0];
    return this.getListingRecommendations(latest);
  }
}
