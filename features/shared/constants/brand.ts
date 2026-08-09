export const BRAND_NAME = 'Girisimbee';

/**
 * Bee brand mark (logo glyph + wordmark icon).
 * Set to `false` to restore the plain “G” mark / wordmark — no other files needed.
 */
export const BRAND_BEE_ACCENT = true;

export const BRAND_TAGLINE = 'Doğru kişilerle, doğru fırsatta buluşun.';

export const BRAND_TAGLINE_HIGHLIGHT = 'doğru fırsatta';

export const BRAND_PAGE_TITLE = `${BRAND_NAME} — ${BRAND_TAGLINE}`;

export const BRAND_COLORS = {
  primary: '#5B5CF6',
  secondary: '#6C63FF',
  dark: '#0F172A',
  text: '#334155',
  blue: '#60A5FA',
  green: '#22C55E',
  orange: '#F59E0B',
  background: '#F8FAFC',
} as const;
