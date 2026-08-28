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
    label: 'Dijital ve AI Çözümleri',
    color: GC_CATEGORY_COLORS['dijital-ai'],
    audience: 'Ürün ve yetenekler',
    shortCue: 'Ürün ve çözümler',
    hint: 'Ürün adı, kısa tanıtım ve yetenek kartlarıyla AI / yazılım çözümlerini inceleyin.',
  },
  {
    slug: 'girisim-ortaklik',
    href: '/girisim-ortaklik',
    label: 'Ortaklık ve Devir',
    color: GC_CATEGORY_COLORS['ortak-bul'],
    audience: 'Kurucular / ortaklar',
    shortCue: 'Ortaklık ve işletme devri',
    hint: 'Ortaklık ve işletme devri fırsatlarını keşfedin veya kendi fırsatınızı yayınlayın.',
  },
] as const satisfies readonly HomeCategoryDef[];

export type HomeCategorySlug = (typeof HOME_CATEGORIES_CATALOG)[number]['slug'];

/**
 * Ne arıyorsunuz gateway — homepage discovery only.
 * Catalog rows stay intact (ortak-bul, franchise, dijital-ai).
 */
export const HOME_GATEWAY_VISIBLE_SLUGS = [
  'ise-al',
  'girisim-ortaklik',
] as const satisfies readonly HomeCategorySlug[];

/** Hidden from homepage gateway / primary nav — infrastructure kept. */
export const HOME_GATEWAY_DEFERRED_SLUGS = [
  'ortak-bul',
  'franchise',
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
  title: 'Kariyer ve İş Fırsatları',
  description: 'İş ilanlarını keşfedin veya aday profillerini inceleyin.',
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

/**
 * /is browse cards — viewer intent.
 * İş Arıyorum → job ads (`flow=hire`).
 * İşe Alıyorum → candidate profiles (`flow=seek`).
 * Card ids stay seek/hire so create-listing visuals stay aligned.
 */
export const CAREER_FLOW_OPTIONS = [
  {
    id: 'seek',
    href: '/is?flow=seek',
    label: 'İş Arıyorum',
    description:
      'Yayındaki iş ilanlarını inceleyin, deneyiminize uygun olanı seçin ve iletişim talebiyle ilerleyin.',
    benefits: [
      {
        title: 'Fırsatları keşfedin',
        text: 'Açık pozisyonları ve kariyer beklentilerini görün.',
      },
      {
        title: 'Size uygun mu bakın',
        text: 'Deneyiminiz ve hedeflerinizle karşılaştırın.',
      },
      {
        title: 'Güvenli iletişim kurun',
        text: 'İlan sahibiyle iletişim talebi üzerinden bağlantı kurun.',
      },
    ],
  },
  {
    id: 'hire',
    href: '/is?flow=hire',
    label: 'İşe Alıyorum',
    description:
      'Aday profillerini inceleyin, aradığınız rolle eşleştirin ve iletişim talebi üzerinden bağlanın.',
    benefits: [
      {
        title: 'Adayları inceleyin',
        text: 'Deneyim ve yetkinliklerini tek yerde görün.',
      },
      {
        title: 'Pozisyona uygunluğu değerlendirin',
        text: 'Aradığınız rolle birlikte bakın.',
      },
      {
        title: 'Güvenli iletişim kurun',
        text: 'Adayla iletişim talebi üzerinden bağlantı kurun.',
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

/** Homepage second-level hub — existing /partners and /franchise/buy routes only. */
export const VENTURE_PARTNERSHIP_HUB = {
  badge: 'Ortaklık ve Devir',
  title: 'Ortaklık ve Devir',
  description: 'Ortaklık ve işletme devri fırsatlarını keşfedin veya kendi fırsatınızı yayınlayın.',
  href: '/girisim-ortaklik',
} as const;

export const VENTURE_PARTNERSHIP_OPTIONS = [
  {
    id: 'ortak-ariyorum',
    href: '/partners',
    label: 'Ortaklık',
    description: 'Girişiminiz için aradığınız yetkin kurucu veya iş ortağını bulun.',
    color: GC_CATEGORY_COLORS['ortak-bul'],
    benefits: [
      {
        title: 'İhtiyacınızı netleştirin',
        text: 'Aradığınız uzmanlığı ve ortaklık beklentisini görün.',
      },
      {
        title: 'Uygun ortakları inceleyin',
        text: 'Yetkinlik ve taahhüt profillerini karşılaştırın.',
      },
      {
        title: 'Güvenli iletişim kurun',
        text: 'İletişim talebi üzerinden doğrudan bağlantı kurun.',
      },
    ],
  },
  {
    id: 'isletme-devri',
    href: '/isletme-devri',
    label: 'İşletme Devri',
    description: 'Faal işletme devri fırsatlarını keşfedin.',
    color: GC_CATEGORY_COLORS['isletme-devri'],
    benefits: [
      {
        title: 'Devir fırsatlarını keşfedin',
        text: 'Kafe, restoran, e-ticaret ve faal şirketleri inceleyin.',
      },
      {
        title: 'Detayları karşılaştırın',
        text: 'Lokasyon, ciro ve devir şartlarını görün.',
      },
      {
        title: 'Güvenli iletişim kurun',
        text: 'İletişim talebi üzerinden doğrudan bağlantı kurun.',
      },
    ],
  },
] as const;

/** Preserved in codebase for future modular re-activation */
export const ARCHIVED_VENTURE_PARTNERSHIP_JOINING_OPTION = {
  id: 'ortak-olmak',
  href: '/partners?intent=joining',
  label: 'Ortak Olmak İstiyorum',
  description: 'Uzmanlığınızı sunun, size uygun girişimlerle buluşun.',
  color: GC_CATEGORY_COLORS['ortak-bul'],
  benefits: [
    {
      title: 'Profilleri keşfedin',
      text: 'Girişimlerin ne aradığını tek yerde görün.',
    },
    {
      title: 'Size uygun mu bakın',
      text: 'Uzmanlığınızı ve hedeflerinizi karşılaştırın.',
    },
    {
      title: 'Güvenli iletişim kurun',
      text: 'İletişim talebi üzerinden bağlantı kurun.',
    },
  ],
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
    description: 'İş, ortaklık veya franchise — size uygun kategoride ilanları inceleyin.',
  },
  {
    step: '2',
    title: 'Doğrudan arayın',
    description: 'İlan sahibinin telefonunu arayın. Platform üzerinden mesajlaşma yoktur.',
  },
  {
    step: '3',
    title: 'Eşleşin ve ilerleyin',
    description: 'Doğru kişilerle buluşun; iş, ortaklık veya franchise sürecinizi başlatın.',
  },
] as const;
