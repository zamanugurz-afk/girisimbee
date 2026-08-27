import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';

/** Canonical franchise and concept types for franchise givers / franchisors */
export const CANONICAL_FRANCHISE_MODELS = [
  'Kafe & Kahve Zinciri',
  'Fast Food / Burger & Döner',
  'Restoran & Lokanta',
  'Çiğ Köfte & Sokak Lezzetleri',
  'Tatlı / Dondurma / Fırın & Pastane',
  'Market & Şarküteri & Büfe',
  'Giyim / Ayakkabı & Aksesuar',
  'Güzellik / Kuaför & Estetik Merkezi',
  'Oto Ekspertiz / Servis & Yıkama',
  'Eğitim Kurumu / Kurs & Kreş',
  'Kargo / Kurye & Lojistik',
  'Fitness & Spor Salonu',
  'Eczane / Medikal & Sağlık',
  'Emlak & Gayrimenkul Danışmanlığı',
  'Hizmet / Temizlik & Danışmanlık',
  'Diğer',
] as const;

export type CanonicalFranchiseModel = (typeof CANONICAL_FRANCHISE_MODELS)[number];

/** Trademark registration status options in accordance with Turkish Patent & Trademark Agency (TürkPatent) */
export const TRADEMARK_STATUS_OPTIONS = [
  'Tescilli (TürkPatent)',
  'Başvuru / İnceleme Aşamasında',
  'Uluslararası Tescilli (WIPO / Madrid)',
  'Tescil Başvurusu Yapılmadı',
] as const;

export type TrademarkStatusOption = (typeof TRADEMARK_STATUS_OPTIONS)[number];

/** Standard Franchise Agreement & FDD Disclosure Form options */
export const FRANCHISE_CONTRACT_OPTIONS = [
  'Hazır ve İmzaya Uygun',
  'Ön Görüşme Sonrası Paylaşılır',
  'Hazırlık Aşamasında',
] as const;

export type FranchiseContractOption = (typeof FRANCHISE_CONTRACT_OPTIONS)[number];

/** Standard Operations Manual & Know-How transfer options */
export const FRANCHISE_MANUAL_OPTIONS = [
  'Mevcut (Standart Operasyon Kılavuzu Var)',
  'Hazırlanıyor',
  'Yok',
] as const;

export type FranchiseManualOption = (typeof FRANCHISE_MANUAL_OPTIONS)[number];

/** Store and location type options */
export const STORE_LOCATION_TYPE_OPTIONS = [
  'Cadde Mağazası',
  'AVM',
  'Kiosk / Stand',
  'Drive-Thru',
  'Hepsi / Lokasyona Göre',
] as const;

export type StoreLocationTypeOption = (typeof STORE_LOCATION_TYPE_OPTIONS)[number];

/** Return on investment (ROI) period options */
export const FRANCHISE_RETURN_PERIOD_OPTIONS = [
  '0 - 6 Ay',
  '6 - 12 Ay',
  '12 - 18 Ay',
  '18 - 24 Ay',
  '24 - 36 Ay',
  '36+ Ay',
] as const;

/**
 * Mapping from each franchise model to strictly canonical sectors in JOB_SECTOR_OPTIONS.
 */
export const FRANCHISE_MODEL_TO_SECTOR_MAP: Record<CanonicalFranchiseModel, readonly string[]> = {
  'Kafe & Kahve Zinciri': [
    'Gıda / Restoran',
    'Turizm / Otelcilik',
    'Organizasyon / Etkinlik',
  ],
  'Fast Food / Burger & Döner': [
    'Gıda / Restoran',
    'Perakende / Mağaza',
  ],
  'Restoran & Lokanta': [
    'Gıda / Restoran',
    'Turizm / Otelcilik',
    'Organizasyon / Etkinlik',
  ],
  'Çiğ Köfte & Sokak Lezzetleri': [
    'Gıda / Restoran',
    'Perakende / Mağaza',
  ],
  'Tatlı / Dondurma / Fırın & Pastane': [
    'Gıda / Restoran',
    'Perakende / Mağaza',
    'Üretim / Sanayi',
  ],
  'Market & Şarküteri & Büfe': [
    'Perakende / Mağaza',
    'Gıda / Restoran',
    'İthalat / İhracat',
  ],
  'Giyim / Ayakkabı & Aksesuar': [
    'Tekstil / Hazır giyim',
    'Perakende / Mağaza',
    'İthalat / İhracat',
  ],
  'Güzellik / Kuaför & Estetik Merkezi': [
    'Güzellik / Kişisel bakım',
    'Sağlık',
    'Hizmet / Danışmanlık / Ofis',
  ],
  'Oto Ekspertiz / Servis & Yıkama': [
    'Oto servis / Yetkili servis',
    'Otomotiv',
    'Mühendislik / Teknik',
  ],
  'Eğitim Kurumu / Kurs & Kreş': [
    'Eğitim',
    'Kreş / Çocuk bakımı',
    'Danışmanlık',
  ],
  'Kargo / Kurye & Lojistik': [
    'Kargo / Kurye',
    'Lojistik / Depolama',
    'Ulaşım / Şoförlük',
  ],
  'Fitness & Spor Salonu': [
    'Spor / Fitness',
    'Sağlık',
    'Güzellik / Kişisel bakım',
  ],
  'Eczane / Medikal & Sağlık': [
    'Sağlık',
    'Eczane / İlaç',
    'Veteriner / Pet',
  ],
  'Emlak & Gayrimenkul Danışmanlığı': [
    'İnşaat / Gayrimenkul',
    'Danışmanlık',
    'Halkla ilişkiler',
  ],
  'Hizmet / Temizlik & Danışmanlık': [
    'Temizlik / Tesis yönetimi',
    'Danışmanlık',
    'İdari işler / Ofis',
    'Halkla ilişkiler',
  ],
  Diğer: [...JOB_SECTOR_OPTIONS],
};

