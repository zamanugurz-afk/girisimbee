export const MARKET_BRAND_NAME = 'Girişimbee MARKET';

export const MARKET_HOME_SUBTITLE = 'Seçili fırsat ve işbirlikleri';

export const MARKET_HOME_CTA_LABEL = 'Tüm fırsatlar';

export const MARKET_HOME_CTA_HREF = '/market';

export const MARKET_CATALOG_TITLE = 'Güncel fırsat ve işbirlikleri';

export const MARKET_CATALOG_DESCRIPTION =
  'Yalnızca MARKET üzerinden yayınlanan seçili reklam ve iş birliği fırsatları.';

export const MARKET_EMPTY_TITLE = 'Şu anda gösterilecek fırsat bulunmuyor.';

export const MARKET_EMPTY_DESCRIPTION = 'Yayınlanan seçili fırsatlar burada listelenir.';

export const MARKET_EMPTY_BACK_CTA = {
  label: 'Ana sayfaya dön',
  href: '/',
} as const;

export const MARKET_ADVERTISE_AVAILABLE_LABEL = 'Bu alan müsait';

export const MARKET_ADVERTISE_TITLE = 'Buraya reklam verin';

export const MARKET_ADVERTISE_CTA_LABEL = 'Hemen başla';

export function isMarketSafePublicHref(href: string): boolean {
  const value = href.trim().toLowerCase();
  if (!value) return false;
  return (
    !value.includes('/invest')
    && !value.includes('yatirim-bul')
    && !value.includes('yatirim-ariyorum')
    && !value.includes('yatirim-yap')
    && !value.includes('/ilan/olustur')
    && !value.includes('/dashboard/eslesmeler')
    && !value.includes('/dashboard/ortaklik')
    && !value.includes('/api/career')
    && !value.includes('/api/partnership')
  );
}
