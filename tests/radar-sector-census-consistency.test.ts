import { describe, it, expect } from 'vitest';
import {
  fetchMasterAreaPoiCensus,
  fetchCompetitorPois,
} from '@/features/radar/services/overpass-poi.service';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';

describe('Investment Radar — Sector Census & Consistency Regression Test', () => {
  it(
    'guarantees that initial master area census computes non-zero realistic counts for standard urban sectors',
    async () => {
      // Coordinates for İstanbul — Kadıköy / Moda commercial center
      const lat = 40.988;
      const lng = 29.029;
      const radiusMeters = 500;
      const locationName = 'İstanbul — Kadıköy / Moda';

      // 1. Initial master area census (when category is 'all')
      const masterResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, 'all');

      expect(masterResult).toBeDefined();
      expect(masterResult.sectorCensus).toBeDefined();
      expect(masterResult.allPois.length).toBeGreaterThan(0);

      // Verify core municipal sectors are present in real urban OSM data
      expect(masterResult.sectorCensus['cafe']).toBeGreaterThan(0);
      expect(masterResult.sectorCensus['market']).toBeGreaterThan(0);
      expect(masterResult.sectorCensus['restaurant']).toBeGreaterThan(0);
      expect(masterResult.sectorCensus['pharmacy']).toBeGreaterThan(0);

      // 2. Targeted query for 'cafe'
      const initialCafeCount = masterResult.sectorCensus['cafe'];
      const targetedResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, 'cafe');

      expect(targetedResult).toBeDefined();
      expect(targetedResult.allPois.length).toBe(initialCafeCount);
      expect(targetedResult.sectorCensus['cafe']).toBe(initialCafeCount);

      // Ensure EVERY POI returned is a cafe
      for (const poi of targetedResult.allPois) {
        expect(poi.category).toBe('cafe');
        expect(poi.lat).toBeDefined();
        expect(poi.lng).toBeDefined();
        expect(poi.distanceMeters).toBeLessThanOrEqual(radiusMeters);
      }
    },
    45000,
  );

  it(
    'guarantees that clicking any category maintains 100% consistent sectorCensus count without jumping',
    async () => {
      const lat = 40.923;
      const lng = 29.131;
      const radiusMeters = 500;
      const locationName = 'İstanbul — Maltepe / Çarşı';

      const masterResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, 'all');
      expect(masterResult.allPois.length).toBeGreaterThan(0);

      // Pick sectors that exist in this area
      const activeSectors = (['market', 'pharmacy', 'cafe', 'restaurant'] as const).filter(
        (s) => (masterResult.sectorCensus[s] || 0) > 0,
      );

      expect(activeSectors.length).toBeGreaterThan(0);

      for (const sector of activeSectors) {
        const initialCount = masterResult.sectorCensus[sector];
        expect(initialCount).toBeGreaterThan(0);

        const categoryResult = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, sector);

        // Selected category POI count MUST MATCH the master census sector count exactly
        expect(categoryResult.allPois.length).toBe(initialCount);
        expect(categoryResult.sectorCensus[sector]).toBe(initialCount);
      }
    },
    45000,
  );
});
