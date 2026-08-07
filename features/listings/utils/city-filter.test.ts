import { describe, expect, it } from 'vitest';
import { listingMatchesCityFilter } from '@/features/listings/utils/city-filter';

describe('city-filter', () => {
  it('matches major cities exactly', () => {
    expect(listingMatchesCityFilter({ city: 'İstanbul', location: 'İstanbul, Türkiye', remotePolicy: null }, 'İstanbul')).toBe(true);
    expect(listingMatchesCityFilter({ city: 'Ankara', location: 'Ankara, Türkiye', remotePolicy: null }, 'Ankara')).toBe(true);
    expect(listingMatchesCityFilter({ city: null, location: 'İzmir merkez', remotePolicy: null }, 'İzmir')).toBe(true);
  });

  it('Diğer excludes major cities and includes others', () => {
    expect(listingMatchesCityFilter({ city: 'Adana', location: 'Adana, Türkiye', remotePolicy: null }, 'Diğer')).toBe(true);
    expect(listingMatchesCityFilter({ city: null, location: 'Türkiye', remotePolicy: null }, 'Diğer')).toBe(true);
    expect(listingMatchesCityFilter({ city: 'İstanbul', location: 'İstanbul, Türkiye', remotePolicy: null }, 'Diğer')).toBe(false);
    expect(listingMatchesCityFilter({ city: null, location: 'Antalya sahil', remotePolicy: null }, 'Diğer')).toBe(false);
  });
});