/** Alias / legacy mapping for model strings */
const FRANCHISE_MODEL_ALIASES: Record<string, CanonicalFranchiseModel> = {
  kafe: 'Kafe & Kahve Zinciri',
  kahve: 'Kafe & Kahve Zinciri',
  'cafe & coffee': 'Kafe & Kahve Zinciri',
  fastfood: 'Fast Food / Burger & Döner',
  'fast food': 'Fast Food / Burger & Döner',
  burger: 'Fast Food / Burger & Döner',
  döner: 'Fast Food / Burger & Döner',
  doner: 'Fast Food / Burger & Döner',
  restoran: 'Restoran & Lokanta',
  lokanta: 'Restoran & Lokanta',
  'çiğ köfte': 'Çiğ Köfte & Sokak Lezzetleri',
  cigkofte: 'Çiğ Köfte & Sokak Lezzetleri',
  tatlı: 'Tatlı / Dondurma / Fırın & Pastane',
  pastane: 'Tatlı / Dondurma / Fırın & Pastane',
  fırın: 'Tatlı / Dondurma / Fırın & Pastane',
  market: 'Market & Şarküteri & Büfe',
  büfe: 'Market & Şarküteri & Büfe',
  giyim: 'Giyim / Ayakkabı & Aksesuar',
  tekstil: 'Giyim / Ayakkabı & Aksesuar',
  mağaza: 'Giyim / Ayakkabı & Aksesuar',
  güzellik: 'Güzellik / Kuaför & Estetik Merkezi',
  kuaför: 'Güzellik / Kuaför & Estetik Merkezi',
  kuafor: 'Güzellik / Kuaför & Estetik Merkezi',
  estetik: 'Güzellik / Kuaför & Estetik Merkezi',
  oto: 'Oto Ekspertiz / Servis & Yıkama',
  ekspertiz: 'Oto Ekspertiz / Servis & Yıkama',
  yıkama: 'Oto Ekspertiz / Servis & Yıkama',
  eğitim: 'Eğitim Kurumu / Kurs & Kreş',
  kurs: 'Eğitim Kurumu / Kurs & Kreş',
  kreş: 'Eğitim Kurumu / Kurs & Kreş',
  kargo: 'Kargo / Kurye & Lojistik',
  kurye: 'Kargo / Kurye & Lojistik',
  lojistik: 'Kargo / Kurye & Lojistik',
  fitness: 'Fitness & Spor Salonu',
  spor: 'Fitness & Spor Salonu',
  gym: 'Fitness & Spor Salonu',
  eczane: 'Eczane / Medikal & Sağlık',
  sağlık: 'Eczane / Medikal & Sağlık',
  medikal: 'Eczane / Medikal & Sağlık',
  emlak: 'Emlak & Gayrimenkul Danışmanlığı',
  gayrimenkul: 'Emlak & Gayrimenkul Danışmanlığı',
  temizlik: 'Hizmet / Temizlik & Danışmanlık',
  hizmet: 'Hizmet / Temizlik & Danışmanlık',
};

export function resolveCanonicalFranchiseModel(rawModel: string): CanonicalFranchiseModel | null {
  if (!rawModel || typeof rawModel !== 'string') return null;
  const trimmed = rawModel.trim();
  if (CANONICAL_FRANCHISE_MODELS.includes(trimmed as CanonicalFranchiseModel)) {
    return trimmed as CanonicalFranchiseModel;
  }
  const lower = trimmed.toLowerCase();
  for (const [aliasKey, canonical] of Object.entries(FRANCHISE_MODEL_ALIASES)) {
    if (lower === aliasKey || lower.includes(aliasKey)) {
      return canonical;
    }
  }
  return null;
}

export function getPrimarySectorForFranchiseModel(model: string): string | null {
  const canonical = resolveCanonicalFranchiseModel(model);
  if (!canonical || canonical === 'Diğer') return null;
  const sectors = FRANCHISE_MODEL_TO_SECTOR_MAP[canonical];
  return sectors && sectors.length > 0 ? (sectors[0] ?? null) : null;
}

export function getSectorsForFranchiseModels(models: readonly string[] | undefined | null): string[] {
  if (!models || !Array.isArray(models) || models.length === 0) {
    return [];
  }
  const sectorSet = new Set<string>();
  for (const rawModel of models) {
    const canonical = resolveCanonicalFranchiseModel(rawModel);
    if (canonical && FRANCHISE_MODEL_TO_SECTOR_MAP[canonical]) {
      for (const sector of FRANCHISE_MODEL_TO_SECTOR_MAP[canonical]) {
        sectorSet.add(sector);
      }
    }
  }
  return Array.from(sectorSet);
}

export function pruneUnsupportedFranchiseSectors(
  selectedSectors: readonly string[],
  selectedModels: readonly string[],
): { prunedSectors: string[]; removedSectors: string[] } {
  if (!selectedModels || selectedModels.length === 0) {
    return { prunedSectors: [], removedSectors: [...selectedSectors] };
  }
  if (selectedModels.includes('Diğer')) {
    return { prunedSectors: [...selectedSectors], removedSectors: [] };
  }
  const allowedSectors = new Set(getSectorsForFranchiseModels(selectedModels));
  const prunedSectors: string[] = [];
  const removedSectors: string[] = [];
  for (const sector of selectedSectors) {
    if (allowedSectors.has(sector)) {
      prunedSectors.push(sector);
    } else {
      removedSectors.push(sector);
    }
  }
  return { prunedSectors, removedSectors };
}
