/**
 * Default listing card covers when the listing has no uploaded images.
 * Static photos per listing type / career theme (no runtime AI cost).
 * Theme is resolved from role family + sector; AI only fills leftover titles.
 */
import type { RoleFamily } from '@/features/candidates/taxonomy/career-position-catalog';
import { resolveRoleFamily } from '@/features/candidates/taxonomy/career-position-catalog';
import type { ListingCardGroup } from '@/features/listings/utils/listing-card-display';

const COVER_BY_TYPE_SLUG: Record<string, string> = {
  'yatirim-ariyorum': '/covers/yatirim-ariyorum.jpg',
  'yatirim-yapiyorum': '/covers/yatirim-yapiyorum.jpg',
  'is-ariyorum': '/covers/is-ariyorum.jpg',
  'ise-aliyorum': '/covers/ise-aliyorum.jpg',
  'ortak-ariyorum': '/covers/ortak-ariyorum.jpg',
  'franchise-ilan-ver': '/covers/franchise.jpg',
  'bayilik-al': '/covers/franchise.jpg',
  'bayilik-ver': '/covers/franchise.jpg',
};

const COVER_BY_GROUP: Record<ListingCardGroup, string> = {
  yatirim: '/covers/yatirim-ariyorum.jpg',
  is: '/covers/ise-aliyorum.jpg',
  ortaklik: '/covers/ortak-ariyorum.jpg',
  franchise: '/covers/franchise.jpg',
  genel: '/covers/default.jpg',
  dijital: '/covers/default.jpg',
  'isletme-devri': '/covers/default.jpg',
};

export const DEFAULT_LISTING_COVER = '/covers/default.jpg';

export type CareerCoverTheme =
  | 'sigorta'
  | 'saglik'
  | 'yazilim'
  | 'satis'
  | 'finans'
  | 'egitim'
  | 'uretim'
  | 'turizm'
  | 'genel';

export type CareerCoverGender = 'erkek' | 'kadin';

const CAREER_SCENE_COVER_BY_THEME: Record<CareerCoverTheme, string> = {
  sigorta: '/covers/career-finans.jpg',
  saglik: '/covers/career-saglik.jpg',
  yazilim: '/covers/career-yazilim.jpg',
  satis: '/covers/career-satis.jpg',
  finans: '/covers/career-finans.jpg',
  egitim: '/covers/career-egitim.jpg',
  uretim: '/covers/career-uretim.jpg',
  turizm: '/covers/career-turizm.jpg',
  genel: '/covers/is-ariyorum.jpg',
};

const CAREER_PERSON_COVERS: Record<CareerCoverGender, Partial<Record<CareerCoverTheme, string>>> = {
  erkek: {
    sigorta: '/covers/career-erkek-sigorta.jpg',
    saglik: '/covers/career-erkek-saglik.jpg',
    yazilim: '/covers/career-erkek-yazilim.jpg',
    satis: '/covers/career-erkek-satis.jpg',
    finans: '/covers/career-erkek-finans.jpg',
    egitim: '/covers/career-erkek-egitim.jpg',
    genel: '/covers/career-erkek-genel.jpg',
  },
  kadin: {
    sigorta: '/covers/career-kadin-sigorta.jpg',
    saglik: '/covers/career-kadin-saglik.jpg',
    yazilim: '/covers/career-kadin-yazilim.jpg',
    satis: '/covers/career-kadin-satis.jpg',
    finans: '/covers/career-kadin-finans.jpg',
    egitim: '/covers/career-kadin-egitim.jpg',
    genel: '/covers/career-kadin-genel.jpg',
  },
};

