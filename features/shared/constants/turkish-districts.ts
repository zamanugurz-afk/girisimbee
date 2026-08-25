/**
 * İl → ilçe listeleri (81 il, Mernis kaynaklı vendored JSON).
 * "Diğer" seçilince formda serbest metin alanı açılır.
 * İstanbul Avrupa / Anadolu yakası kendi ilçe listesini kullanır.
 */
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import districtsByCity from '@/features/shared/constants/turkish-districts-data.json';

type DistrictsMap = Record<string, readonly string[]>;

const DISTRICTS_BY_CITY = districtsByCity as DistrictsMap;
const FALLBACK_DISTRICTS = ['Merkez', 'Diğer'] as const;

/** Official Avrupa Yakası districts (names match turkish-districts-data.json). */
export const ISTANBUL_AVRUPA_DISTRICTS = [
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

/** Official Anadolu Yakası districts (names match turkish-districts-data.json). */
export const ISTANBUL_ANADOLU_DISTRICTS = [
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

function withDiger(districts: readonly string[]): string[] {
  return districts.includes('Diğer') ? [...districts] : [...districts, 'Diğer'];
}

function resolveCityKey(city: string | null | undefined): string | null {
  if (!city) return null;
  if (city === 'İstanbul Avrupa Yakası' || city === 'İstanbul Anadolu Yakası') return city;
  if (city.startsWith('İstanbul')) return 'İstanbul';
  return city;
}

export function getDistrictsForCity(city: string | null | undefined): string[] {
  if (city === 'İstanbul Avrupa Yakası') return withDiger(ISTANBUL_AVRUPA_DISTRICTS);
  if (city === 'İstanbul Anadolu Yakası') return withDiger(ISTANBUL_ANADOLU_DISTRICTS);

  const key = resolveCityKey(city);
  if (!key) return [];
  const districts = DISTRICTS_BY_CITY[key];
  if (districts?.length) return withDiger(districts.slice().sort((a, b) => a.localeCompare(b, 'tr-TR')));
  if ((TURKISH_CITIES as readonly string[]).includes(key)) {
    return [...FALLBACK_DISTRICTS];
  }
  return [...FALLBACK_DISTRICTS];
}

export function cityHasDetailedDistricts(city: string | null | undefined): boolean {
  if (city === 'İstanbul Avrupa Yakası' || city === 'İstanbul Anadolu Yakası') return true;
  const key = resolveCityKey(city);
  return Boolean(key && DISTRICTS_BY_CITY[key]?.length);
}
