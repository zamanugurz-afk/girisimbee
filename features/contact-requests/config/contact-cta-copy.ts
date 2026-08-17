/**
 * Presentation-only contact-request CTA copy.
 * Does not change APIs, status flow, or matching.
 */
export const CONTACT_CTA_DEFAULT_LABEL = 'İletişim Talebi Gönder';
export const CONTACT_CTA_SUBMIT_LABEL = 'İletişim Talebini Gönder';
export const CONTACT_CTA_PRIVACY_SHORT = 'İletişim bilgileriniz gizli kalır.';

export const CAREER_CONTACT_STATUS_COPY = {
  pending: 'İletişim talebiniz gönderildi. Karşı tarafın yanıtı bekleniyor.',
  accepted: 'Karşı taraf talebinizi kabul etti.',
  rejected: 'İletişim talebi reddedildi.',
} as const;

export function resolveContactCtaLabel(categoryId?: string | null): string {
  switch (categoryId) {
    case 'find-partner':
      return 'Ortaklık İletişim Talebi Gönder';
    case 'franchise':
      return 'Franchise İletişim Talebi Gönder';
    case 'digital-ai':
    case 'dijital-ai':
      return 'Çözüm Hakkında Bilgi Al';
    default:
      return CONTACT_CTA_DEFAULT_LABEL;
  }
}

export function isCareerContactCategory(categoryId?: string | null): boolean {
  return categoryId === 'find-job' || categoryId === 'hire' || categoryId === 'is-bul' || categoryId === 'ise-al';
}

export function isContactIdentityGated(
  categoryId?: string | null,
  identityRedacted?: boolean,
): boolean {
  return Boolean(identityRedacted) || categoryId === 'find-job' || categoryId === 'is-bul';
}

export function resolveContactStatusLabel(
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled',
  options?: { categoryId?: string | null; identityGated?: boolean },
): string {
  if (isCareerContactCategory(options?.categoryId)) {
    if (status === 'pending') return CAREER_CONTACT_STATUS_COPY.pending;
    if (status === 'accepted') {
      return options?.identityGated
        ? 'Karşı taraf talebinizi kabul etti. İzin verilen iletişim bilgileri size açıldı.'
        : 'Karşı taraf talebinizi kabul etti. Mesajlaşabilir; izin verilen iletişim bilgileri size açıldı.';
    }
    if (status === 'rejected') return CAREER_CONTACT_STATUS_COPY.rejected;
  }

  switch (status) {
    case 'pending':
      return 'Talebiniz ilan sahibine iletildi. Yanıt bekleniyor.';
    case 'accepted':
      return options?.identityGated
        ? 'İletişim talebi kabul edildi. Ad soyad ve izin verilen iletişim bilgileri size açıldı; mesajlaşabilirsiniz.'
        : 'Talebiniz kabul edildi. Mesajlaşabilir; telefon ve ad-soyad bilgisi size açıldı.';
    case 'rejected':
      return 'Talebiniz reddedildi.';
    case 'expired':
      return 'Talebinizin süresi doldu. Yeni talep gönderebilirsiniz.';
    case 'cancelled':
      return 'Talebinizi iptal ettiniz. Yeni talep gönderebilirsiniz.';
    default:
      return '';
  }
}