/** Occupation-specific families. Cross-sector managers use the sector instead. */
const FAMILY_COVER_THEME: Partial<Record<RoleFamily, CareerCoverTheme>> = {
  factory: 'uretim',
  shiftSupervisor: 'uretim',
  productionLead: 'uretim',
  construction: 'uretim',
  siteChief: 'uretim',
  energy: 'uretim',
  farm: 'uretim',
  farmLead: 'uretim',
  logistics: 'uretim',
  warehouseLead: 'uretim',
  driver: 'uretim',
  reception: 'turizm',
  host: 'turizm',
  housekeeping: 'turizm',
  hotelOps: 'turizm',
  restaurant: 'turizm',
  kitchen: 'turizm',
  restaurantManager: 'turizm',
  kitchenChef: 'turizm',
  software: 'yazilim',
  techLead: 'yazilim',
  data: 'yazilim',
  product: 'yazilim',
  design: 'yazilim',
  devops: 'yazilim',
  qa: 'yazilim',
  teacher: 'egitim',
  schoolPrincipal: 'egitim',
  insuranceOps: 'sigorta',
  bankFront: 'finans',
  branchManager: 'finans',
  portfolioManager: 'finans',
  credit: 'finans',
  accounting: 'finans',
  retail: 'satis',
  cashier: 'satis',
  storeManager: 'satis',
  salesIndoor: 'satis',
  salesField: 'satis',
  marketing: 'satis',
  brandManager: 'satis',
  beauty: 'satis',
  autoService: 'uretim',
  serviceManager: 'uretim',
  callCenter: 'genel',
  customerSuccess: 'genel',
};

const SECTOR_COVER_THEME: Record<string, CareerCoverTheme> = {
  'Bilişim / Yazılım': 'yazilim',
  'Yapay zeka / Veri': 'yazilim',
  'Ar-Ge': 'yazilim',
  'Oyun / E-spor': 'yazilim',
  'Telekomünikasyon': 'yazilim',
  'Finans / Bankacılık': 'finans',
  'Muhasebe / Mali müşavirlik': 'finans',
  'Holding / Yönetim': 'finans',
  Sigorta: 'sigorta',
  Satış: 'satis',
  'Pazarlama / Reklam': 'satis',
  'Halkla ilişkiler': 'satis',
  'E-ticaret / Pazaryeri': 'satis',
  'Perakende / Mağaza': 'satis',
  'Güzellik / Kişisel bakım': 'satis',
  Eğitim: 'egitim',
  'Kreş / Çocuk bakımı': 'egitim',
  'Spor / Fitness': 'egitim',
  Sağlık: 'saglik',
  'Eczane / İlaç': 'saglik',
  'Veteriner / Pet': 'saglik',
  'Sosyal hizmet / STK': 'saglik',
  'Turizm / Otelcilik': 'turizm',
  'Gıda / Restoran': 'turizm',
  Havacılık: 'turizm',
  'Üretim / Sanayi': 'uretim',
  'Tekstil / Hazır giyim': 'uretim',
  Otomotiv: 'uretim',
  'Elektrik-elektronik': 'uretim',
  'Demir-çelik / Metal': 'uretim',
  'Kimya / Plastik': 'uretim',
  'Kağıt / Ambalaj': 'uretim',
  Mobilya: 'uretim',
  'İnşaat / Gayrimenkul': 'uretim',
  'İklimlendirme / Tesisat': 'uretim',
  'Lojistik / Depolama': 'uretim',
  'Kargo / Kurye': 'uretim',
  'Ulaşım / Şoförlük': 'uretim',
  'Denizcilik / Liman': 'uretim',
  Enerji: 'uretim',
  Tarım: 'uretim',
  'Çevre / Geri dönüşüm': 'uretim',
  'Mühendislik / Teknik': 'uretim',
  'Savunma sanayi': 'uretim',
  Madencilik: 'uretim',
};

/**
 * Title overrides reviewed with OpenAI against the available cover set.
 * Used when family + sector would otherwise pick a mismatched scene.
 */
