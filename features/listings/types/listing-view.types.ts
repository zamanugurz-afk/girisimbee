/**
 * Listing view event — `listing_views`
 * (id, listing_id, viewer_id, ip_address, device_type, created_at).
 */
import type { ListingId, ListingViewId, UserId } from '@/lib/domain/ids';

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface ListingView {
  id: ListingViewId;
  listingId: ListingId;
  viewerId: UserId | null;
  ipAddress: string | null;
  deviceType: DeviceType;
  createdAt: string;
}

export type RecordListingViewInput = {
  listingId: ListingId;
  viewerId?: UserId | null;
  ipAddress?: string | null;
  deviceType?: DeviceType;
};

export type RecordListingViewResult = {
  recorded: boolean;
  view: ListingView | null;
  viewCount: number;
};
