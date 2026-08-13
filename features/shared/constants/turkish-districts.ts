/**
 * İl → ilçe listeleri (81 il, Mernis kaynaklı vendored JSON).
 * "Diğer" seçilince formda serbest metin alanı açılır.
 */
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import districtsByCity from '@/features/shared/constants/turkish-districts-data.json';

type DistrictsMap = Record<string, readonly string[]>;

const DISTRICTS_BY_CITY = districtsByCity as DistrictsMap;
const FALLBACK_DISTRICTS = ['Merkez', 'Diğer'] as const;

function withDiger(districts: readonly string[]): string[] {
  return districts.includes('Diğer') ? [...districts] : [...districts, 'Diğer'];
}

/** Normalize İstanbul Avrupa/Anadolu yakası → İstanbul districts. */
function resolveCityKey(city: string | null | undefined): string | null {
  if (!city) return null;
  if (city.startsWith('İstanbul')) return 'İstanbul';
  return city;
}

export function getDistrictsForCity(city: string | null | undefined): string[] {
  const key = resolveCityKey(city);
  if (!key) return [];
  const districts = DISTRICTS_BY_CITY[key];
  if (districts?.length) return withDiger(districts);
  if ((TURKISH_CITIES as readonly string[]).includes(key)) {
    return [...FALLBACK_DISTRICTS];
  }
  return [...FALLBACK_DISTRICTS];
}

export function cityHasDetailedDistricts(city: string | null | undefined): boolean {
  const key = resolveCityKey(city);
  return Boolean(key && DISTRICTS_BY_CITY[key]?.length);
}