const COVER_THEME_BY_TITLE: Record<string, CareerCoverTheme> = {
  'İş sağlığı ve güvenliği uzmanı': 'uretim',
  'Gıda mühendisi': 'uretim',
  'Kalite kontrol uzmanı': 'uretim',
  'Üretim planlama uzmanı': 'uretim',
  'Bakım teknisyeni': 'uretim',
  'Servis danışmanı': 'genel',
  Doktor: 'saglik',
  Hemşire: 'saglik',
  Ebe: 'saglik',
  'Sağlık teknikeri': 'saglik',
  Fizyoterapist: 'saglik',
  'Hasta bakıcı': 'saglik',
  'Ambulans görevlisi': 'saglik',
  'Klinik sorumlusu': 'saglik',
  'Hastane yöneticisi': 'saglik',
  'Eczane teknisyeni': 'saglik',
  'Diş teknisyeni': 'saglik',
  'Laboratuvar teknikeri': 'saglik',
  'Veteriner teknisyeni': 'saglik',
  'Hasta kabul görevlisi': 'saglik',
};

export function resolveCareerCoverRole(
  desiredRole?: string | null,
  desiredRoleOther?: string | null,
): string | null {
  const role = (desiredRole ?? '').trim();
  const other = (desiredRoleOther ?? '').trim();
  if (role === 'Diğer' || role === 'Diğer / Kendim gireceğim') {
    return other || role;
  }
  return role || other || null;
}

export function resolveCareerCoverGender(value?: string | null): CareerCoverGender | null {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('tr-TR');
  if (normalized === 'erkek') return 'erkek';
  if (normalized === 'kadın' || normalized === 'kadin') return 'kadin';
  return null;
}

export function resolveCareerCoverTheme(
  sector?: string | null,
  role?: string | null,
): CareerCoverTheme {
  const trimmedRole = (role ?? '').trim();
  const trimmedSector = (sector ?? '').trim();
  const hay = `${trimmedSector} ${trimmedRole}`.toLocaleLowerCase('tr-TR');

  if (/iş sağlığı|iş güvenliği|\bisg\b|occupational health/.test(hay)) return 'uretim';
  if (/servis danışman/.test(hay)) return 'genel';

  const titled = COVER_THEME_BY_TITLE[trimmedRole];
  if (titled) return titled;

  if (/sigorta|poliçe|hasar|broker|underwriter|segem/.test(hay)) return 'sigorta';
  if (
    /hemşire|doktor|klinik|hasta|medikal|eczane|fizyo|ambulans|veteriner/.test(hay)
    || /(^|[^a-zığüşöç])ebe([^a-zığüşöç]|$)/.test(hay)
  ) {
    return 'saglik';
  }
  if (/yazılım|geliştirici|devops|frontend|backend|full-stack|yapay zeka|data engineer|sistem yöneticisi|prompt/.test(hay)) {
    return 'yazilim';
  }
  if (/öğretmen|akademisyen|eğitmen|okul müdür/.test(hay)) return 'egitim';
  if (/kredi uzman|bankacı|mali müşavir|muhasebeci|hazine uzman|iç kontrol|uyum \(compliance\)/.test(hay)) {
    return 'finans';
  }
  if (/resepsiyon|ön büro|hostes|otel müdür|garson|aşçı|şef \/ mutfak|barista|animatör|kat görev|komi/.test(hay)) {
    return 'turizm';
  }
  if (/fabrika|kaynakçı|çelik işç|torna|forklift|şantiye|kalite kontrol|bakım teknisyen|üretim işç|makine operatör/.test(hay)) {
    return 'uretim';
  }
  if (/şoför|kurye|ziraat|çiftçi/.test(hay)) return 'uretim';
  if (/kasiyer|mağaza müdür|satış danışman|gayrimenkul danışman|key account/.test(hay)) {
    return 'satis';
  }

  const family = resolveRoleFamily(trimmedRole);
  if (family) {
    const fromFamily = FAMILY_COVER_THEME[family];
    if (fromFamily) return fromFamily;
  }

  return SECTOR_COVER_THEME[trimmedSector] ?? 'genel';
}

function resolveCareerCoverPath(opts: {
  sector?: string | null;
  role?: string | null;
  gender?: string | null;
}): string {
  const theme = resolveCareerCoverTheme(opts.sector, opts.role);
  const gender = resolveCareerCoverGender(opts.gender);
  if (gender) {
    const person = CAREER_PERSON_COVERS[gender][theme];
    if (person) return person;
    // Factory / hotel / etc. have no gendered portrait — keep the matching scene.
    if (theme !== 'genel') return CAREER_SCENE_COVER_BY_THEME[theme];
    return CAREER_PERSON_COVERS[gender].genel ?? CAREER_SCENE_COVER_BY_THEME.genel;
  }
  return CAREER_SCENE_COVER_BY_THEME[theme];
}

