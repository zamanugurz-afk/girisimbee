import { ids } from '@/lib/domain/ids';
import type {
  DeviceType,
  ListingView,
} from '@/features/listings/types/listing-view.types';

export interface ListingViewRow {
  id: string;
  listing_id: string;
  viewer_id: string | null;
  ip_address: string | null;
  device_type: string | null;
  created_at: string;
}

const DEVICE_TYPES: DeviceType[] = ['desktop', 'mobile', 'tablet', 'unknown'];

function mapDeviceType(value: string | null | undefined): DeviceType {
  if (value && DEVICE_TYPES.includes(value as DeviceType)) {
    return value as DeviceType;
  }
  return 'unknown';
}

export function mapListingViewRow(row: ListingViewRow): ListingView {
  return {
    id: ids.listingView(row.id),
    listingId: ids.listing(row.listing_id),
    viewerId: row.viewer_id ? ids.user(row.viewer_id) : null,
    ipAddress: row.ip_address,
    deviceType: mapDeviceType(row.device_type),
    createdAt: row.created_at,
  };
}

export function toListingViewInsert(input: {
  id: string;
  listingId: string;
  viewerId?: string | null;
  ipAddress?: string | null;
  deviceType?: DeviceType;
}): Omit<ListingViewRow, 'created_at'> {
  return {
    id: input.id,
    listing_id: input.listingId,
    viewer_id: input.viewerId ?? null,
    ip_address: input.ipAddress ?? null,
    device_type: input.deviceType ?? 'unknown',
  };
}
