import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

/** Homepage intent gateway — labels, audience, and hints for first-visit clarity. */
export const HOME_CATEGORIES = [
  {
    slug: 'yatirim-bul',
    href: '/invest',
    label: 'Yatırım Bul',
    color: GC_CATEGORY_COLORS['yatirim-bul'],
    audience: 'Girişimciler',
    hint: 'Fikirlerinizi büyütecek yatırım fırsatlarını keşfedin.',
  },
  {
    slug: 'ortak-bul',
    href: '/partners',
    label: 'Ortak Bul',
    color: GC_CATEGORY_COLORS['ortak-bul'],
    audience: 'Kurucular',
    hint: 'Hedeflerinize ulaşmak için doğru iş ortaklarıyla tanışın.',
  },
  {
    slug: 'franchise',
    href: '/franchise/buy',
    label: 'Franchise',
    color: GC_CATEGORY_COLORS.franchise,
    audience: 'Franchise fırsatları',
    hint: 'Yayınlanan franchise ilanlarını keşfedin.',
  },
  {
    slug: 'is-bul',
    href: '/jobs',
    label: 'İş Bul',
    color: GC_CATEGORY_COLORS['is-bul'],
    audience: 'İş arayanlar',
    hint: 'Kariyer yolculuğunuz için doğru fırsatları keşfedin.',
  },
  {
    slug: 'ise-al',
    href: '/hire',
    label: 'İşe Al',
    color: GC_CATEGORY_COLORS['ise-al'],
    audience: 'İşverenler',
    hint: 'Ekibinizi güçlendirecek yeteneklerle tanışın.',
  },
] as const;

export const FRANCHISE_FLOW_ROUTES = {
  /** Unified franchise listings (posted franchise ads only). */
  listings: '/franchise/buy',
  buy: '/franchise/buy',
  give: '/franchise/buy',
} as const;

export type HomeCategorySlug = (typeof HOME_CATEGORIES)[number]['slug'];

export const HOME_TRUST_SIGNALS = [
  { label: 'Ücretsiz kayıt' },
  { label: 'Doğrulanmış telefon' },
  { label: 'Doğrudan arama' },
] as const;

export const HOME_STEPS = [
  {
    step: '1',
    title: 'Yolunuzu seçin',
    description: 'Yatırım, kariyer veya ortaklık — size uygun kategoride ilanları inceleyin.',
  },
  {
    step: '2',
    title: 'Doğrudan arayın',
    description: 'İlan sahibinin doğrulanmış telefonunu arayın. Platform üzerinden mesajlaşma yoktur.',
  },
  {
    step: '3',
    title: 'Eşleşin ve ilerleyin',
    description: 'Doğru kişilerle buluşun; yatırım, iş veya ortaklık sürecinizi başlatın.',
  },
] as const;
