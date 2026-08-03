import type {
  AccountShowcaseCardData,
  AccountShowcaseTab,
} from '@/features/account/types/account-showcase.types';

export const ACCOUNT_SHOWCASE_TABS: {
  id: AccountShowcaseTab;
  label: string;
}[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'vitrin', label: 'Vitrin' },
  { id: 'acil_vitrin', label: 'Acil Vitrin' },
];

export const ACCOUNT_SHOWCASE_PACKAGE_LABELS: Record<
  AccountShowcaseCardData['packageType'],
  string
> = {
  vitrin: 'Vitrin',
  acil_vitrin: 'Acil Vitrin',
};

export const ACCOUNT_SHOWCASE_STATUS_LABELS: Record<
  AccountShowcaseCardData['status'],
  string
> = {
  active: 'Aktif',
  expiring: 'Süresi yaklaşıyor',
  expired: 'Süresi doldu',
};
