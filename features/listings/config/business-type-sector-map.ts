import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';

/** Canonical business types for business transfer */
export const CANONICAL_BUSINESS_TRANSFER_TYPES = [
  'Kafe / Restoran / Yeme-İçme',
  'Market / Bakkal / Şarküteri',
  'Mağaza / Butik / Perakende',
  'E-Ticaret / Dijital İşletme',
  'Güzellik Merkezi / Kuaför / Spa',
  'Oto Servis / Yıkama / Ekspertiz',
  'Üretim / Atölye / İmalathane',
  'Eğitim / Kurs / Kreş',
  'Sağlık / Klinik / Eczane',
  'Otel / Pansiyon / Konaklama',
  'Lojistik / Depolama / Kargo',
  'Hizmet / Danışmanlık / Ofis',
  'Tarım / Hayvancılık',
  'Spor / Fitness Salonu',
  'İnşaat / Gayrimenkul',
  'Diğer',
] as const;

export type CanonicalBusinessTransferType = (typeof CANONICAL_BUSINESS_TRANSFER_TYPES)[number];

/**
 * Mapping from each business type to strictly canonical sectors in JOB_SECTOR_OPTIONS.
 * Preserves canonical strings without introducing duplicate sector naming.
 */
export const BUSINESS_TYPE_TO_SECTOR_MAP: Record<CanonicalBusinessTransferType, readonly string[]> = {
  'Kafe / Restoran / Yeme-İçme': [
    'Gıda / Restoran',
    'Turizm / Otelcilik',
    'Organizasyon / Etkinlik',
  ],
  'Market / Bakkal / Şarküteri': [
    'Perakende / Mağaza',
    'Gıda / Restoran',
    'İthalat / İhracat',
  ],
  'Mağaza / Butik / Perakende': [
    'Perakende / Mağaza',
    'Tekstil / Hazır giyim',
    'Elektrik-elektronik',
    'Mobilya',
    'Güzellik / Kişisel bakım',
    'İthalat / İhracat',
  ],
  'E-Ticaret / Dijital İşletme': [
    'E-ticaret / Pazaryeri',
    'Bilişim / Yazılım',
    'Perakende / Mağaza',
    'Tekstil / Hazır giyim',
    'Elektrik-elektronik',
    'Güzellik / Kişisel bakım',
    'Lojistik / Depolama',
  ],
  'Güzellik Merkezi / Kuaför / Spa': [
    'Güzellik / Kişisel bakım',
    'Sağlık',
    'Perakende / Mağaza',
  ],
  'Oto Servis / Yıkama / Ekspertiz': [
    'Oto servis / Yetkili servis',
    'Otomotiv',
    'Mühendislik / Teknik',
  ],
  'Üretim / Atölye / İmalathane': [
    'Üretim / Sanayi',
    'Tekstil / Hazır giyim',
    'Kimya / Plastik',
    'Demir-çelik / Metal',
    'Elektrik-elektronik',
    'Mobilya',
    'Kağıt / Ambalaj',
    'Gıda / Restoran',
    'Mühendislik / Teknik',
  ],
  'Eğitim / Kurs / Kreş': [
    'Eğitim',
    'Kreş / Çocuk bakımı',
    'Danışmanlık',
  ],
  'Sağlık / Klinik / Eczane': [
    'Sağlık',
    'Eczane / İlaç',
    'Veteriner / Pet',
    'Güzellik / Kişisel bakım',
  ],
  'Otel / Pansiyon / Konaklama': [
    'Turizm / Otelcilik',
    'Gıda / Restoran',
    'Organizasyon / Etkinlik',
  ],
  'Lojistik / Depolama / Kargo': [
    'Lojistik / Depolama',
    'Kargo / Kurye',
    'Ulaşım / Şoförlük',
    'Denizcilik / Liman',
    'Gümrük',
    'İthalat / İhracat',
  ],
  'Hizmet / Danışmanlık / Ofis': [
    'Danışmanlık',
    'Hukuk',
    'Muhasebe / Mali müşavirlik',
    'İnsan kaynakları',
    'Pazarlama / Reklam',
    'Finans / Bankacılık',
    'Sigorta',
    'İdari işler / Ofis',
    'Halkla ilişkiler',
  ],
  'Tarım / Hayvancılık': [
    'Tarım',
    'Gıda / Restoran',
    'Veteriner / Pet',
    'Çevre / Geri dönüşüm',
  ],
  'Spor / Fitness Salonu': [
    'Spor / Fitness',
    'Sağlık',
    'Güzellik / Kişisel bakım',
  ],
  'İnşaat / Gayrimenkul': [
    'İnşaat / Gayrimenkul',
    'İklimlendirme / Tesisat',
    'Mühendislik / Teknik',
  ],
  'Diğer': [...JOB_SECTOR_OPTIONS],
};

