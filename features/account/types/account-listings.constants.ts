import type {
  AccountListingCardData,
  AccountListingsTab,
} from '@/features/account/types/account-listings.types';

export const ACCOUNT_LISTINGS_TABS: {
  id: AccountListingsTab;
  label: string;
}[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'active', label: 'Aktif' },
  { id: 'expired', label: 'Süresi dolanlar' },
  { id: 'unpublished', label: 'Yayından kaldırılanlar' },
];

export const ACCOUNT_LISTING_CATEGORIES = [
  'Tümü',
  'Yatırım',
  'İş',
  'Franchise İlanları',
  'Ortaklık',
  'Dijital & AI Çözümleri',
] as const;

export const ACCOUNT_LISTING_STATUS_LABELS: Record<
  AccountListingCardData['status'],
  string
> = {
  active: 'Aktif',
  expired: 'Süresi doldu',
  unpublished: 'Yayından kaldırıldı',
};
