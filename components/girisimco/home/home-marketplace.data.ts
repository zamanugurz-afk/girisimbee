import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

type HomeCategoryDef = {
  slug: string;
  href: string;
  label: string;
  color: string;
  audience: string;
  shortCue: string;
  hint: string;
};

/**
 * Full Ne arıyorsunuz catalog (create-flow / listings unchanged).
 * Visibility on the homepage gateway is controlled by HOME_GATEWAY_VISIBLE_SLUGS.
 */
export const HOME_CATEGORIES_CATALOG = [
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
    label: 'Kariyer ve İş Fırsatları',
    color: GC_CATEGORY_COLORS['ise-al'],
    audience: 'İşveren / iş arayan',
    shortCue: 'Pozisyon ve kariyer',
    hint: 'İş arayanlar ve işverenler için iki ayrı yol. Önce hangisi olduğunuzu seçin.',
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
] as const satisfies readonly HomeCategoryDef[];

export type HomeCategorySlug = (typeof HOME_CATEGORIES_CATALOG)[number]['slug'];

/**
 * Ne arıyorsunuz gateway — set of slugs currently shown.
 * To restore Dijital & AI: add `'dijital-ai'` back here (and grid becomes 5 cols automatically).
 * Previously: all five catalog slugs including `'dijital-ai'`.
 */
export const HOME_GATEWAY_VISIBLE_SLUGS = [
  'yatirim-bul',
  'ortak-bul',
  'franchise',
  'ise-al',
] as const satisfies readonly HomeCategorySlug[];

/** Categories intentionally deferred from the gateway (kept for easy restore). */
export const HOME_GATEWAY_DEFERRED_SLUGS = [
  'dijital-ai',
] as const satisfies readonly HomeCategorySlug[];

const VISIBLE_SET = new Set<string>(HOME_GATEWAY_VISIBLE_SLUGS);

/** Visible Ne arıyorsunuz cards (filtered catalog). */
export const HOME_CATEGORIES = HOME_CATEGORIES_CATALOG.filter((cat) =>
  VISIBLE_SET.has(cat.slug),
);

/** @deprecated Prefer HOME_CATEGORIES_CATALOG — alias kept for older imports. */
export const HOME_CATEGORIES_ALL = HOME_CATEGORIES_CATALOG;

/** /is selection landing — CTAs keep existing ?flow=seek|hire browse chips. */
export const CAREER_HUB_LANDING = {
  badge: 'Kariyer ve İş Fırsatları',
  title: 'Girişimbee\'de hangi tarafta olduğunuzu seçin',
  description: 'İş fırsatlarını keşfetmek veya doğru yeteneği bulmak için size uygun yolu seçin.',
  trust:
    'İletişim bilgileriniz gizli kalır. İlgilendiğiniz kişiyle iletişim talebi üzerinden bağlantı kurarsınız.',
} as const;

export type CareerFlowCardCopy = {
  id: 'seek' | 'hire';
  label: string;
  description: string;
  benefits: readonly { title: string; text: string }[];
  href?: string;
};

/** /is browse cards — “Bu ilanlarla ne yapabilirim?” */
export const CAREER_FLOW_OPTIONS = [
  {
    id: 'seek',
    href: '/is?flow=seek',
    label: 'İş Arıyorum',
    description:
      'İş arayan ilanını inceleyin, uygunluğu değerlendirin ve iletişim talebi gönderin.',
    benefits: [
      {
        title: 'Profilini inceleyin',
        text: 'Deneyim ve yetkinliklerini tek yerde görün.',
      },
      {
        title: 'Uygunluğu değerlendirin',
        text: 'Pozisyon ve beklentileri birlikte değerlendirin.',
      },
      {
        title: 'İletişim talebi gönderin',
        text: 'İlgilendiğiniz adayla güvenli şekilde iletişime geçin.',
      },
    ],
  },
  {
    id: 'hire',
    href: '/is?flow=hire',
    label: 'İşe Alıyorum',
    description:
      'İş ilanını inceleyin, size uygun mu bakın ve iletişim talebi gönderin.',
    benefits: [
      {
        title: 'Pozisyonu inceleyin',
        text: 'Rolü, beklentileri ve aranan yetkinlikleri görün.',
      },
      {
        title: 'Size uygun mu değerlendirin',
        text: 'Deneyiminiz ve hedeflerinizle karşılaştırın.',
      },
      {
        title: 'İletişim talebi gönderin',
        text: 'İlan sahibine doğrudan numaranızı vermeden ulaşın.',
      },
    ],
  },
] as const satisfies readonly CareerFlowCardCopy[];

export function parseCareerFlowParam(value: unknown): 'seek' | 'hire' | undefined {
  return value === 'seek' || value === 'hire' ? value : undefined;
}

export const FRANCHISE_FLOW_ROUTES = {
  /** Unified franchise listings (posted franchise ads only). */
  listings: '/franchise/buy',
  buy: '/franchise/buy',
  give: '/franchise/buy',
} as const;

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
