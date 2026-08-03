import type {
  AdminVerificationStatus,
  AdminVerificationType,
} from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_VERIFICATION_TYPES: readonly AdminVerificationType[] = [
  'identity',
  'phone',
  'email',
  'company',
  'investor',
  'franchise',
] as const;

export const ADMIN_VERIFICATION_STATUSES: readonly AdminVerificationStatus[] = [
  'pending',
  'reviewing',
  'approved',
  'rejected',
] as const;

export const ADMIN_VERIFICATION_TYPE_LABELS: Record<AdminVerificationType, string> = {
  identity: 'Kimlik doğrulama',
  phone: 'Telefon doğrulama',
  email: 'E-posta doğrulama',
  company: 'Şirket doğrulama',
  investor: 'Yatırımcı doğrulama',
  franchise: 'Franchise doğrulama',
};

export const ADMIN_VERIFICATION_STATUS_LABELS: Record<AdminVerificationStatus, string> = {
  pending: 'Beklemede',
  reviewing: 'İnceleniyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

export const ADMIN_VERIFICATIONS_PAGE_SIZE = 5;
