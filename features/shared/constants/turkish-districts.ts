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
  const trimmed = city.trim();
  if (trimmed === 'İstanbul Avrupa Yakası' || trimmed === 'İstanbul (Avrupa Yakası)') {
    return 'İstanbul Avrupa Yakası';
  }
  if (trimmed === 'İstanbul Anadolu Yakası' || trimmed === 'İstanbul (Anadolu Yakası)') {
    return 'İstanbul Anadolu Yakası';
  }
  if (trimmed.startsWith('İstanbul')) return 'İstanbul';
  return trimmed;
}

export function getDistrictsForCity(city: string | null | undefined): string[] {
  const key = resolveCityKey(city);
  if (!key) return [];
  if (key === 'İstanbul Avrupa Yakası') return withDiger(ISTANBUL_AVRUPA_DISTRICTS);
  if (key === 'İstanbul Anadolu Yakası') return withDiger(ISTANBUL_ANADOLU_DISTRICTS);

  const districts = DISTRICTS_BY_CITY[key];
  if (districts?.length) return withDiger(districts.slice().sort((a, b) => a.localeCompare(b, 'tr-TR')));
  if ((TURKISH_CITIES as readonly string[]).includes(key)) {
    return [...FALLBACK_DISTRICTS];
  }
  return [...FALLBACK_DISTRICTS];
}

export function getDistrictsForCities(cities: string | string[] | null | undefined): string[] {
  if (!cities) return [];
  const list = Array.isArray(cities)
    ? cities.map(String).map((c) => c.trim()).filter(Boolean)
    : String(cities)
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
  if (list.length === 0) return [];
  if (list.length === 1) return getDistrictsForCity(list[0]);

  const all = new Set<string>();
  for (const c of list) {
    const districts = getDistrictsForCity(c);
    for (const d of districts) {
      if (d !== 'Diğer') all.add(d);
    }
  }
  return withDiger(Array.from(all).sort((a, b) => a.localeCompare(b, 'tr-TR')));
}

export function cityHasDetailedDistricts(city: string | null | undefined): boolean {
  const key = resolveCityKey(city);
  if (!key) return false;
  if (key === 'İstanbul Avrupa Yakası' || key === 'İstanbul Anadolu Yakası') return true;
  return Boolean(DISTRICTS_BY_CITY[key]?.length);
}

