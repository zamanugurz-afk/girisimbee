export const FRANCHISE_BROWSE_TITLE = 'Franchise Fırsatları';

export const FRANCHISE_BROWSE_DESCRIPTION =
  'Yatırım yapmak istediğiniz sektöre ve lokasyona uygun franchise fırsatlarını keşfedin.';

export const FRANCHISE_HUB_DESCRIPTION =
  'Kanıtlanmış iş modellerini inceleyin ve size uygun franchise fırsatlarını keşfedin.';

export const FRANCHISE_CREATE_DESCRIPTION = 'Markanızın franchise fırsatını yayınlayın.';

export const FRANCHISE_CONTACT_CTA = 'Franchise İletişim Talebi Gönder';

export const FRANCHISE_EMPTY_TITLE = 'Henüz uygun bir franchise fırsatı bulunmuyor.';

export const FRANCHISE_EMPTY_DESCRIPTION = 'Yayınlanan franchise fırsatları burada listelenir.';

export const FRANCHISE_EMPTY_FILTERED_TITLE = 'Bu filtrelere uygun franchise fırsatı yok.';

export const FRANCHISE_EMPTY_FILTERED_DESCRIPTION =
  'Sektör, şehir veya ilçe filtresini değiştirerek tekrar deneyin.';

export const FRANCHISE_EMPTY_BACK_CTA = {
  label: 'Fırsatlara dön',
  href: '/girisim-ortaklik',
} as const;

export const FRANCHISE_CLEAR_FILTERS_LABEL = 'Filtreleri temizle';

export const FRANCHISE_DETAIL_EYEBROW = 'Franchise Fırsatı';

export const FRANCHISE_DETAIL_BACK_LABEL = 'Franchise Fırsatları';

export function isFranchiseSafePublicHref(href: string): boolean {
  return (
    !href.includes('/is')
    && !href.includes('kariyer')
    && !href.includes('/dashboard/eslesmeler')
    && !href.includes('/dashboard/ortaklik-eslesmeleri')
    && !href.includes('/api/career')
    && !href.includes('/api/partnership')
    && !href.includes('yatirim-bul')
  );
}
