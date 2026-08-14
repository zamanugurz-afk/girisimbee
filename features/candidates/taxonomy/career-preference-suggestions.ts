/**
 * Kariyer Tercihleri option lists, ranked from experience sector + position.
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
const FAMILY_SENIORITY: Record<RoleFamily, 0 | 1 | 2 | 3> = {
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

/** Overlapping clusters — a family inherits every cluster it belongs to. */
const FAMILY_CLUSTERS: RoleFamily[][] = [
  [
    'branchManager',
    'regionalManager',
    'salesManager',
    'portfolioManager',
    'credit',
    'accounting',
    'insuranceOps',
    'bankFront',
    'officeManager',
    'consulting',
    'admin',
    'salesIndoor',
    'customerSuccess',
  ],
  [
    'storeManager',
    'retail',
    'cashier',
    'regionalManager',
    'salesManager',
    'salesIndoor',
    'salesField',
    'warehouseLead',
    'logistics',
  ],
  [
    'restaurantManager',
    'restaurant',
    'kitchen',
    'kitchenChef',
    'hotelOps',
    'reception',
    'host',
    'housekeeping',
  ],
  ['software', 'techLead', 'data', 'product', 'design', 'devops', 'qa', 'consulting'],
  ['hr', 'hrManager', 'admin', 'officeManager', 'legal', 'public', 'teacher', 'schoolPrincipal'],
  ['marketing', 'brandManager', 'media', 'mediaLead', 'design', 'salesIndoor'],
  [
    'logistics',
    'warehouseLead',
    'driver',
    'factory',
    'productionLead',
    'shiftSupervisor',
    'construction',
    'siteChief',
    'energy',
  ],
  ['autoService', 'serviceManager', 'salesField', 'retail'],
  ['farm', 'farmLead'],
  ['beauty', 'retail', 'cashier'],
  ['security', 'shiftSupervisor', 'public', 'admin'],
  ['callCenter', 'customerSuccess', 'salesIndoor', 'bankFront'],
];

const PROMOTION_FAMILIES: Partial<Record<RoleFamily, readonly RoleFamily[]>> = {
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
    'Müşteri hizmetleri',
    'Çağrı merkezi',
    'İnsan kaynakları',
    'İdari işler / Ofis',
  ],
  Sigorta: [
    'Finans / Bankacılık',
    'Muhasebe / Mali müşavirlik',
    'Satış',
    'Müşteri hizmetleri',
    'Çağrı merkezi',
    'Danışmanlık',
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
    'Müşteri hizmetleri',
    'Çağrı merkezi',
    'Sigorta',
    'Finans / Bankacılık',
    'Otomotiv',
  ],
  'Perakende / Mağaza': [
    'Satış',
    'E-ticaret / Pazaryeri',
    'Lojistik / Depolama',
    'Gıda / Restoran',
    'Pazarlama / Reklam',
    'Müşteri hizmetleri',
  ],
  'E-ticaret / Pazaryeri': [
    'Perakende / Mağaza',
    'Pazarlama / Reklam',
    'Lojistik / Depolama',
    'Bilişim / Yazılım',
    'Satış',
    'Müşteri hizmetleri',
  ],
  'Bilişim / Yazılım': [
    'Yapay zeka / Veri',
    'E-ticaret / Pazaryeri',
    'Telekomünikasyon',
    'Ar-Ge',
    'Oyun / E-spor',
    'Danışmanlık',
  ],
  'Yapay zeka / Veri': ['Bilişim / Yazılım', 'Ar-Ge', 'Finans / Bankacılık', 'Pazarlama / Reklam'],
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
  Havacılık: ['Turizm / Otelcilik', 'Lojistik / Depolama', 'Müşteri hizmetleri'],
  Sağlık: ['Eczane / İlaç', 'Veteriner / Pet', 'Sosyal hizmet / STK', 'Sigorta'],
  'Eczane / İlaç': ['Sağlık', 'Satış', 'Perakende / Mağaza'],
  'Veteriner / Pet': ['Sağlık', 'Tarım', 'Perakende / Mağaza'],
  Eğitim: ['Kreş / Çocuk bakımı', 'İnsan kaynakları', 'Sosyal hizmet / STK'],
  'Kreş / Çocuk bakımı': ['Eğitim', 'Sosyal hizmet / STK'],
  Hukuk: ['Kamu / Belediye', 'Finans / Bankacılık', 'İdari işler / Ofis', 'Danışmanlık'],
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
  Telekomünikasyon: ['Bilişim / Yazılım', 'Çağrı merkezi', 'Müşteri hizmetleri', 'Satış'],
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
};

