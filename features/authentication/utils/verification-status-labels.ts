import type { VerificationStatus } from '@/features/authentication/types/verification.types';

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Beklemede',
  in_review: 'İncelemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  expired: 'Süresi Doldu',
};

export function getVerificationStatusLabel(status: VerificationStatus): string {
  return VERIFICATION_STATUS_LABELS[status];
}
