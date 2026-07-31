import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

/** Homepage intent gateway — labels, audience, and hints for first-visit clarity. */
export const HOME_CATEGORIES = [
  {
    slug: 'yatirim-bul',
    href: '/investors',
    label: 'Yatırım Bul',
    color: GC_CATEGORY_COLORS['yatirim-bul'],
    audience: 'Girişimciler',
    hint: 'Startup ve projeniz için yatırımcı arayın',
  },
  {
    slug: 'yatirim-yap',
    href: '/invest',
    label: 'Yatırım Yap',
    color: GC_CATEGORY_COLORS['yatirim-yap'],
    audience: 'Yatırımcılar',
    hint: 'Erken aşama fırsatları keşfedin',
  },
  {
    slug: 'is-bul',
    href: '/jobs',
    label: 'İş Bul',
    color: GC_CATEGORY_COLORS['is-bul'],
    audience: 'İş arayanlar',
    hint: 'Startup ve tech kariyer ilanları',
  },
  {
    slug: 'ise-al',
    href: '/hire',
    label: 'İşe Al',
    color: GC_CATEGORY_COLORS['ise-al'],
    audience: 'İşverenler',
    hint: 'Ekibinize yetenek bulun',
  },
  {
    slug: 'ortak-bul',
    href: '/partners',
    label: 'Ortak Bul',
    color: GC_CATEGORY_COLORS['ortak-bul'],
    audience: 'Kurucular',
    hint: 'Kurucu ortak ve iş ortaklığı',
  },
] as const;

export type HomeCategorySlug = (typeof HOME_CATEGORIES)[number]['slug'];

export const HOME_TRUST_SIGNALS = [
  { label: 'Ücretsiz kayıt' },
  { label: 'Doğrulanmış profiller' },
  { label: 'Güvenli mesajlaşma' },
] as const;

export const HOME_STEPS = [
  {
    step: '1',
    title: 'Yolunuzu seçin',
    description: 'Yatırım, kariyer veya ortaklık — size uygun kategoride ilanları inceleyin.',
  },
  {
    step: '2',
    title: 'Doğrudan iletişime geçin',
    description: 'İlan sahibiyle platform üzerinden mesajlaşın. Aracı yok, gizli ücret yok.',
  },
  {
    step: '3',
    title: 'Eşleşin ve ilerleyin',
    description: 'Doğru kişilerle buluşun; yatırım, iş veya ortaklık sürecinizi başlatın.',
  },
] as const;
