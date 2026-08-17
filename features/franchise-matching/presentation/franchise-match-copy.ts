export const FRANCHISE_MATCH_PAGE_TITLE = 'Franchise Fırsatı Eşleşmeleriniz';
export const FRANCHISE_MATCH_PAGE_DESCRIPTION =
  'Bütçenize, sektör tercihlerinize ve lokasyonunuza göre sizin için öne çıkan franchise ve bayilik fırsatlarını keşfedin.';

export const FRANCHISE_MATCH_CONTACT_CTA = 'Franchise İletişim Talebi Gönder';
export const FRANCHISE_MATCH_REVIEW_CTA = 'Franchise Fırsatını İncele';
export const FRANCHISE_MATCH_PRIVACY_NOTE =
  'İletişim bilgileriniz korunur; talep onaylandığında güvenli iletişim başlar.';

export const FRANCHISE_MATCH_EMPTY_TITLE = 'Henüz size uygun bir franchise fırsatı bulunamadı.';
export const FRANCHISE_MATCH_EMPTY_DESCRIPTION =
  'Yatırım bütçenizi ve lokasyon tercihlerinizi güncelledikçe daha isabetli fırsatlar önerebiliriz.';

export const FRANCHISE_MATCH_VIEW_ALL_CTA = 'Tüm franchise fırsatlarını gör';
export const FRANCHISE_MATCH_VIEW_ALL_HREF = '/franchise/buy';

export function formatFranchiseMatchScore(score: number): string {
  return `%${Math.round(score)} Uyum`;
}
