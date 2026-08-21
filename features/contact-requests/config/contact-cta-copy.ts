import {
  isContactRequestEligibleCategory,
  isContactRequestEligibleListing,
} from '@/features/contact-requests/lib/contact-disclosure';

export {
  isContactRequestEligibleCategory,
  isContactRequestEligibleListing,
};

/**
 * Presentation-only contact-request CTA copy.
 * Does not change APIs, status flow, or matching.
 */
export const CONTACT_CTA_DEFAULT_LABEL = 'İletişim Talebi Gönder';
export const CONTACT_CTA_SUBMIT_LABEL = 'İletişim Talebini Gönder';
export const CONTACT_CTA_PRIVACY_SHORT = 'İletişim bilgileriniz gizli kalır.';

export const CAREER_CONTACT_STATUS_COPY = {
  pending: 'İletişim talebiniz gönderildi. Karşı tarafın yanıtı bekleniyor.',
  accepted: 'İletişim talebiniz kabul edildi. İletişim bilgileri açıldı; mesajlaşabilirsiniz.',
  rejected: 'İletişim talebiniz reddedildi.',
} as const;

export function resolveContactCtaLabel(categoryId?: string | null): string {
  switch (categoryId) {
    case 'find-partner':
    case 'ortak-bul':
    case 'ortak-ariyorum':
    case 'ortak-olmak':
    case 'c1000001-0001-4000-8000-000000000005':
      return 'Ortaklık İletişim Talebi Gönder';
    case 'find-job':
    case 'is-bul':
    case 'is-ariyorum':
    case 'c1000001-0001-4000-8000-000000000003':
    default:
      return CONTACT_CTA_DEFAULT_LABEL;
  }
}

export function isCareerContactCategory(categoryId?: string | null): boolean {
  return (
    categoryId === 'find-job' ||
    categoryId === 'is-bul' ||
    categoryId === 'is-ariyorum' ||
    categoryId === 'c1000001-0001-4000-8000-000000000003'
  );
}

export function isContactIdentityGated(
  categoryId?: string | null,
  identityRedacted?: boolean,
): boolean {
  return (
    Boolean(identityRedacted) ||
    categoryId === 'find-job' ||
    categoryId === 'is-bul' ||
    categoryId === 'is-ariyorum' ||
    categoryId === 'c1000001-0001-4000-8000-000000000003'
  );
}

export function resolveContactStatusLabel(
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled',
  options?: { categoryId?: string | null; identityGated?: boolean },
): string {
  if (isCareerContactCategory(options?.categoryId)) {
    if (status === 'pending') return CAREER_CONTACT_STATUS_COPY.pending;
    if (status === 'accepted') return CAREER_CONTACT_STATUS_COPY.accepted;
    if (status === 'rejected') return CAREER_CONTACT_STATUS_COPY.rejected;
  }

  switch (status) {
    case 'pending':
      return 'İletişim talebiniz gönderildi. Karşı tarafın yanıtı bekleniyor.';
    case 'accepted':
      return 'İletişim talebiniz kabul edildi. İletişim bilgileri açıldı; mesajlaşabilirsiniz.';
    case 'rejected':
      return 'İletişim talebiniz reddedildi.';
    case 'expired':
      return 'Talebinizin süresi doldu. Yeni talep gönderebilirsiniz.';
    case 'cancelled':
      return 'Talebinizi iptal ettiniz. Yeni talep gönderebilirsiniz.';
    default:
      return '';
  }
}
