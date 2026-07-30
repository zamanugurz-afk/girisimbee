import type { ListingStatus } from '@/features/listings/types/listing.entity.types';

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Taslak',
  pending_review: 'İncelemede',
  published: 'Yayında',
  paused: 'Duraklatıldı',
  expired: 'Süresi Doldu',
  archived: 'Arşivlendi',
  rejected: 'Reddedildi',
  sold: 'Satıldı',
  deleted: 'Silindi',
};

export function getListingStatusLabel(status: ListingStatus): string {
  return LISTING_STATUS_LABELS[status];
}
