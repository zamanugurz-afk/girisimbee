export const CAREER_PROFILE_PAGE_TITLE = 'Kariyer Profilim';

export const CAREER_PROFILE_PRIVACY_NOTE = 'İletişim bilgileriniz gizli kalır.';
export const CAREER_PROFILE_PRIVACY_DETAIL =
  'İlan ve profil bilgileriniz yalnızca uygun eşleşmeler ve iletişim talepleri kapsamında gösterilir.';

export const CAREER_PROFILE_INCOMPLETE_HINT =
  'Eşleşmelerinizi güçlendirmek için profilinizi tamamlayın.';

export const CAREER_PROFILE_COMPLETE_TITLE = 'Profiliniz tamamlandı.';
export const CAREER_PROFILE_COMPLETE_HINT =
  'Artık size uygun fırsatları daha doğru şekilde eşleştirebiliriz.';

export const CAREER_PROFILE_EMPTY_TITLE = 'Kariyer profilinizi oluşturun';
export const CAREER_PROFILE_EMPTY_HINT =
  'Size uygun fırsatları keşfetmek için birkaç temel bilgi yeterli.';

export const CAREER_PROFILE_PARTIAL_TITLE = 'Profilinizi tamamlayın';

export const MATCH_PROFILE_LIMITED_HINT =
  'Daha doğru eşleşmeler için profilinizdeki eksik alanları tamamlayın.';

export const MATCH_PROFILE_PROGRESS_HINT =
  'Profilinizi tamamladıkça daha doğru eşleşmeler bulabiliriz.';

export function formatProfilePercent(percent: number): string {
  return `%${percent}`;
}

export function formatProfileCompletedLabel(percent: number): string {
  return `Profiliniz ${formatProfilePercent(percent)} tamamlandı`;
}