export type PreferenceSuggestionInput = {
  experiences?: Array<Pick<CareerExperience, 'sector' | 'role' | 'roleOther'>>;
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

function relatedFamiliesFor(family: RoleFamily): RoleFamily[] {
  const set = new Set<RoleFamily>([family]);
  for (const cluster of FAMILY_CLUSTERS) {
    if (!cluster.includes(family)) continue;
    for (const item of cluster) set.add(item);
  }
  for (const next of PROMOTION_FAMILIES[family] ?? []) set.add(next);
  return [...set];
}

function relatedSectorsFor(sector: string): string[] {
  if (!sector || sector === 'Diğer' || !SECTOR_SET.has(sector)) return [];
  const set = new Set<string>([sector]);
  for (const linked of SECTOR_SEEDS[sector] ?? []) {
    if (SECTOR_SET.has(linked) && linked !== 'Diğer') set.add(linked);
  }
  for (const [from, tos] of Object.entries(SECTOR_SEEDS)) {
    if (!tos.includes(sector)) continue;
    if (SECTOR_SET.has(from) && from !== 'Diğer') set.add(from);
  }
  return [...set];
}

function experienceSeeds(input: PreferenceSuggestionInput) {
  const rows = [...(input.experiences ?? [])];
  const seeds: Array<{ sector: string; role: string; weight: number; family: RoleFamily | null }> = [];

  rows.forEach((row, index) => {
    const role = isManualCareerOption(row.role) ? (row.roleOther ?? '').trim() : (row.role ?? '').trim();
    const sector = (row.sector ?? '').trim();
    seeds.push({
      sector,
      role,
      weight: 100 - index * 10,
      family: resolveRoleFamily(role),
    });
  });

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

  return seeds.filter((seed) => seed.sector || seed.role);
}

function mergeSelected(options: string[], selected: string[] | null | undefined, manual: string): string[] {
  const extra = (selected ?? []).filter((item) => item && !isManualCareerOption(item) && !options.includes(item));
  const withoutManual = options.filter((item) => !isManualCareerOption(item));
  return uniq([...withoutManual, ...extra, manual]);
}

export function suggestPreferredSectors(input: PreferenceSuggestionInput): string[] {
  const seeds = experienceSeeds(input);
  const scored = new Map<string, number>();

  function add(sector: string, score: number) {
    if (!sector || sector === 'Diğer' || !SECTOR_SET.has(sector)) return;
    scored.set(sector, Math.max(scored.get(sector) ?? 0, score));
  }

  for (const seed of seeds) {
    if (seed.sector) {
      add(seed.sector, seed.weight + 80);
      for (const related of relatedSectorsFor(seed.sector)) {
        add(related, seed.weight + (related === seed.sector ? 80 : 40));
      }
    }
    if (seed.family) {
      for (const home of FAMILY_HOME_SECTORS[seed.family] ?? []) add(home, seed.weight + 55);
    }
    if (seed.role) {
      for (const fromRole of getSectorsForPosition(seed.role)) add(fromRole, seed.weight + 70);
    }
  }

  const ranked = [...scored.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))
    .map(([sector]) => sector);

  if (ranked.length === 0) {
    return mergeSelected([...JOB_SECTOR_OPTIONS.filter((s) => s !== 'Diğer')], input.selected, MANUAL_OPTION);
  }

  return mergeSelected(ranked, input.selected, MANUAL_OPTION);
}

export function suggestPreferredRoles(input: PreferenceSuggestionInput): string[] {
  const seeds = experienceSeeds(input);
  const scored = new Map<string, number>();
  const sourceSeniority = Math.max(0, ...seeds.map((seed) => (seed.family ? FAMILY_SENIORITY[seed.family] : 0)));

  function add(role: string, score: number) {
    const trimmed = role.trim();
    if (!trimmed || isManualCareerOption(trimmed)) return;
    scored.set(trimmed, Math.max(scored.get(trimmed) ?? 0, score));
  }

  const relatedSectorSet = new Set(suggestPreferredSectors({ ...input, selected: [] }).filter((s) => !isManualCareerOption(s)));

  for (const seed of seeds) {
    if (seed.role) add(seed.role, seed.weight + 900);

    const families = seed.family ? relatedFamiliesFor(seed.family) : [];
    for (const family of families) {
      const seniority = FAMILY_SENIORITY[family];
      const same = family === seed.family;
      const upwardOrPeer = seniority >= sourceSeniority;
      const familyScore =
        seed.weight
        + (same ? 300 : 0)
        + (upwardOrPeer ? 180 + seniority * 20 : 40 + seniority * 8);
      for (const title of titlesForFamily(family)) add(title, familyScore);
    }
  }

  for (const sector of relatedSectorSet) {
    for (const title of getPositionsForSector(sector)) {
      const family = resolveRoleFamily(title);
      const seniority = family ? FAMILY_SENIORITY[family] : 0;
      const fromSeedSector = seeds.some((seed) => seed.sector === sector);
      add(
        title,
        20
          + seniority * 12
          + (fromSeedSector ? 30 : 0)
          + (seniority >= sourceSeniority ? 50 : 0),
      );
    }
  }

  const ranked = [...scored.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))
    .map(([role]) => role);

  if (ranked.length === 0) {
    return mergeSelected([], input.selected, MANUAL_OPTION);
  }

  return mergeSelected(ranked, input.selected, MANUAL_OPTION);
}
