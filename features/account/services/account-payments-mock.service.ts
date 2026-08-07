import type {
  AccountPaymentCardData,
  AccountPaymentStatsData,
  AccountPaymentsTab,
} from '@/features/account/types/account-payments.types';
import {
  MOCK_ACCOUNT_PAYMENTS,
  MOCK_ACCOUNT_PAYMENT_STATS,
} from '@/features/account/types/account-payments.constants';

export function getMockAccountPayments(): AccountPaymentCardData[] {
  return MOCK_ACCOUNT_PAYMENTS;
}

export function getMockAccountPaymentStats(): AccountPaymentStatsData {
  return MOCK_ACCOUNT_PAYMENT_STATS;
}

export function filterMockAccountPayments(
  items: AccountPaymentCardData[],
  tab: AccountPaymentsTab,
): AccountPaymentCardData[] {
  if (tab === 'all') return items;
  return items.filter((item) => item.status === tab);
}

export function formatTryAmount(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}
