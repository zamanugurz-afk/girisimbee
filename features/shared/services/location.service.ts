/**
 * Central Location Service for GirişimBee.
 * Standardizes Turkish provinces and districts sorting according to platform rules:
 *  1. İstanbul Anadolu Yakası
 *  2. İstanbul Avrupa Yakası
 *  3. Remaining 80 provinces in Turkish alphabetical order
 *  Districts:
 *   - Anadolu Yakası: 14 districts in Turkish alphabetical order
 *   - Avrupa Yakası: 25 districts in Turkish alphabetical order
 *   - Other provinces: districts in Turkish alphabetical order
 */

import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import districtsByCity from '@/features/shared/constants/turkish-districts-data.json';

type DistrictsMap = Record<string, readonly string[]>;
const DISTRICTS_MAP = districtsByCity as DistrictsMap;

export const STANDARD_ISTANBUL_ANADOLU_DISTRICTS = [
  'Adalar',
  'Ataşehir',
  'Beykoz',
  'Çekmeköy',
  'Kadıköy',
  'Kartal',
  'Maltepe',
  'Pendik',
  'Sancaktepe',
  'Sultanbeyli',
  'Şile',
  'Tuzla',
  'Ümraniye',
  'Üsküdar',
] as const;

export const STANDARD_ISTANBUL_AVRUPA_DISTRICTS = [
  'Arnavutköy',
  'Avcılar',
  'Bağcılar',
  'Bahçelievler',
  'Bakırköy',
  'Başakşehir',
  'Bayrampaşa',
  'Beşiktaş',
  'Beylikdüzü',
  'Beyoğlu',
  'Büyükçekmece',
  'Çatalca',
  'Esenler',
  'Esenyurt',
  'Eyüpsultan',
  'Fatih',
  'Gaziosmanpaşa',
  'Güngören',
  'Kağıthane',
  'Küçükçekmece',
  'Sarıyer',
  'Silivri',
  'Sultangazi',
  'Şişli',
  'Zeytinburnu',
] as const;

/**
 * All 80 Turkish provinces (excluding 'İstanbul' since it's split into sides)
 * sorted in Turkish alphabetical order.
 */
export const OTHER_PROVINCES_SORTED = TURKISH_CITIES
  .filter((c) => c !== 'İstanbul')
  .slice()
  .sort((a, b) => a.localeCompare(b, 'tr-TR'));

/**
 * Standard Global City Options:
 *  1. İstanbul Anadolu Yakası
 *  2. İstanbul Avrupa Yakası
 *  3. Remaining 80 provinces in Turkish alphabetical order
 */
export const GLOBAL_STANDARD_CITIES = [
  'İstanbul Anadolu Yakası',
  'İstanbul Avrupa Yakası',
  ...OTHER_PROVINCES_SORTED,
] as const;

export type GlobalStandardCity = (typeof GLOBAL_STANDARD_CITIES)[number];

/**
 * Returns standard city list for all location pickers in GirişimBee.
 */
export function getStandardCityOptions(options?: { includeLegacyIstanbul?: boolean }): string[] {
  if (options?.includeLegacyIstanbul) {
    return [
      'İstanbul Anadolu Yakası',
      'İstanbul Avrupa Yakası',
      ...TURKISH_CITIES.slice().sort((a, b) => a.localeCompare(b, 'tr-TR')),
    ];
  }
  return [...GLOBAL_STANDARD_CITIES];
}

/**
 * Sorts any list of city items using the platform standard:
 *  - İstanbul Anadolu Yakası first
 *  - İstanbul Avrupa Yakası second
 *  - Others sorted alphabetically in Turkish collation
 */
export function sortCitiesForStandardPicker(items: readonly string[]): string[] {
  const hasAnadolu = items.includes('İstanbul Anadolu Yakası');
  const hasAvrupa = items.includes('İstanbul Avrupa Yakası');
  const hasPlainIstanbul = items.includes('İstanbul');

  const head: string[] = [];
  if (hasAnadolu) head.push('İstanbul Anadolu Yakası');
  if (hasAvrupa) head.push('İstanbul Avrupa Yakası');

  const excludeSet = new Set(head);
  const rest = items
    .filter((c) => !excludeSet.has(c))
    .slice()
    .sort((a, b) => a.localeCompare(b, 'tr-TR'));

  return [...head, ...rest];
}

/**
 * Resolves sorted districts for a given city:
 *  - If city is empty/null: returns []
 *  - If city is İstanbul Anadolu Yakası: returns 14 Anadolu districts sorted A-Z
 *  - If city is İstanbul Avrupa Yakası: returns 25 Avrupa districts sorted A-Z
 *  - If city is other province: returns its districts sorted A-Z
 */
export function getStandardDistrictsForCity(city: string | null | undefined): string[] {
  if (!city || !city.trim()) return [];

  const trimmed = city.trim();

  if (trimmed === 'İstanbul Anadolu Yakası') {
    return [...STANDARD_ISTANBUL_ANADOLU_DISTRICTS];
  }

  if (trimmed === 'İstanbul Avrupa Yakası') {
    return [...STANDARD_ISTANBUL_AVRUPA_DISTRICTS];
  }

  if (trimmed === 'İstanbul') {
    // If plain Istanbul is passed, combine and sort all districts
    const combined = [
      ...STANDARD_ISTANBUL_ANADOLU_DISTRICTS,
      ...STANDARD_ISTANBUL_AVRUPA_DISTRICTS,
    ].sort((a, b) => a.localeCompare(b, 'tr-TR'));
    return combined;
  }

  const list = DISTRICTS_MAP[trimmed];
  if (list && list.length > 0) {
    return list.slice().sort((a, b) => a.localeCompare(b, 'tr-TR'));
  }

  return ['Merkez'];
}
