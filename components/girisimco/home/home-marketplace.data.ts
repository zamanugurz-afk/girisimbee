import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

/** Homepage intent gateway — labels, audience, and hints for first-visit clarity. */
export const HOME_CATEGORIES = [
  {
    slug: 'yatirim-bul',
    href: '/invest',
    label: 'Yatırım Arıyorum',
    color: GC_CATEGORY_COLORS['yatirim-bul'],
    audience: 'Girişimciler',
    shortCue: 'Tur, tutar ve aşama',
    hint: 'Yatırım tutarı, aşama ve kullanım alanıyla ilan yayınlayın veya keşfedin.',
  },
  {
    slug: 'ortak-bul',
    href: '/partners',
    label: 'Ortak Arıyorum',
    color: GC_CATEGORY_COLORS['ortak-bul'],
    audience: 'Kurucular',
    shortCue: 'Kurucu veya iş ortağı',
    hint: 'Uzmanlık ve taahhüt beklentisiyle ortaklık ilanlarını inceleyin.',
  },
  {
    slug: 'franchise',
    href: '/franchise/buy',
    label: 'Franchise İlanları',
    color: GC_CATEGORY_COLORS.franchise,
    audience: 'Franchise fırsatları',
    shortCue: 'Marka ve şube hakkı',
    hint: 'Marka, yatırım ve lokasyon bilgisiyle franchise ilanlarını keşfedin.',
  },
  {
    slug: 'ise-al',
    href: '/is',
    label: 'İş İlanları',
    color: GC_CATEGORY_COLORS['ise-al'],
    audience: 'İşe al / iş ara',
    shortCue: 'Pozisyon veya kariyer',
    hint: 'İşe Alıyorum veya anonim İş Arıyorum kariyer özeti — hub üzerinden seçin.',
  },
  {
    slug: 'dijital-ai',
    href: '/dijital-ai',
    label: 'Dijital & AI Çözümleri',
    color: GC_CATEGORY_COLORS['dijital-ai'],
    audience: 'Ürün & yetenekler',
    shortCue: 'Ürün ve çözümler',
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
