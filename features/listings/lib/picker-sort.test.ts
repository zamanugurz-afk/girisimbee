import { describe, expect, it } from 'vitest';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { LISTING_CITY_OPTIONS, TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import {
  sortCitiesForPicker,
  sortSectorsPopularThenAz,
} from '@/features/listings/lib/picker-sort';

describe('picker sort', () => {
  it('puts popular sectors first and Diğer last', () => {
    const sorted = sortSectorsPopularThenAz(JOB_SECTOR_OPTIONS);
    expect(sorted.slice(0, 4)).toEqual([
      'Bilişim / Yazılım',
      'Satış',
      'Sağlık',
      'Çağrı merkezi',
    ]);
    expect(sorted).toContain('Muhasebe / Mali müşavirlik');
    expect(sorted).toContain('Telekomünikasyon');
    expect(sorted.at(-1)).toBe('Diğer');
    expect(sorted).toHaveLength(JOB_SECTOR_OPTIONS.length);
  });

  it('starts listing cities with Istanbul sides then large metros', () => {
    const sorted = sortCitiesForPicker(LISTING_CITY_OPTIONS);
    expect(sorted.slice(0, 4)).toEqual([
      'İstanbul Anadolu Yakası',
      'İstanbul Avrupa Yakası',
      'Ankara',
      'İzmir',
    ]);
    expect(sorted.indexOf('Adana')).toBeGreaterThan(sorted.indexOf('Ankara'));
  });

  it('starts province-only lists with Istanbul then large metros', () => {
    const sorted = sortCitiesForPicker(TURKISH_CITIES);
    expect(sorted.slice(0, 3)).toEqual(['İstanbul', 'Ankara', 'İzmir']);
  });
});
