import type { Listing } from '@/features/listings/types/listing.entity.types';
import {
  MARKETPLACE_MAJOR_CITIES,
  MARKETPLACE_OTHER_CITY_LABEL,
} from '@/features/listings/config/marketplace.config';

/** Normalize city strings for comparison (Turkish locale, trim). */
export function normalizeCityValue(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().toLocaleLowerCase('tr-TR');
}

export function isOtherCityFilter(cityFilter: string): boolean {
  return cityFilter === MARKETPLACE_OTHER_CITY_LABEL;
}

function listingMatchesMajorCity(
  listing: Pick<Listing, 'city' | 'location'>,
  majorCity: string,
): boolean {
  const needle = normalizeCityValue(majorCity);
  if (normalizeCityValue(listing.city) === needle) return true;
  if (normalizeCityValue(listing.location).includes(needle)) return true;
  return false;
}

function listingIsInMajorCity(listing: Pick<Listing, 'city' | 'location'>): boolean {
  return MARKETPLACE_MAJOR_CITIES.some((major) => listingMatchesMajorCity(listing, major));
}

/** Whether a listing matches a browse city filter value. */
export function listingMatchesCityFilter(
  listing: Pick<Listing, 'city' | 'location' | 'remotePolicy'>,
  cityFilter: string,
): boolean {
  if (isOtherCityFilter(cityFilter)) {
    return !listingIsInMajorCity(listing);
  }

  const needle = normalizeCityValue(cityFilter);
  if (!needle) return true;

  if (normalizeCityValue(listing.city) === needle) return true;
  if (normalizeCityValue(listing.location).includes(needle)) return true;

  return false;
}

/** Supabase `.or()` filter for city + location fallback. */
export function buildSupabaseCityOrFilter(city: string): string {
  const escaped = city.replace(/,/g, '');
  return `city.eq.${escaped},location.ilike.%${escaped}%`;
}

/** Apply "Diğer" filter — exclude the five major cities (city + location). */
export function applySupabaseOtherCityFilter<Q extends { or: (filter: string) => Q }>(
  query: Q,
): Q {
  const majors = MARKETPLACE_MAJOR_CITIES.map((city) => `"${city}"`).join(',');
  let q = query.or(`city.is.null,city.not.in.(${majors})`);
  for (const city of MARKETPLACE_MAJOR_CITIES) {
    const escaped = city.replace(/,/g, '');
    q = q.or(`location.is.null,location.not.ilike.%${escaped}%`);
  }
  return q;
}

export function describeSupabaseOtherCityFilter(): string {
  const majors = MARKETPLACE_MAJOR_CITIES.join(',');
  return `other_cities:exclude(${majors})`;
}