const PRODUCT_COVER_TYPE_SLUGS = new Set([
  'yatirim-ariyorum',
  'yatirim-yapiyorum',
  'ortak-ariyorum',
]);

/** Sector from investment (`sector`) or career (`primarySector`) custom fields. */
export function resolveCoverSectorHint(input: {
  customFields?: Record<string, unknown> | null;
  industry?: string | null;
}): string | null {
  const cf = input.customFields ?? {};
  for (const value of [cf.sector, cf.primarySector, input.industry]) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

/** Map startup/investor sector labels onto existing scene covers. */
export function resolveProductCoverTheme(sector?: string | null): CareerCoverTheme | null {
  const hay = (sector ?? '').toLocaleLowerCase('tr-TR');
  if (!hay.trim()) return null;
  if (/saas|yazılım|yazilim|yapay zeka|mobil uygulama|siber|oyun/.test(hay)) return 'yazilim';
  if (/fintech|finans/.test(hay)) return 'finans';
  if (/sağlık|saglik|health/.test(hay)) return 'saglik';
  if (/eğitim|egitim|edtech/.test(hay)) return 'egitim';
  if (/e-ticaret|eticaret|perakende|medya|marketplace|pazar/.test(hay)) return 'satis';
  if (/lojistik|enerji|tarım|tarim|gıda|gida|iklim|proptech|üretim|uretim/.test(hay)) return 'uretim';
  return null;
}

function resolveProductSceneCover(
  listingTypeSlug?: string | null,
  sector?: string | null,
): string | null {
  if (!listingTypeSlug || !PRODUCT_COVER_TYPE_SLUGS.has(listingTypeSlug)) return null;
  const theme = resolveProductCoverTheme(sector);
  return theme ? CAREER_SCENE_COVER_BY_THEME[theme] : null;
}

/** Resolve fallback cover from listing type slug or card group. */
export function resolveDefaultListingCover(opts: {
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
  sector?: string | null;
  role?: string | null;
  gender?: string | null;
}): string {
  if (opts.listingTypeSlug === 'is-ariyorum' || opts.listingTypeSlug === 'is-bul') {
    return resolveCareerCoverPath(opts);
  }
  if (opts.listingTypeSlug === 'ise-aliyorum' || opts.listingTypeSlug === 'ise-al') {
    return resolveCareerCoverPath({ ...opts, gender: null });
  }
  const productCover = resolveProductSceneCover(opts.listingTypeSlug, opts.sector);
  if (productCover) return productCover;
  if (opts.listingTypeSlug && COVER_BY_TYPE_SLUG[opts.listingTypeSlug]) {
    return COVER_BY_TYPE_SLUG[opts.listingTypeSlug];
  }
  if (opts.group && COVER_BY_GROUP[opts.group]) {
    return COVER_BY_GROUP[opts.group];
  }
  return DEFAULT_LISTING_COVER;
}

/** Prefer uploaded cover; otherwise category/type/profession/keyword smart cover. */
export function resolveSmartListingCover(opts: {
  uploadedUrl?: string | null;
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
  title?: string | null;
  sector?: string | null;
  industry?: string | null;
  businessType?: string | null;
  businessName?: string | null;
  companyName?: string | null;
  franchiseModel?: string | null;
  role?: string | null;
  gender?: string | null;
  description?: string | null;
}): string {
  const uploaded = opts.uploadedUrl?.trim();
  if (uploaded) return uploaded;

  // Career seeker & hiring listings use precise gender/role/sector mapping
  if (
    opts.listingTypeSlug === 'is-ariyorum' ||
    opts.listingTypeSlug === 'is-bul' ||
    opts.listingTypeSlug === 'ise-aliyorum' ||
    opts.listingTypeSlug === 'ise-al' ||
    opts.gender
  ) {
    return resolveDefaultListingCover(opts);
  }

  const hay = [
    opts.title,
    opts.sector,
    opts.industry,
    opts.businessType,
    opts.businessName,
    opts.companyName,
    opts.franchiseModel,
    opts.role,
    opts.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('tr-TR');

  // Food / Cafe / Restaurant / Tourism / Hospitality
  if (/kafe|cafe|kahve|restoran|restaurant|lokanta|fırın|firin|pastane|bar|pub|bistro|kokteyl|döner|doner|pizza|burger|tatlı|tatli|otel|hotel|pansiyon|turizm|catering|meyhane|nargile|ocakbaşı/.test(hay)) {
    return '/covers/career-turizm.jpg';
  }

  // Software / Tech / SaaS / AI / Digital / E-Commerce IT
  if (/yazılım|yazilim|saas|yapay zeka|\bai\b|mobil uygulama|fintech|siber|cyber|bulut|cloud|web|kodlama|yazılımcı|developer|b2b saas|platform|yazılım şirketi/.test(hay)) {
    return '/covers/career-yazilim.jpg';
  }

  // Retail / Store / Shop / E-Commerce / Boutique / Sales / Fashion
  if (/mağaza|magaza|butik|e-ticaret|eticaret|pazaryeri|marketplace|perakende|tekstil|giyim|ayakkabı|kozmetik|kırtasiye|optik|parfümeri|züccaciye|mobilya|aksesuar|avm/.test(hay)) {
    return '/covers/career-satis.jpg';
  }

  // Production / Manufacturing / Industry / Logistics / Auto / Construction / Agriculture
  if (/üretim|uretim|imalat|sanayi|fabrika|atölye|atolye|depo|lojistik|nakliye|kargo|taşımacılık|tasimacilik|oto|oto yıkama|servis|tamir|inşaat|insaat|şantiye|tarım|tarim|çiftlik|ciftlik|hayvancılık|enerji|güneş enerji/.test(hay)) {
    return '/covers/career-uretim.jpg';
  }

  // Health / Medical / Beauty / Clinic / Pharmacy / Fitness / Sports
  if (/klinik|eczane|medikal|sağlık|saglik|güzellik|guzellik|kuaför|kuafor|berber|spa|masaj|estetik|diş|dis|veteriner|spor|fitness|pilates|gym|diyetisyen/.test(hay)) {
    return '/covers/career-saglik.jpg';
  }

  // Education / Academy / School / Kindergarten / Coaching
  if (/kurs|akademi|okul|kreş|kres|anaokulu|eğitim|egitim|etüt|etut|öğrenci|ogrenci|dershane|dil kursu|sürücü kursu|surucu kursu|koçluk/.test(hay)) {
    return '/covers/career-egitim.jpg';
  }

  // Finance / Accounting / Consulting / Insurance / Real Estate
  if (/muhasebe|mali müşavir|mali musavir|danışmanlık|danismanlik|sigorta|finans|yatırım|yatirim|gayrimenkul|emlak|ofis|ajans|hukuk|avukat/.test(hay)) {
    return '/covers/career-finans.jpg';
  }

  // Franchise & Bayilik specific fallback
  if (opts.group === 'franchise' || opts.listingTypeSlug?.includes('franchise') || opts.listingTypeSlug?.includes('bayilik')) {
    return '/covers/franchise.jpg';
  }

  // Partnership specific fallback
  if (opts.group === 'ortaklik' || opts.listingTypeSlug?.includes('ortak')) {
    return '/covers/ortak-ariyorum.jpg';
  }

  return resolveDefaultListingCover(opts);
}

/** Prefer uploaded cover; otherwise category/type/profession standard cover. */
export function resolveListingCoverUrl(opts: {
  uploadedUrl?: string | null;
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
  sector?: string | null;
  role?: string | null;
  gender?: string | null;
}): string {
  const uploaded = opts.uploadedUrl?.trim();
  if (uploaded) return uploaded;
  return resolveDefaultListingCover(opts);
}
