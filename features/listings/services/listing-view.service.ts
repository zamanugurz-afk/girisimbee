import { ids } from '@/lib/domain/ids';
import type { ListingId } from '@/lib/domain/ids';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ListingViewRepository } from '@/features/listings/repositories/listing-view.repository';
import type {
  RecordListingViewInput,
  RecordListingViewResult,
} from '@/features/listings/types/listing-view.types';

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

function startOfUtcDayIso(date = new Date()): string {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  ).toISOString();
}

/**
 * Listing view analytics — listing_views + listings.view_count.
 * Method names match ACCOUNT INTEGRATION – STEP 4 contract.
 */
export class ListingViewService {
  constructor(
    private readonly views: ListingViewRepository,
    private readonly listings: ListingRepository,
  ) {}

  async recordView(input: RecordListingViewInput): Promise<RecordListingViewResult> {
    const sinceIso = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
    const viewerId = input.viewerId ?? null;
    const ipAddress = input.ipAddress?.trim() || null;

    if (viewerId) {
      const recent = await this.views.findRecentByViewer(
        input.listingId,
        viewerId,
        sinceIso,
      );
      if (recent) {
        return {
          recorded: false,
          view: recent,
          viewCount: await this.getViewCount(input.listingId),
        };
      }
    } else if (ipAddress) {
      const recent = await this.views.findRecentByIp(
        input.listingId,
        ipAddress,
        sinceIso,
      );
      if (recent) {
        return {
          recorded: false,
          view: recent,
          viewCount: await this.getViewCount(input.listingId),
        };
      }
    }

    const view = await this.views.insert({
      id: ids.listingView(crypto.randomUUID()),
      listingId: input.listingId,
      viewerId,
      ipAddress,
      deviceType: input.deviceType ?? 'unknown',
    });

    await this.incrementViewCount(input.listingId);
    return {
      recorded: true,
      view,
      viewCount: await this.getViewCount(input.listingId),
    };
  }

  async incrementViewCount(listingId: ListingId): Promise<void> {
    await this.listings.incrementViewCount(listingId);
  }

  async getViewCount(listingId: ListingId): Promise<number> {
    const listing = await this.listings.findById(listingId);
    return listing?.viewCount ?? 0;
  }

  getUniqueViewCount(listingId: ListingId): Promise<number> {
    return this.views.countUniqueByListing(listingId);
  }

  getDailyViewCount(listingId: ListingId): Promise<number> {
    return this.views.countSince(listingId, startOfUtcDayIso());
  }
}
