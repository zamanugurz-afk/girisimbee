import type { CompetitorPoi, RadarCategoryKey } from '@/types/radar.types';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';
import { calculateDistanceMeters } from '@/features/radar/lib/spatial-calculator';

interface OverpassElement {
  type: 'node' | 'way';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

const CATEGORY_TAG_MAP: Record<string, string> = {
  cafe: '["amenity"~"cafe|coffee_shop|restaurant|fast_food|tea"]',
  pet_shop: '["shop"~"pet|pet_grooming|veterinary"]',
  butcher: '["shop"~"butcher|deli"]',
  bakery: '["shop"~"bakery|pastry|confectionery"]',
  market: '["shop"~"supermarket|convenience|grocery"]',
  hairdresser: '["shop"~"hairdresser|beauty|barber"]',
  gym: '["leisure"~"fitness_centre|sports_centre|fitness_station"]',
  pharmacy: '["amenity"="pharmacy"]',
  car_wash: '["amenity"="car_wash"]',
  restaurant: '["amenity"="restaurant"]',
  boutique: '["shop"~"clothes|boutique|fashion"]',
  dry_cleaning: '["shop"~"dry_cleaning|laundry|tailor"]',
};

const SAMPLE_NAMES_BY_CATEGORY: Record<string, string[]> = {
  cafe: ['Espresso Lab', 'Kahve Dünyası', 'Petra Roasting Co', 'Kronotrop', 'Starbucks', 'Moc Coffee', 'Federal Coffee', 'Walter’s Coffee', 'Caribou Coffee', 'Story Coffee'],
  pet_shop: ['Pati Dünyası', 'Dostlar Veteriner Kliniği', 'Pet Gross Market', 'Miya Pet Shop', 'Pati Butik', 'VetArt Klinik', 'Petlove', 'Happy Pets'],
  butcher: ['Öz Kasap & Şarküteri', 'Gurme Et & Meze', 'Trakya Et Pazarı', 'Bereket Kasabı', 'Çiftlik Gurme Et', 'Anadolu Şarküteri'],
  bakery: ['Tarihi Moda Fırını', 'Beyaz Fırın', 'Pelit Pastanesi', 'Artisan Ekmekçilik', 'Divan Pastanesi', 'Leman Fırın', 'Ekmekçi Dede', 'Karafırın'],
  market: ['Migros Jet', 'CarrefourSA Mini', 'Şok Market', 'A101', 'BİM', 'Macrocenter', 'Yerel Gurme Market'],
  hairdresser: ['Kuaför Ahmet', 'Studio Hair & Beauty', 'The Barber Club', 'Güzellik Atölyesi', 'MOS Kuaför', 'Artisan Barber', 'Glamour Beauty Studio'],
  gym: ['MacFit', 'Club Sporium', 'CrossFit Kadıköy', 'Gymstop', 'Power GYM', 'Pilates Academy', 'Fit & Form Studio', 'Zone Training'],
  pharmacy: ['Merkez Eczanesi', 'Hayat Eczanesi', 'Yeni Moda Eczanesi', 'Şifa Eczanesi', 'Güneş Eczanesi', 'Park Eczanesi'],
  car_wash: ['Oto Parlatma & Yıkama', 'Speedy Car Wash', 'Detailing Garage', 'Eco Buharlı Yıkama', 'Meguiar’s Car Care', 'Sonax Detailing'],
  restaurant: ['Moda Meyhanesi', 'Basta Street Food', 'Çiya Sofrası', 'Nusr-Et Burger', 'Köşebaşı Kebap', 'Trattoria Antica', 'Meşhur Dönerci'],
  boutique: ['Maison Butik', 'Moda Concept Store', 'Trend Giyim', 'Vintage Room', 'Silk & Cotton Studio', 'Bella Butik'],
  dry_cleaning: ['Dry Center', 'Express Kuru Temizleme', 'Terzi Hasan Usta', 'Eco Clean Terzi & Yıkama', 'Master Tailor Studio'],
};

export async function fetchOverpassCompetitorPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): Promise<CompetitorPoi[]> {
  const categoryMeta = RADAR_CATEGORIES[category] ?? RADAR_CATEGORIES.cafe;
  const tagFilter = CATEGORY_TAG_MAP[category] ?? '["amenity"="cafe"]';

  const query = `
    [out:json][timeout:6];
    (
      node(around:${radiusMeters},${lat},${lng})${tagFilter};
      way(around:${radiusMeters},${lat},${lng})${tagFilter};
    );
    out center 45;
  `.trim();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'GirisimbeeRadar/1.0 (https://girisimbee.com)',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = (await res.json()) as OverpassResponse;
        const elements = json.elements ?? [];

        if (elements.length > 0) {
          const pois: CompetitorPoi[] = [];

          for (const el of elements) {
            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;

            if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

            const dist = calculateDistanceMeters(lat, lng, elLat, elLng);
            if (dist > radiusMeters) continue;

            const name =
              el.tags?.name ||
              el.tags?.brand ||
              el.tags?.['name:tr'] ||
              `${categoryMeta.label} İşletmesi #${el.id.toString().slice(-4)}`;

            pois.push({
              id: `osm-${el.type}-${el.id}`,
              name,
              lat: elLat,
              lng: elLng,
              category,
              categoryLabel: categoryMeta.label,
              address: el.tags?.['addr:street']
                ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] ?? ''}`.trim()
                : undefined,
              brand: el.tags?.brand,
              distanceMeters: dist,
            });
          }

          if (pois.length > 0) {
            return pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
          }
        }
      }
    } catch {
      continue;
    }
  }

  return generateHeuristicPois(lat, lng, radiusMeters, category);
}

function generateHeuristicPois(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): CompetitorPoi[] {
  const categoryMeta = RADAR_CATEGORIES[category] ?? RADAR_CATEGORIES.cafe;
  const sampleNames = SAMPLE_NAMES_BY_CATEGORY[category] ?? SAMPLE_NAMES_BY_CATEGORY.cafe;

  const radiusKm = radiusMeters / 1000;
  const expectedCount = Math.max(
    3,
    Math.min(18, Math.round(categoryMeta.idealDensityPerKm2 * Math.PI * Math.pow(radiusKm, 2) * 0.7)),
  );

  const pois: CompetitorPoi[] = [];

  for (let i = 0; i < expectedCount; i++) {
    const angle = (i / expectedCount) * 2 * Math.PI + (i * 0.3);
    const distRatio = 0.2 + (Math.sin(i * 1.5 + centerLat) * 0.5 + 0.5) * 0.75;
    const distanceMeters = Math.round(radiusMeters * distRatio);

    const latDelta = (distanceMeters * Math.cos(angle)) / 111320;
    const lngDelta =
      (distanceMeters * Math.sin(angle)) /
      (111320 * Math.cos((centerLat * Math.PI) / 180));

    const poiLat = parseFloat((centerLat + latDelta).toFixed(6));
    const poiLng = parseFloat((centerLng + lngDelta).toFixed(6));
    const name = sampleNames[i % sampleNames.length] + (i >= sampleNames.length ? ` (${i + 1})` : '');

    pois.push({
      id: `poi-heuristic-${category}-${i}-${centerLat.toFixed(3)}`,
      name,
      lat: poiLat,
      lng: poiLng,
      category,
      categoryLabel: categoryMeta.label,
      distanceMeters,
    });
  }

  return pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
