import type { ListingId, UserId } from '@/lib/domain/ids';
import type { PersistenceContainer } from '@/lib/persistence/container';
import {
  extractClientIp,
  extractDeviceType,
} from '@/features/listings/lib/listing-view-request';

/** Record a listing view with 24h dedupe (auth user or guest IP). */
export async function trackListingViewFromRequest(options: {
  container: PersistenceContainer;
  request: Request;
  listingId: ListingId;
  viewerId?: UserId | null;
  published?: boolean;
}): Promise<void> {
  if (options.published === false) return;
  try {
    await options.container.listingViewService.recordView({
      listingId: options.listingId,
      viewerId: options.viewerId ?? null,
      ipAddress: extractClientIp(options.request),
      deviceType: extractDeviceType(options.request),
    });
  } catch {
    // View tracking must not break detail responses.
  }
}
