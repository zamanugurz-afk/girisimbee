import type {
  AccountPaymentCardData,
  AccountPaymentPackageType,
  AccountPaymentStatus,
  AccountPaymentStatsData,
  AccountPaymentsTab,
} from '@/features/account/types/account-payments.types';

export const ACCOUNT_PAYMENTS_TABS: {
  id: AccountPaymentsTab;
  label: string;
}[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'completed', label: 'Tamamlanan' },
  { id: 'pending', label: 'Bekleyen' },
  { id: 'failed', label: 'Başarısız' },
];

export const ACCOUNT_PAYMENT_STATUS_LABELS: Record<AccountPaymentStatus, string> = {
  completed: 'Tamamlandı',
  pending: 'Bekliyor',
  failed: 'Başarısız',
};

export const ACCOUNT_PAYMENT_PACKAGE_TYPE_LABELS: Record<
  AccountPaymentPackageType,
  string
> = {
  vitrin: 'Vitrin',
  acil_vitrin: 'Süper İlan',
  standart: 'Standart',
};

export const MOCK_ACCOUNT_PAYMENT_STATS: AccountPaymentStatsData = {
  totalPayments: 5,
  totalSpentTry: 136,
  activePackageCount: 3,
};

/**
 * Mock payment history only.
 * No card number, CVV, expiry, or provider secrets.
 */
export const MOCK_ACCOUNT_PAYMENTS: AccountPaymentCardData[] = [
  {
    id: 'pay-001',
    transactionNumber: 'GC-TX-20260728-001',
    packageName: 'Vitrin Paketi — 30 gün',
    packageType: 'vitrin',
    paidAt: '2026-07-28T11:20:00.000Z',
    amountTry: 29,
    status: 'completed',
    invoiceNumber: 'INV-2026-0728-001',
  },
  {
    id: 'pay-002',
    transactionNumber: 'GC-TX-20260720-014',
    packageName: 'Süper İlan Paketi — 30 gün',
    packageType: 'acil_vitrin',
    paidAt: '2026-07-20T09:05:00.000Z',
    amountTry: 39,
    status: 'completed',
    invoiceNumber: 'INV-2026-0720-014',
  },
  {
    id: 'pay-003',
    transactionNumber: 'GC-TX-20260715-008',
    packageName: 'Vitrin Paketi — 30 gün',
    packageType: 'vitrin',
    paidAt: '2026-07-15T16:40:00.000Z',
    amountTry: 29,
    status: 'completed',
    invoiceNumber: 'INV-2026-0715-008',
  },
  {
    id: 'pay-004',
    transactionNumber: 'GC-TX-20260801-003',
    packageName: 'Süper İlan Paketi — 30 gün',
    packageType: 'acil_vitrin',
    paidAt: null,
    amountTry: 39,
    status: 'pending',
    invoiceNumber: null,
  },
  {
    id: 'pay-005',
    transactionNumber: 'GC-TX-20260618-021',
    packageName: 'Vitrin Paketi — 30 gün',
    packageType: 'vitrin',
    paidAt: '2026-06-18T13:10:00.000Z',
    amountTry: 29,
    status: 'failed',
    invoiceNumber: null,
  },
];
