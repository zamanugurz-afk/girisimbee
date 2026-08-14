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
  if (opts.listingTypeSlug && COVER_BY_TYPE_SLUG[opts.listingTypeSlug]) {
    return COVER_BY_TYPE_SLUG[opts.listingTypeSlug];
  }
  if (opts.group && COVER_BY_GROUP[opts.group]) {
    return COVER_BY_GROUP[opts.group];
  }
  return DEFAULT_LISTING_COVER;
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
