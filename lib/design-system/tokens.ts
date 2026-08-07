/**
 * Girisimbee Design System — Aurora Ink
 * Single source of truth for visual tokens.
 * CSS variables in app/globals.css mirror these values.
 */

/* ─── Colors (semantic) ─────────────────────────────────────────── */

export const gcColors = {
  /** Brand periwinkle indigo — primary actions, links, focus */
  primary: 'hsl(243 89% 66%)',
  /** Deep ink — body text */
  foreground: 'hsl(222 47% 11%)',
  /** Secondary text — captions, meta */
  muted: 'hsl(215 25% 27%)',
  /** Page background */
  background: 'hsl(210 40% 98%)',
  /** Elevated surfaces */
  card: 'hsl(0 0% 100%)',
  /** Dividers, input borders */
  border: 'hsl(220 22% 91%)',
  success: 'hsl(158 64% 42%)',
  warning: 'hsl(32 95% 48%)',
  danger: 'hsl(0 72% 55%)',
} as const;

/** Marketplace category accent palette */
export const gcCategoryColors = {
  'yatirim-bul': '#60A5FA',
  'yatirim-yap': '#6C63FF',
  'is-bul': '#5B5CF6',
  'ise-al': '#22C55E',
  'ortak-bul': '#F59E0B',
  franchise: '#EC4899',
  ilan: '#0EA5E9',
  'dijital-ai': '#8B5CF6',
} as const;

export type GCCategorySlug = keyof typeof gcCategoryColors;

export const GC_ACCENT = gcColors.primary;

export function getCategoryColor(slug: string): string {
  return gcCategoryColors[slug as GCCategorySlug] ?? GC_ACCENT;
}

/* ─── Typography ──────────────────────────────────────────────────── */

export const gcTypography = {
  fontFamily: {
    sans: 'var(--font-sans)',
    display: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  /** Type scale — use Tailwind classes: text-gc-xs … text-gc-3xl */
  scale: {
    xs: { size: '0.6875rem', lineHeight: '1rem', letterSpacing: '0.01em' },   // 11px
    sm: { size: '0.8125rem', lineHeight: '1.25rem', letterSpacing: '0' },      // 13px
    base: { size: '0.875rem', lineHeight: '1.375rem', letterSpacing: '0' },    // 14px
    md: { size: '0.9375rem', lineHeight: '1.5rem', letterSpacing: '-0.01em' },  // 15px
    lg: { size: '1.125rem', lineHeight: '1.75rem', letterSpacing: '-0.02em' },  // 18px
    xl: { size: '1.5rem', lineHeight: '2rem', letterSpacing: '-0.025em' },      // 24px
    '2xl': { size: '1.75rem', lineHeight: '2.25rem', letterSpacing: '-0.03em' }, // 28px
    '3xl': { size: '2rem', lineHeight: '2.5rem', letterSpacing: '-0.035em' },   // 32px
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/* ─── Border radius ───────────────────────────────────────────────── */

export const gcRadius = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',   // ~8px
  md: 'calc(var(--radius) - 2px)',   // ~10px
  lg: 'var(--radius)',               // 12px — default
  xl: 'calc(var(--radius) + 4px)',   // 16px
  '2xl': 'calc(var(--radius) + 8px)', // 20px
  full: '9999px',
} as const;

/* ─── Shadows ─────────────────────────────────────────────────────── */

export const gcShadows = {
  none: 'none',
  soft: 'var(--shadow-soft)',
  card: 'var(--shadow-card)',
  pop: 'var(--shadow-pop)',
  glow: 'var(--shadow-glow)',
} as const;

/* ─── Spacing (4px base grid) ─────────────────────────────────────── */

export const gcSpacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

/** Standard page horizontal padding */
export const gcPagePadding = 'px-5 lg:px-8';

/** Standard max content width */
export const gcPageMaxWidth = 'max-w-7xl mx-auto';

/** Header height — matches header component */
export const gcHeaderHeight = '3.75rem';

/* ─── Animation ───────────────────────────────────────────────────── */

export const gcAnimation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    reveal: '600ms',
  },
  easing: {
    smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

/* ─── Icons (Lucide) ──────────────────────────────────────────────── */

export const gcIconSize = {
  xs: 'h-3.5 w-3.5',  // 14px
  sm: 'h-4 w-4',      // 16px
  md: 'h-5 w-5',      // 20px
  lg: 'h-6 w-6',      // 24px
  xl: 'h-8 w-8',      // 32px
} as const;

export type GcIconSize = keyof typeof gcIconSize;

/* ─── Component class maps (Tailwind) ─────────────────────────────── */

/** Reusable class strings — prefer these over ad-hoc utilities */
export const gcClasses = {
  card: 'gc-card',
  cardInteractive: 'gc-card-interactive',
  glass: 'gc-glass',
  empty: 'gc-empty',
  focusRing: 'ib-focus-ring',
  pageHeading: 'gc-page-heading',
  sectionTitle: 'gc-section-title',
  sectionDesc: 'gc-section-desc',
  navLink: 'gc-nav-link',
  pageShell: 'min-h-screen bg-background',
  headerOffset: 'gc-header-offset',
} as const;
