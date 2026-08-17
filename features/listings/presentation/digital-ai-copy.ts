export const DIGITAL_AI_BRAND_NAME = 'Dijital & AI Çözümleri';

export const DIGITAL_AI_BROWSE_TITLE = 'Dijital & AI Çözümleri';

export const DIGITAL_AI_BROWSE_DESCRIPTION =
  'İşletmeniz için ihtiyaç duyduğunuz dijital ürünleri, yazılım çözümlerini ve yapay zeka uygulamalarını keşfedin.';

export const DIGITAL_AI_BROWSE_EYEBROW = 'Çözümler';

export const DIGITAL_AI_SEO_TITLE = 'Dijital & AI Çözümleri | Girisimbee';

export const DIGITAL_AI_SEO_DESCRIPTION =
  'İşletmeniz için dijital ürün, yazılım ve yapay zeka çözümlerini keşfedin.';

export const DIGITAL_AI_CONTACT_CTA = 'Çözüm Hakkında Bilgi Al';

export const DIGITAL_AI_EMPTY_TITLE = 'Şu anda gösterilecek bir çözüm bulunmuyor.';

export const DIGITAL_AI_EMPTY_DESCRIPTION = 'Yayınlanan dijital ve yapay zeka çözümleri burada listelenir.';

export const DIGITAL_AI_EMPTY_BACK_CTA = {
  label: 'Ana sayfaya dön',
  href: '/',
} as const;

export const DIGITAL_AI_HOME_SECTION_TITLE = 'Çözümler';

export const DIGITAL_AI_HOME_CTA_LABEL = 'Tüm çözümleri gör';

export const DIGITAL_AI_HOME_CTA_HREF = '/dijital-ai';

export const DIGITAL_AI_RESULT_NOUN = 'çözüm';

export function isDigitalAiSafePublicHref(href: string): boolean {
  const value = href.trim().toLowerCase();
  if (!value) return false;
  const blocked = [
    '/market',
    '/invest',
    '/ilan/olustur',
    '/dashboard/eslesmeler',
    '/dashboard/ortaklik',
    '/api/career',
    '/api/partnership',
    '/franchise',
    '/partners',
    '/girisim-ortaklik',
  ];
  if (blocked.some((path) => value === path || value.startsWith(`${path}/`) || value.startsWith(`${path}?`))) {
    return false;
  }
  if (value === '/is' || value.startsWith('/is/') || value.startsWith('/is?')) return false;
  return !value.includes('yatirim-ariyorum') && !value.includes('yatirim-bul');
}
