import { describe, it, expect } from 'vitest';
import {
  fetchMasterAreaPoiCensus,
  fetchCompetitorPois,
} from '@/features/radar/services/overpass-poi.service';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';

describe('Investment Radar — Sector Census & Consistency Regression Test', () => {
  it('guarantees that initial master area census computes non-zero realistic counts for all standard municipal sectors', async () => {
    // Coordinates for Sarıkamış / Kars or any active district
    const lat = 40.327;
    const lng = 42.593;
    const radiusMeters = 3000;
    const locationName = 'Kars — Sarıkamış / Yukarı Sarıkamış';

    // 1. Initial master area census (when category is 'all')
    const masterResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, 'all');

    expect(masterResult).toBeDefined();
    expect(masterResult.sectorCensus).toBeDefined();

    // Verify insurance_agency count in initial master census
    const initialInsuranceCount = masterResult.sectorCensus['insurance_agency'];
    expect(initialInsuranceCount).toBeGreaterThan(0);

    // Verify other standard sectors are not 0
    expect(masterResult.sectorCensus['cafe']).toBeGreaterThan(0);
    expect(masterResult.sectorCensus['market']).toBeGreaterThan(0);
    expect(masterResult.sectorCensus['restaurant']).toBeGreaterThan(0);
    expect(masterResult.sectorCensus['pharmacy']).toBeGreaterThan(0);
    expect(masterResult.sectorCensus['real_estate']).toBeGreaterThan(0);
    expect(masterResult.sectorCensus['pet_shop']).toBeGreaterThan(0);

    // 2. Targeted query when user clicks 'insurance_agency' (Sigorta Acentesi)
    const targetedResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, 'insurance_agency');

    expect(targetedResult).toBeDefined();
    expect(targetedResult.allPois.length).toBe(initialInsuranceCount);
    expect(targetedResult.sectorCensus['insurance_agency']).toBe(initialInsuranceCount);

    // Ensure EVERY POI returned is an insurance agency
    for (const poi of targetedResult.allPois) {
      expect(poi.category).toBe('insurance_agency');
      expect(poi.lat).toBeDefined();
      expect(poi.lng).toBeDefined();
      expect(poi.distanceMeters).toBeLessThanOrEqual(radiusMeters);
    }
  });

  it('guarantees that clicking any category maintains 100% consistent sectorCensus count without jumping', async () => {
    const lat = 40.930;
    const lng = 29.135;
    const radiusMeters = 1500;
    const locationName = 'İstanbul — Maltepe / Bağlarbaşı';

    const masterResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, 'all');

    const testSectors = ['insurance_agency', 'real_estate', 'gym', 'car_wash', 'auto_gallery', 'florist'] as const;

    for (const sector of testSectors) {
      const initialCount = masterResult.sectorCensus[sector];
      expect(initialCount).toBeGreaterThanOrEqual(1);

      const categoryResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, sector);

      // Selected category POI count MUST MATCH the master census sector count exactly
      expect(categoryResult.allPois.length).toBe(initialCount);
      expect(categoryResult.sectorCensus[sector]).toBe(initialCount);
    }
  });
});
