export const DIGITAL_SOLUTION_MATCH_PAGE_TITLE = 'Dijital Çözüm Eşleşmeleriniz';
export const DIGITAL_SOLUTION_MATCH_PAGE_DESCRIPTION =
  'İşletmenizin ölçeğine, sektörünüze ve ihtiyaçlarınıza göre sizin için öne çıkan yapay zeka ve dijital çözümleri keşfedin.';

export const DIGITAL_SOLUTION_MATCH_CONTACT_CTA = 'Çözüm Hakkında Bilgi Al';
export const DIGITAL_SOLUTION_MATCH_REVIEW_CTA = 'Çözümü İncele';
export const DIGITAL_SOLUTION_MATCH_PRIVACY_NOTE =
  'İletişim bilgileriniz korunur; talep onaylandığında güvenli iletişim başlar.';

export const DIGITAL_SOLUTION_MATCH_EMPTY_TITLE = 'Henüz size uygun bir dijital çözüm bulunamadı.';
export const DIGITAL_SOLUTION_MATCH_EMPTY_DESCRIPTION =
  'İşletme ve profil bilgilerinizi güncelledikçe daha isabetli çözümler önerebiliriz.';

export const DIGITAL_SOLUTION_MATCH_MISSING_CONTEXT_TITLE = 'Profilinizi Tamamlayın';
export const DIGITAL_SOLUTION_MATCH_MISSING_CONTEXT_DESCRIPTION =
  'Size uygun dijital çözümler bulabilmemiz için profilinizi veya şirket bilgilerinizi tamamlayın.';

export const DIGITAL_SOLUTION_MATCH_UPDATE_PROFILE_CTA = 'Profilimi Güncelle';
export const DIGITAL_SOLUTION_MATCH_VIEW_ALL_CTA = 'Tüm dijital çözümleri gör';
export const DIGITAL_SOLUTION_MATCH_VIEW_ALL_HREF = '/dijital-ai';

export function formatDigitalSolutionMatchScore(score: number): string {
  return `%${Math.round(score)} Uyum`;
}
