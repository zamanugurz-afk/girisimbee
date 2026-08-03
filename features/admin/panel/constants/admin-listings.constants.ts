import type { AdminListingStatus } from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_LISTING_STATUSES: readonly AdminListingStatus[] = [
  'draft',
  'active',
  'pending',
  'suspended',
  'deleted',
] as const;

export const ADMIN_LISTING_STATUS_LABELS: Record<AdminListingStatus, string> = {
  draft: 'Taslak',
  active: 'Aktif',
  pending: 'İncelemede',
  suspended: 'Yayından kaldırıldı',
  deleted: 'Silindi',
};

export const ADMIN_LISTING_CATEGORIES = [
  'Yatırım',
  'Franchise',
  'İş ilanı',
  'Startup',
  'Ortaklık',
] as const;

export type AdminListingCategory = (typeof ADMIN_LISTING_CATEGORIES)[number];

export const ADMIN_LISTINGS_PAGE_SIZE = 5;
