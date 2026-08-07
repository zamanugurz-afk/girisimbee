import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

/** Homepage intent gateway — labels, audience, and hints for first-visit clarity. */
export const HOME_CATEGORIES = [
  {
    slug: 'yatirim-bul',
    href: '/invest',
    label: 'Yatırım Bul',
    color: GC_CATEGORY_COLORS['yatirim-bul'],
    audience: 'Girişimciler',
    hint: 'Yatırım tutarı, aşama ve kullanım alanıyla ilan yayınlayın veya keşfedin.',
  },
  {
    slug: 'ortak-bul',
    href: '/partners',
    label: 'Ortak Bul',
    color: GC_CATEGORY_COLORS['ortak-bul'],
    audience: 'Kurucular',
    hint: 'Uzmanlık ve taahhüt beklentisiyle ortaklık ilanlarını inceleyin.',
  },
  {
    slug: 'franchise',
    href: '/franchise/buy',
    label: 'Franchise',
    color: GC_CATEGORY_COLORS.franchise,
    audience: 'Franchise fırsatları',
    hint: 'Marka, yatırım ve lokasyon bilgisiyle franchise ilanlarını keşfedin.',
  },
  {
    slug: 'ise-al',
    href: '/hire',
    label: 'İş İlanları',
    color: GC_CATEGORY_COLORS['ise-al'],
    audience: 'Açık pozisyonlar',
    hint: 'Pozisyon özeti ve maaş aralığıyla iş ilanlarını inceleyin; telefon ile arayın.',
  },
  {
    slug: 'dijital-ai',
    href: '/dijital-ai',
    label: 'Dijital ve AI Çözümleri',
    color: GC_CATEGORY_COLORS['dijital-ai'],
    audience: 'Ürün & yetenekler',
    hint: 'Ürün adı, kısa tanıtım ve yetenek kartlarıyla AI / yazılım çözümlerini inceleyin.',
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
    description: 'Yatırım, iş ilanı veya ortaklık — size uygun kategoride ilanları inceleyin.',
  },
  {
    step: '2',
    title: 'Doğrudan arayın',
    description: 'İlan sahibinin telefonunu arayın. Platform üzerinden mesajlaşma yoktur.',
  },
  {
    step: '3',
    title: 'Eşleşin ve ilerleyin',
    description: 'Doğru kişilerle buluşun; yatırım, iş veya ortaklık sürecinizi başlatın.',
  },
] as const;
