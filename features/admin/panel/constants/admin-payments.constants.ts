import type {
  AdminPaymentMethod,
  AdminPaymentPackageType,
  AdminPaymentSection,
  AdminPaymentStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_PAYMENT_PACKAGE_TYPES: readonly AdminPaymentPackageType[] = [
  'standart',
  'vitrin',
  'acil_vitrin',
] as const;

export const ADMIN_PAYMENT_METHODS: readonly AdminPaymentMethod[] = [
  'card',
  'bank_transfer',
  'wallet',
] as const;

export const ADMIN_PAYMENT_STATUSES: readonly AdminPaymentStatus[] = [
  'pending',
  'completed',
  'failed',
  'cancelled',
  'refunded',
] as const;

export const ADMIN_PAYMENT_SECTIONS: readonly {
  id: AdminPaymentSection;
  label: string;
}[] = [
  { id: 'payments', label: 'Ödemeler' },
  { id: 'refunds', label: 'İadeler' },
  { id: 'commissions', label: 'Komisyonlar' },
  { id: 'invoices', label: 'Faturalar' },
  { id: 'failed', label: 'Başarısız işlemler' },
  { id: 'pending', label: 'Bekleyen işlemler' },
] as const;

export const ADMIN_PAYMENT_PACKAGE_LABELS: Record<AdminPaymentPackageType, string> = {
  standart: 'Standart',
  vitrin: 'Vitrin',
  acil_vitrin: 'Süper İlan',
};

export const ADMIN_PAYMENT_METHOD_LABELS: Record<AdminPaymentMethod, string> = {
  card: 'Kart',
  bank_transfer: 'Havale / EFT',
  wallet: 'Cüzdan',
};

export const ADMIN_PAYMENT_STATUS_LABELS: Record<AdminPaymentStatus, string> = {
  pending: 'Beklemede',
  completed: 'Tamamlandı',
  failed: 'Başarısız',
  cancelled: 'İptal',
  refunded: 'İade edildi',
};

export const ADMIN_PAYMENTS_PAGE_SIZE = 5;
