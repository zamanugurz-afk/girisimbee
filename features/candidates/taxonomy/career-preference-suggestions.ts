/**
 * Kariyer Tercihleri option lists, ranked from the latest job's sector + position.
 * Closest / connected titles stay in front; other related titles are A–Z.
 * Does not auto-select preferredSectors / preferredRoles — only the picker catalog.
 */
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  resolveRoleFamily,
  titlesForFamily,
  type RoleFamily,
} from '@/features/candidates/taxonomy/career-position-catalog';
import {
  getPositionsForSector,
  getSectorsForPosition,
  isManualCareerOption,
  MANUAL_OPTION,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';

const SECTOR_SET = new Set<string>(JOB_SECTOR_OPTIONS);

/** 3 = unit / general manager+, 2 = lead, 1 = specialist, 0 = frontline. */
export const FAMILY_SENIORITY: Record<RoleFamily, 0 | 1 | 2 | 3> = {
  reception: 0,
  host: 0,
  housekeeping: 0,
  hotelOps: 3,
  restaurant: 0,
  restaurantManager: 3,
  kitchen: 0,
  kitchenChef: 3,
  retail: 0,
  storeManager: 3,
  cashier: 0,
  callCenter: 0,
  customerSuccess: 1,
  salesIndoor: 1,
  salesField: 1,
  salesManager: 3,
  regionalManager: 3,
  insuranceOps: 1,
  bankFront: 0,
  branchManager: 3,
  portfolioManager: 2,
  credit: 1,
  accounting: 1,
  software: 1,
  techLead: 3,
  data: 1,
  product: 2,
  design: 1,
  devops: 1,
  qa: 1,
  teacher: 1,
  schoolPrincipal: 3,
  hr: 1,
  hrManager: 3,
  marketing: 1,
  brandManager: 3,
  legal: 1,
  logistics: 0,
  warehouseLead: 3,
  driver: 0,
  factory: 0,
  productionLead: 3,
  shiftSupervisor: 2,
  construction: 0,
  siteChief: 3,
  autoService: 0,
  serviceManager: 3,
  public: 1,
  energy: 1,
  farm: 0,
  farmLead: 2,
  media: 1,
  mediaLead: 3,
  consulting: 2,
  admin: 0,
  officeManager: 3,
  beauty: 0,
  security: 0,
};

const FRONTLINE_FAMILIES = new Set<RoleFamily>(
  (Object.entries(FAMILY_SENIORITY) as Array<[RoleFamily, number]>)
    .filter(([, seniority]) => seniority === 0)
    .map(([family]) => family),
);

/** Frontline-heavy sectors — hidden for managers unless it is their own sector. */
const FRONTLINE_SECTORS = new Set([
  'Çağrı merkezi',
  'Müşteri hizmetleri',
  'Kargo / Kurye',
  'Ulaşım / Şoförlük',
  'Temizlik / Tesis yönetimi',
  'Güvenlik',
]);

/**
 * Tight occupation proximity for preference titles.
 * Wide clusters (factory+construction+driver) leaked unrelated shop titles.
 */
const PREFERENCE_PROXIMITY: RoleFamily[][] = [
  ['salesIndoor', 'salesField', 'salesManager', 'regionalManager'],
  ['storeManager', 'regionalManager', 'salesManager'],
  ['branchManager', 'regionalManager', 'salesManager', 'portfolioManager', 'consulting'],
  ['bankFront', 'callCenter', 'customerSuccess'],
  ['credit', 'insuranceOps', 'portfolioManager'],
  ['accounting'],
  ['software', 'techLead', 'devops', 'qa', 'data'],
  ['product', 'design'],
  ['factory', 'shiftSupervisor', 'productionLead'],
  ['logistics', 'warehouseLead'],
  ['driver'],
  ['hr', 'hrManager'],
  ['hrManager', 'officeManager'],
  ['marketing', 'brandManager', 'media', 'mediaLead'],
  ['retail', 'cashier', 'storeManager'],
  ['reception', 'host', 'housekeeping', 'hotelOps'],
  ['restaurant', 'kitchen', 'restaurantManager', 'kitchenChef'],
  ['restaurantManager', 'kitchenChef', 'hotelOps'],
  ['construction', 'siteChief'],
  ['autoService', 'serviceManager'],
  ['teacher', 'schoolPrincipal'],
  ['farm', 'farmLead'],
  ['beauty', 'retail', 'cashier'],
  ['security'],
  ['admin', 'officeManager'],
  ['energy'],
  ['public', 'admin'],
  ['legal'],
];

const TECH_FAMILIES = new Set<RoleFamily>([
  'software',
  'techLead',
  'devops',
  'qa',
  'data',
  'product',
  'design',
]);

const GENERIC_LINE_TITLES = new Set([
  'Üretim işçisi',
  'Fabrika işçisi',
  'Makine operatörü',
]);

type PreferenceLane = 'line' | 'trade' | 'tech' | 'specialist' | 'engineer' | 'lead';
type PreferenceBand = 'core' | 'related';

export const PROMOTION_FAMILIES: Partial<Record<RoleFamily, readonly RoleFamily[]>> = {
  bankFront: ['branchManager', 'portfolioManager', 'salesManager'],
  retail: ['storeManager', 'regionalManager', 'salesManager'],
  cashier: ['storeManager', 'officeManager'],
  restaurant: ['restaurantManager'],
  kitchen: ['kitchenChef', 'restaurantManager'],
  reception: ['hotelOps'],
  host: ['hotelOps', 'restaurantManager'],
  housekeeping: ['hotelOps'],
  software: ['techLead', 'product'],
  data: ['techLead', 'product'],
  devops: ['techLead'],
  qa: ['techLead'],
  design: ['product', 'brandManager'],
  hr: ['hrManager'],
  teacher: ['schoolPrincipal'],
  factory: ['shiftSupervisor', 'productionLead'],
  logistics: ['warehouseLead'],
  driver: ['warehouseLead'],
  autoService: ['serviceManager'],
  construction: ['siteChief'],
  admin: ['officeManager'],
  callCenter: ['customerSuccess', 'salesManager'],
  salesIndoor: ['salesManager', 'regionalManager'],
  salesField: ['salesManager', 'regionalManager'],
  insuranceOps: ['portfolioManager', 'branchManager'],
  credit: ['portfolioManager', 'branchManager'],
  accounting: ['officeManager', 'branchManager'],
  marketing: ['brandManager'],
  media: ['mediaLead'],
  farm: ['farmLead'],
  public: ['officeManager'],
  security: ['shiftSupervisor'],
  beauty: ['storeManager'],
};

/**
 * One-way seeds; the builder also mirrors them.
 * Keep these tight — related, not "the whole market".
 */
const SECTOR_SEEDS: Record<string, readonly string[]> = {
  'Finans / Bankacılık': [
    'Sigorta',
    'Muhasebe / Mali müşavirlik',
    'Holding / Yönetim',
    'Danışmanlık',
    'Satış',
  ],
  Sigorta: [
    'Finans / Bankacılık',
    'Muhasebe / Mali müşavirlik',
    'Satış',
    'Danışmanlık',
    'Holding / Yönetim',
  ],
  'Muhasebe / Mali müşavirlik': [
    'Finans / Bankacılık',
    'Holding / Yönetim',
    'İdari işler / Ofis',
    'Danışmanlık',
    'İnsan kaynakları',
  ],
  'Holding / Yönetim': [
    'Finans / Bankacılık',
    'İnsan kaynakları',
    'İdari işler / Ofis',
    'Danışmanlık',
    'Muhasebe / Mali müşavirlik',
    'Satış',
  ],
  Danışmanlık: ['Holding / Yönetim', 'Finans / Bankacılık', 'İnsan kaynakları', 'Bilişim / Yazılım'],
  Satış: [
    'Perakende / Mağaza',
    'E-ticaret / Pazaryeri',
    'Pazarlama / Reklam',
    'Sigorta',
    'Finans / Bankacılık',
    'Otomotiv',
  ],
  'Perakende / Mağaza': [
    'Satış',
    'E-ticaret / Pazaryeri',
    'Lojistik / Depolama',
    'Pazarlama / Reklam',
  ],
  'E-ticaret / Pazaryeri': [
    'Perakende / Mağaza',
    'Pazarlama / Reklam',
    'Lojistik / Depolama',
    'Bilişim / Yazılım',
    'Satış',
  ],
  'Bilişim / Yazılım': [
    'Yapay zeka / Veri',
    'E-ticaret / Pazaryeri',
    'Telekomünikasyon',
    'Ar-Ge',
    'Oyun / E-spor',
    'Danışmanlık',
  ],
  'Yapay zeka / Veri': ['Bilişim / Yazılım', 'Ar-Ge', 'Pazarlama / Reklam'],
  'Pazarlama / Reklam': [
    'Halkla ilişkiler',
    'Medya / İçerik',
    'E-ticaret / Pazaryeri',
    'Satış',
    'Organizasyon / Etkinlik',
  ],
  'Halkla ilişkiler': ['Pazarlama / Reklam', 'Medya / İçerik', 'Organizasyon / Etkinlik'],
  'Medya / İçerik': ['Pazarlama / Reklam', 'Halkla ilişkiler', 'Fotoğraf / Prodüksiyon', 'Oyun / E-spor'],
  'Fotoğraf / Prodüksiyon': ['Medya / İçerik', 'Pazarlama / Reklam', 'Organizasyon / Etkinlik'],
  'İnsan kaynakları': ['Holding / Yönetim', 'İdari işler / Ofis', 'Eğitim', 'Danışmanlık'],
  'İdari işler / Ofis': ['İnsan kaynakları', 'Muhasebe / Mali müşavirlik', 'Holding / Yönetim', 'Kamu / Belediye'],
  'Müşteri hizmetleri': ['Çağrı merkezi', 'Satış', 'Perakende / Mağaza', 'Telekomünikasyon'],
  'Çağrı merkezi': ['Müşteri hizmetleri', 'Satış', 'Telekomünikasyon', 'Finans / Bankacılık'],
  'Gıda / Restoran': ['Turizm / Otelcilik', 'Perakende / Mağaza', 'Organizasyon / Etkinlik'],
  'Turizm / Otelcilik': ['Gıda / Restoran', 'Havacılık', 'Organizasyon / Etkinlik', 'Satış'],
  Havacılık: ['Turizm / Otelcilik', 'Lojistik / Depolama'],
  Sağlık: ['Eczane / İlaç', 'Veteriner / Pet', 'Sosyal hizmet / STK', 'Sigorta'],
  'Eczane / İlaç': ['Sağlık', 'Satış', 'Perakende / Mağaza'],
  'Veteriner / Pet': ['Sağlık', 'Tarım', 'Perakende / Mağaza'],
  Eğitim: ['Kreş / Çocuk bakımı', 'İnsan kaynakları', 'Sosyal hizmet / STK'],
  'Kreş / Çocuk bakımı': ['Eğitim', 'Sosyal hizmet / STK'],
  Hukuk: ['Kamu / Belediye', 'İdari işler / Ofis', 'Danışmanlık'],
  'Kamu / Belediye': ['Hukuk', 'İdari işler / Ofis', 'Sosyal hizmet / STK', 'Güvenlik'],
  'Üretim / Sanayi': [
    'Tekstil / Hazır giyim',
    'Otomotiv',
    'Elektrik-elektronik',
    'Demir-çelik / Metal',
    'Kimya / Plastik',
    'Kağıt / Ambalaj',
    'Mobilya',
    'Mühendislik / Teknik',
    'Lojistik / Depolama',
  ],
  'Tekstil / Hazır giyim': ['Üretim / Sanayi', 'Perakende / Mağaza', 'Lojistik / Depolama'],
  Otomotiv: ['Oto servis / Yetkili servis', 'Üretim / Sanayi', 'Satış', 'Mühendislik / Teknik'],
  'Oto servis / Yetkili servis': ['Otomotiv', 'Satış', 'Perakende / Mağaza'],
  'Elektrik-elektronik': ['Üretim / Sanayi', 'Enerji', 'Mühendislik / Teknik', 'İklimlendirme / Tesisat'],
  'Demir-çelik / Metal': ['Üretim / Sanayi', 'İnşaat / Gayrimenkul', 'Madencilik'],
  'Kimya / Plastik': ['Üretim / Sanayi', 'Eczane / İlaç', 'Çevre / Geri dönüşüm'],
  'Kağıt / Ambalaj': ['Üretim / Sanayi', 'Lojistik / Depolama'],
  Mobilya: ['Üretim / Sanayi', 'İnşaat / Gayrimenkul', 'Perakende / Mağaza'],
  'İnşaat / Gayrimenkul': [
    'İklimlendirme / Tesisat',
    'Mühendislik / Teknik',
    'Enerji',
    'Satış',
    'Üretim / Sanayi',
  ],
  'İklimlendirme / Tesisat': ['İnşaat / Gayrimenkul', 'Elektrik-elektronik', 'Enerji'],
  'Lojistik / Depolama': ['Kargo / Kurye', 'Ulaşım / Şoförlük', 'İthalat / İhracat', 'Gümrük', 'E-ticaret / Pazaryeri'],
  'Kargo / Kurye': ['Lojistik / Depolama', 'Ulaşım / Şoförlük'],
  'Ulaşım / Şoförlük': ['Lojistik / Depolama', 'Kargo / Kurye', 'Denizcilik / Liman'],
  'Denizcilik / Liman': ['Lojistik / Depolama', 'Gümrük', 'İthalat / İhracat'],
  Gümrük: ['İthalat / İhracat', 'Denizcilik / Liman', 'Lojistik / Depolama'],
  'İthalat / İhracat': ['Gümrük', 'Lojistik / Depolama', 'Satış'],
  Enerji: ['Mühendislik / Teknik', 'Elektrik-elektronik', 'İnşaat / Gayrimenkul', 'Çevre / Geri dönüşüm'],
  Telekomünikasyon: ['Bilişim / Yazılım', 'Satış'],
  Tarım: ['Veteriner / Pet', 'Gıda / Restoran', 'Çevre / Geri dönüşüm'],
  'Çevre / Geri dönüşüm': ['Enerji', 'Tarım', 'Kimya / Plastik'],
  Güvenlik: ['Kamu / Belediye', 'Temizlik / Tesis yönetimi', 'İdari işler / Ofis'],
  'Temizlik / Tesis yönetimi': ['Güvenlik', 'Turizm / Otelcilik', 'İnşaat / Gayrimenkul'],
  'Güzellik / Kişisel bakım': ['Perakende / Mağaza', 'Satış', 'Spor / Fitness'],
  'Spor / Fitness': ['Güzellik / Kişisel bakım', 'Eğitim', 'Organizasyon / Etkinlik'],
  'Sosyal hizmet / STK': ['Eğitim', 'Kamu / Belediye', 'Sağlık', 'İnsan kaynakları'],
  'Mühendislik / Teknik': ['Üretim / Sanayi', 'İnşaat / Gayrimenkul', 'Enerji', 'Ar-Ge', 'Savunma sanayi'],
  'Organizasyon / Etkinlik': ['Pazarlama / Reklam', 'Turizm / Otelcilik', 'Gıda / Restoran'],
  'Oyun / E-spor': ['Bilişim / Yazılım', 'Medya / İçerik', 'Pazarlama / Reklam'],
  'Savunma sanayi': ['Mühendislik / Teknik', 'Üretim / Sanayi', 'Ar-Ge'],
  Madencilik: ['Üretim / Sanayi', 'Enerji', 'Mühendislik / Teknik', 'Demir-çelik / Metal'],
  'Ar-Ge': ['Bilişim / Yazılım', 'Yapay zeka / Veri', 'Üretim / Sanayi', 'Mühendislik / Teknik', 'Savunma sanayi'],
};

const FAMILY_HOME_SECTORS: Partial<Record<RoleFamily, readonly string[]>> = {
  branchManager: ['Finans / Bankacılık', 'Sigorta', 'Holding / Yönetim'],
  bankFront: ['Finans / Bankacılık', 'Müşteri hizmetleri', 'Çağrı merkezi'],
  portfolioManager: ['Finans / Bankacılık', 'Sigorta', 'Danışmanlık'],
  credit: ['Finans / Bankacılık', 'Sigorta', 'Muhasebe / Mali müşavirlik'],
  accounting: ['Muhasebe / Mali müşavirlik', 'Finans / Bankacılık', 'İdari işler / Ofis'],
  insuranceOps: ['Sigorta', 'Finans / Bankacılık', 'Satış'],
  storeManager: ['Perakende / Mağaza', 'E-ticaret / Pazaryeri', 'Satış'],
  retail: ['Perakende / Mağaza', 'Satış', 'E-ticaret / Pazaryeri'],
  salesManager: ['Satış', 'Perakende / Mağaza', 'Finans / Bankacılık'],
  regionalManager: ['Perakende / Mağaza', 'Satış', 'Finans / Bankacılık', 'Holding / Yönetim'],
  restaurantManager: ['Gıda / Restoran', 'Turizm / Otelcilik'],
  hotelOps: ['Turizm / Otelcilik', 'Gıda / Restoran'],
  software: ['Bilişim / Yazılım', 'Yapay zeka / Veri', 'E-ticaret / Pazaryeri'],
  techLead: ['Bilişim / Yazılım', 'Yapay zeka / Veri', 'Holding / Yönetim'],
  schoolPrincipal: ['Eğitim', 'Kreş / Çocuk bakımı', 'Holding / Yönetim'],
  hrManager: ['İnsan kaynakları', 'Holding / Yönetim', 'Danışmanlık'],
  siteChief: ['İnşaat / Gayrimenkul', 'Mühendislik / Teknik'],
  productionLead: ['Üretim / Sanayi', 'Mühendislik / Teknik'],
  factory: ['Üretim / Sanayi'],
  shiftSupervisor: ['Üretim / Sanayi'],
  construction: ['İnşaat / Gayrimenkul'],
  logistics: ['Lojistik / Depolama'],
  driver: ['Ulaşım / Şoförlük', 'Lojistik / Depolama'],
  restaurant: ['Gıda / Restoran'],
  kitchen: ['Gıda / Restoran'],
  reception: ['Turizm / Otelcilik'],
  energy: ['Enerji', 'Elektrik-elektronik'],
  autoService: ['Oto servis / Yetkili servis', 'Otomotiv'],
};

export type PreferenceSuggestionInput = {
  experiences?: Array<
    Pick<
      CareerExperience,
      'sector' | 'role' | 'roleOther' | 'isCurrent' | 'startMonth' | 'startYear' | 'endMonth' | 'endYear'
    >
  >;
  primarySector?: string | null;
  desiredRole?: string | null;
  selected?: string[] | null;
};

function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function minAcceptableSeniority(sourceSeniority: number): number {
  if (sourceSeniority >= 3) return 2;
  if (sourceSeniority >= 2) return 1;
  return 0;
}

const JUNIOR_TITLE_RE =
  /temsilci|kasiyer|garson|komi|kurye|hostes|sekreter|çaycı|gişe|görevlisi|asistan|yardımcısı|işçi|operatör|uzman(?:ı)?|personeli|broker|underwriter|analist|analyst|iç satış|saha satış|bordro/i;

function isJuniorPreferenceTitle(title: string): boolean {
  const hay = title.toLocaleLowerCase('tr-TR');
  if (/hesap yöneticisi/.test(hay)) return true;
  if (/yönetim danışmanı|strateji danışmanı/.test(hay)) return false;
  return JUNIOR_TITLE_RE.test(hay);
}

function familyFitsSource(sourceFamily: RoleFamily | null, sourceSeniority: number, family: RoleFamily): boolean {
  if (sourceFamily && family === sourceFamily) return true;
  if (sourceSeniority >= 2 && FRONTLINE_FAMILIES.has(family)) return false;
  return FAMILY_SENIORITY[family] >= minAcceptableSeniority(sourceSeniority);
}

function titleFitsSeed(
  seed: { family: RoleFamily | null; role: string },
  sourceSeniority: number,
  title: string,
): boolean {
  if (seed.role && title === seed.role) return true;
  if (sourceSeniority >= 3 && isJuniorPreferenceTitle(title)) return false;
  const family = resolveRoleFamily(title);
  if (!family) {
    if (sourceSeniority < 2) return true;
    return /müdür|yönetici|direktör|şef|lider|cto|yönetmen|chief|portföy/i.test(title)
      && !/hesap yöneticisi/i.test(title);
  }
  return familyFitsSource(seed.family, sourceSeniority, family);
}

function sectorFitsSeed(
  seed: { sector: string; family: RoleFamily | null },
  sourceSeniority: number,
  sector: string,
): boolean {
  if (sector === seed.sector) return true;
  if (sourceSeniority >= 3 && FRONTLINE_SECTORS.has(sector)) return false;
  return true;
}

function preferenceLane(title: string, family: RoleFamily | null): PreferenceLane {
  if (family && FAMILY_SENIORITY[family] >= 2) return 'lead';
  if (family && TECH_FAMILIES.has(family)) return 'specialist';
  const hay = title.toLocaleLowerCase('tr-TR');
  if (/mühendis/.test(hay)) return 'engineer';
  if (/doktor|hemşire|ebe|fizyoterapist|diş|eczane|laboratuvar|ambulans|klinik|mimar/.test(hay)) {
    return 'specialist';
  }
  if (
    /iş sağlığı|isg|kalite|planlama/.test(hay)
    || (/uzman|analist|danışman/.test(hay) && !/işçi|operatör/.test(hay))
  ) {
    return 'specialist';
  }
  if (/teknisyen|tekniker|bakım/.test(hay)) return 'tech';
  if (/kaynakçı|çelik|torna|mobilya|usta|elektrikçi|tesisat|boyacı|marangoz/.test(hay)) {
    return 'trade';
  }
  return 'line';
}

function lanesAreCore(source: PreferenceLane, target: PreferenceLane): boolean {
  if (source === target) return true;
  const shop = source === 'line' || source === 'trade' || source === 'tech';
  const targetShop = target === 'line' || target === 'trade' || target === 'tech';
  return shop && targetShop;
}

function lanesAreRelated(source: PreferenceLane, target: PreferenceLane): boolean {
  if (lanesAreCore(source, target)) return true;
  if (source === 'line' || source === 'trade' || source === 'tech') {
    return target === 'specialist' || target === 'engineer' || target === 'lead';
  }
  if (source === 'specialist') {
    return target === 'engineer' || target === 'tech' || target === 'lead' || target === 'line' || target === 'trade';
  }
  if (source === 'engineer') {
    return target === 'specialist' || target === 'lead' || target === 'tech';
  }
  if (source === 'lead') {
    return target === 'specialist' || target === 'engineer';
  }
  return false;
}

function relatedFamiliesFor(family: RoleFamily): RoleFamily[] {
  const sourceSeniority = FAMILY_SENIORITY[family];
  const set = new Set<RoleFamily>([family]);
  for (const cluster of PREFERENCE_PROXIMITY) {
    if (!cluster.includes(family)) continue;
    for (const item of cluster) {
      if (familyFitsSource(family, sourceSeniority, item)) set.add(item);
    }
  }
  if (sourceSeniority < 3) {
    for (const next of PROMOTION_FAMILIES[family] ?? []) set.add(next);
  }
  return [...set];
}

function rankCoreThenRelatedAz(scored: Map<string, { score: number; band: PreferenceBand }>): string[] {
  const core: Array<[string, number]> = [];
  const related: string[] = [];
  for (const [item, { score, band }] of scored) {
    if (band === 'core') core.push([item, score]);
    else related.push(item);
  }
  core.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'));
  related.sort((a, b) => a.localeCompare(b, 'tr'));
  return [...core.map(([item]) => item), ...related];
}

function relatedSectorsFor(sector: string): string[] {
  if (!sector || sector === 'Diğer' || !SECTOR_SET.has(sector)) return [];
  const set = new Set<string>([sector]);
  for (const linked of SECTOR_SEEDS[sector] ?? []) {
    if (SECTOR_SET.has(linked) && linked !== 'Diğer') set.add(linked);
  }
  return [...set];
}

function experienceRole(row: {
  role?: string | null;
  roleOther?: string | null;
}): string {
  return isManualCareerOption(row.role) ? (row.roleOther ?? '').trim() : (row.role ?? '').trim();
}

function hasExperienceIdentity(row: {
  sector?: string | null;
  role?: string | null;
  roleOther?: string | null;
}): boolean {
  return Boolean(experienceRole(row) || (row.sector ?? '').trim());
}

/**
 * Preference catalogs follow the current / newest job only.
 * Form order is newest → oldest; `isCurrent` wins when marked.
 */
export function pickLatestExperience<
  T extends Pick<CareerExperience, 'sector' | 'role' | 'roleOther' | 'isCurrent'>,
>(experiences: T[] | null | undefined): T | null {
  const rows = experiences ?? [];
  const current = rows.find((row) => row.isCurrent && hasExperienceIdentity(row));
  if (current) return current;
  return rows.find((row) => hasExperienceIdentity(row)) ?? null;
}

function experienceSeeds(input: PreferenceSuggestionInput) {
  const seeds: Array<{ sector: string; role: string; weight: number; family: RoleFamily | null }> = [];
  const latest = pickLatestExperience(input.experiences);

  if (latest) {
    const role = experienceRole(latest);
    const sector = (latest.sector ?? '').trim();
    seeds.push({
      sector,
      role,
      weight: 100,
      family: resolveRoleFamily(role),
    });
  } else {
    const primary = (input.primarySector ?? '').trim();
    const desired = (input.desiredRole ?? '').trim();
    if (primary || (desired && !isManualCareerOption(desired))) {
      seeds.push({
        sector: primary,
        role: isManualCareerOption(desired) ? '' : desired,
        weight: 40,
        family: resolveRoleFamily(desired),
      });
    }
  }

  return seeds.filter((seed) => seed.sector || seed.role);
}

function mergeSelected(options: string[], selected: string[] | null | undefined, manual: string): string[] {
  const extra = (selected ?? []).filter((item) => item && !isManualCareerOption(item) && !options.includes(item));
  const withoutManual = options.filter((item) => !isManualCareerOption(item));
  return uniq([...withoutManual, ...extra, manual]);
}

function addScored(
  scored: Map<string, { score: number; band: PreferenceBand }>,
  item: string,
  score: number,
  band: PreferenceBand,
) {
  const prev = scored.get(item);
  if (!prev) {
    scored.set(item, { score, band });
    return;
  }
  scored.set(item, {
    score: Math.max(prev.score, score),
    band: prev.band === 'core' || band === 'core' ? 'core' : 'related',
  });
}

export function suggestPreferredSectors(input: PreferenceSuggestionInput): string[] {
  const seeds = experienceSeeds(input);
  const scored = new Map<string, { score: number; band: PreferenceBand }>();

  function add(sector: string, score: number, band: PreferenceBand) {
    if (!sector || sector === 'Diğer' || !SECTOR_SET.has(sector)) return;
    addScored(scored, sector, score, band);
  }

  for (const seed of seeds) {
    const sourceSeniority = seed.family ? FAMILY_SENIORITY[seed.family] : 0;
    if (seed.sector && sectorFitsSeed(seed, sourceSeniority, seed.sector)) {
      add(seed.sector, seed.weight + 80, 'core');
    }
    if (seed.family) {
      for (const home of FAMILY_HOME_SECTORS[seed.family] ?? []) {
        if (!sectorFitsSeed(seed, sourceSeniority, home)) continue;
        add(home, seed.weight + 55, 'core');
      }
    }
    if (seed.sector) {
      for (const related of relatedSectorsFor(seed.sector)) {
        if (related === seed.sector) continue;
        if (!sectorFitsSeed(seed, sourceSeniority, related)) continue;
        add(related, seed.weight + 40, 'related');
      }
    }
    if (seed.role) {
      for (const fromRole of getSectorsForPosition(seed.role)) {
        if (!sectorFitsSeed(seed, sourceSeniority, fromRole)) continue;
        add(fromRole, seed.weight + 25, fromRole === seed.sector ? 'core' : 'related');
      }
    }
  }

  const ranked = rankCoreThenRelatedAz(scored);
  if (ranked.length === 0) {
    return mergeSelected([...JOB_SECTOR_OPTIONS.filter((s) => s !== 'Diğer')], input.selected, MANUAL_OPTION);
  }

  return mergeSelected(ranked, input.selected, MANUAL_OPTION);
}

function shouldBulkAddFamilyTitles(seedFamily: RoleFamily | null, family: RoleFamily): boolean {
  if (family !== 'factory') return true;
  return seedFamily !== 'factory';
}

export function suggestPreferredRoles(input: PreferenceSuggestionInput): string[] {
  const seeds = experienceSeeds(input);
  const scored = new Map<string, { score: number; band: PreferenceBand }>();

  function add(role: string, score: number, band: PreferenceBand) {
    const trimmed = role.trim();
    if (!trimmed || isManualCareerOption(trimmed)) return;
    addScored(scored, trimmed, score, band);
  }

  for (const seed of seeds) {
    const sourceSeniority = seed.family ? FAMILY_SENIORITY[seed.family] : 0;
    const sourceLane = preferenceLane(seed.role || seed.sector, seed.family);
    const families = seed.family ? relatedFamiliesFor(seed.family) : [];
    const familySet = new Set(families);

    if (seed.role) add(seed.role, seed.weight + 900, 'core');

    for (const family of families) {
      if (!familyFitsSource(seed.family, sourceSeniority, family)) continue;
      const same = family === seed.family;
      const promotion = Boolean(
        seed.family && !same && (PROMOTION_FAMILIES[seed.family] ?? []).includes(family),
      );
      if (!shouldBulkAddFamilyTitles(seed.family, family) && !promotion) continue;

      for (const title of titlesForFamily(family)) {
        if (!titleFitsSeed(seed, sourceSeniority, title)) continue;
        const titleFamily = resolveRoleFamily(title);
        const titleLane = preferenceLane(title, titleFamily);
        if (seed.family === 'factory' && family === 'factory') {
          if (GENERIC_LINE_TITLES.has(title) && lanesAreCore(sourceLane, titleLane)) {
            add(title, seed.weight + 700, 'core');
          }
          continue;
        }
        if (same && lanesAreCore(sourceLane, titleLane)) {
          add(title, seed.weight + 300, 'core');
          continue;
        }
        if (promotion) {
          add(title, seed.weight + 220, 'core');
          continue;
        }
        if (sourceLane === 'lead' && titleLane === 'lead') {
          add(title, seed.weight + 200, 'core');
          continue;
        }
        if (
          lanesAreCore(sourceLane, titleLane)
          && (sourceLane === 'line' || sourceLane === 'trade' || sourceLane === 'tech')
          && !(seed.family && TECH_FAMILIES.has(seed.family))
        ) {
          add(title, seed.weight + 240, 'core');
          continue;
        }
        if (lanesAreRelated(sourceLane, titleLane)) {
          add(title, seed.weight + 80, 'related');
        }
      }
    }

    const homeSectors = uniq([
      seed.sector,
      ...(seed.family ? FAMILY_HOME_SECTORS[seed.family] ?? [] : []),
    ]).filter((sector) => sector && sectorFitsSeed(seed, sourceSeniority, sector));

    for (const sector of homeSectors) {
      for (const title of getPositionsForSector(sector)) {
        if (!titleFitsSeed(seed, sourceSeniority, title)) continue;
        const titleFamily = resolveRoleFamily(title);
        const titleLane = preferenceLane(title, titleFamily);
        const inProximity =
          !titleFamily
          || titleFamily === seed.family
          || familySet.has(titleFamily);
        const handsOnSeedSector = Boolean(
          seed.family
          && sector === seed.sector
          && titleFamily
          && (titleFamily === 'factory'
            || titleFamily === 'construction'
            || titleFamily === 'energy'
            || titleFamily === 'autoService')
          && lanesAreCore(sourceLane, titleLane),
        );
        if (!inProximity && !handsOnSeedSector && seed.family) continue;
        if (!lanesAreRelated(sourceLane, titleLane) && title !== seed.role) continue;

        const promotionTitle = Boolean(
          seed.family && titleFamily && (PROMOTION_FAMILIES[seed.family] ?? []).includes(titleFamily),
        );
        const sameFamily = !titleFamily || titleFamily === seed.family || !seed.family;
        if (
          title === seed.role
          || promotionTitle
          || (sameFamily && lanesAreCore(sourceLane, titleLane))
        ) {
          add(title, seed.weight + (title === seed.role ? 900 : 260), 'core');
        } else {
          add(title, seed.weight + 60, 'related');
        }
      }
    }
  }

  const ranked = rankCoreThenRelatedAz(scored);
  if (ranked.length === 0) {
    return mergeSelected([], input.selected, MANUAL_OPTION);
  }

  return mergeSelected(ranked, input.selected, MANUAL_OPTION);
}