/** Alias / shorthand mapping to canonical business types */
const BUSINESS_TYPE_ALIASES: Record<string, CanonicalBusinessTransferType> = {
  restaurant: 'Kafe / Restoran / Yeme-İçme',
  restoran: 'Kafe / Restoran / Yeme-İçme',
  cafe: 'Kafe / Restoran / Yeme-İçme',
  kafe: 'Kafe / Restoran / Yeme-İçme',
  market: 'Market / Bakkal / Şarküteri',
  bakkal: 'Market / Bakkal / Şarküteri',
  sarkuteri: 'Market / Bakkal / Şarküteri',
  store: 'Mağaza / Butik / Perakende',
  magaza: 'Mağaza / Butik / Perakende',
  butik: 'Mağaza / Butik / Perakende',
  perakende: 'Mağaza / Butik / Perakende',
  ecommerce: 'E-Ticaret / Dijital İşletme',
  'e-ticaret': 'E-Ticaret / Dijital İşletme',
  eticaret: 'E-Ticaret / Dijital İşletme',
  dijital: 'E-Ticaret / Dijital İşletme',
  beauty: 'Güzellik Merkezi / Kuaför / Spa',
  guzellik: 'Güzellik Merkezi / Kuaför / Spa',
  kuafor: 'Güzellik Merkezi / Kuaför / Spa',
  spa: 'Güzellik Merkezi / Kuaför / Spa',
  auto_service: 'Oto Servis / Yıkama / Ekspertiz',
  'oto servis': 'Oto Servis / Yıkama / Ekspertiz',
  oto_servis: 'Oto Servis / Yıkama / Ekspertiz',
  otomotiv: 'Oto Servis / Yıkama / Ekspertiz',
  manufacturing: 'Üretim / Atölye / İmalathane',
  uretim: 'Üretim / Atölye / İmalathane',
  imalathane: 'Üretim / Atölye / İmalathane',
  atolye: 'Üretim / Atölye / İmalathane',
  education: 'Eğitim / Kurs / Kreş',
  egitim: 'Eğitim / Kurs / Kreş',
  kurs: 'Eğitim / Kurs / Kreş',
  kres: 'Eğitim / Kurs / Kreş',
  health: 'Sağlık / Klinik / Eczane',
  saglik: 'Sağlık / Klinik / Eczane',
  klinik: 'Sağlık / Klinik / Eczane',
  eczane: 'Sağlık / Klinik / Eczane',
  hotel: 'Otel / Pansiyon / Konaklama',
  otel: 'Otel / Pansiyon / Konaklama',
  konaklama: 'Otel / Pansiyon / Konaklama',
  pansiyon: 'Otel / Pansiyon / Konaklama',
  logistics: 'Lojistik / Depolama / Kargo',
  lojistik: 'Lojistik / Depolama / Kargo',
  kargo: 'Lojistik / Depolama / Kargo',
  depolama: 'Lojistik / Depolama / Kargo',
  professional_services: 'Hizmet / Danışmanlık / Ofis',
  hizmet: 'Hizmet / Danışmanlık / Ofis',
  danismanlik: 'Hizmet / Danışmanlık / Ofis',
  ofis: 'Hizmet / Danışmanlık / Ofis',
  agriculture: 'Tarım / Hayvancılık',
  tarim: 'Tarım / Hayvancılık',
  hayvancilik: 'Tarım / Hayvancılık',
  fitness: 'Spor / Fitness Salonu',
  spor: 'Spor / Fitness Salonu',
  gym: 'Spor / Fitness Salonu',
  real_estate: 'İnşaat / Gayrimenkul',
  gayrimenkul: 'İnşaat / Gayrimenkul',
  insaat: 'İnşaat / Gayrimenkul',
  other: 'Diğer',
  diger: 'Diğer',
};

function normalizeLookupKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u');
}

/**
 * Resolves any raw business type string or alias to canonical form.
 */
export function resolveCanonicalBusinessType(raw: string): CanonicalBusinessTransferType | null {
  if (!raw) return null;
  const directMatch = CANONICAL_BUSINESS_TRANSFER_TYPES.find((t) => t === raw);
  if (directMatch) return directMatch;

  const normalized = normalizeLookupKey(raw);
  for (const [aliasKey, canonical] of Object.entries(BUSINESS_TYPE_ALIASES)) {
    if (normalized === aliasKey || normalized.includes(aliasKey) || aliasKey.includes(normalized)) {
      return canonical;
    }
  }

  for (const canonical of CANONICAL_BUSINESS_TRANSFER_TYPES) {
    const normCanonical = normalizeLookupKey(canonical);
    if (normCanonical === normalized || normCanonical.includes(normalized) || normalized.includes(normCanonical)) {
      return canonical;
    }
  }

  return null;
}

/**
 * Returns a deduplicated UNION array of canonical sectors mapped to the given business types.
 */
export function getSectorsForBusinessTypes(businessTypes: readonly string[] | string[]): string[] {
  if (!businessTypes || businessTypes.length === 0) {
    return [];
  }

  const sectorSet = new Set<string>();
  let hasOther = false;

  for (const type of businessTypes) {
    const canonical = resolveCanonicalBusinessType(type);
    if (!canonical) continue;
    if (canonical === 'Diğer') {
      hasOther = true;
    }
    const sectors = BUSINESS_TYPE_TO_SECTOR_MAP[canonical];
    if (sectors) {
      sectors.forEach((s) => sectorSet.add(s));
    }
  }

  if (hasOther) {
    // Return all canonical sectors preserving standard order
    return [...JOB_SECTOR_OPTIONS];
  }

  // Preserve order from canonical mapping
  return Array.from(sectorSet);
}

/**
 * Prunes any previously selected sectors that are no longer supported
 * by the current selection of business types.
 */
export function pruneUnsupportedSectors(
  selectedSectors: string[],
  selectedBusinessTypes: string[],
): { prunedSectors: string[]; removedSectors: string[] } {
  if (!selectedSectors || selectedSectors.length === 0) {
    return { prunedSectors: [], removedSectors: [] };
  }

  if (!selectedBusinessTypes || selectedBusinessTypes.length === 0) {
    return { prunedSectors: [], removedSectors: [...selectedSectors] };
  }

  const allowedSectors = new Set(getSectorsForBusinessTypes(selectedBusinessTypes));
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

/**
 * Determines whether two business types are related by sharing mapped sectors.
 */
export function areBusinessTypesRelated(typeA: string, typeB: string): boolean {
  if (!typeA || !typeB) return false;
  const canA = resolveCanonicalBusinessType(typeA);
  const canB = resolveCanonicalBusinessType(typeB);
  if (!canA || !canB) return false;
  if (canA === canB) return true;

  const sectorsA = new Set(BUSINESS_TYPE_TO_SECTOR_MAP[canA] || []);
  const sectorsB = BUSINESS_TYPE_TO_SECTOR_MAP[canB] || [];

  return sectorsB.some((s) => sectorsA.has(s));
}
