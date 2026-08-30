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
  insurance_agency: '["office"~"insurance|financial"]',
  travel_agency: '["shop"="travel_agency"]',
  real_estate: '["office"="estate_agent"]',
  auto_gallery: '["shop"~"car|car_repair|car_parts"]',
  stationery: '["shop"~"stationery|books"]',
  florist: '["shop"="florist"]',
  optician: '["shop"="optician"]',
  dental_clinic: '["amenity"="dentist"]',
  kindergarten: '["amenity"="kindergarten"]',
  law_firm: '["office"="lawyer"]',
  software_agency: '["office"~"it|company"]',
  furniture: '["shop"="furniture"]',
  electronics: '["shop"="electronics"]',
  borekci: '["shop"~"bakery|pastry"]',
  dondurmaci: '["amenity"~"ice_cream|cafe"]',
  lastikci: '["shop"~"tyres|car_repair"]',
  cigkofteci: '["amenity"~"fast_food|restaurant"]',
  tatlici: '["shop"~"confectionery|pastry|bakery"]',
  donerci: '["amenity"~"restaurant|fast_food"]',
  kokorecci: '["amenity"~"fast_food|restaurant"]',
  cilingir: '["shop"="locksmith"]',
  balikci: '["shop"="seafood"]',
  manav: '["shop"="greengrocer"]',
  terzi: '["shop"="tailor"]',
  oto_elektrik: '["shop"~"car_repair|car_parts"]',
};

function matchesCategorySemantics(
  name: string,
  tags: Record<string, string> | undefined,
  category: RadarCategoryKey,
): boolean {
  const lowerName = (name || '').toLowerCase();
  const cuisine = (tags?.cuisine || '').toLowerCase();
  const shop = (tags?.shop || '').toLowerCase();
  const amenity = (tags?.amenity || '').toLowerCase();
  const office = (tags?.office || '').toLowerCase();

  if (category === 'pet_shop') {
    return lowerName.includes('pet') || lowerName.includes('veteriner') || lowerName.includes('pati') || lowerName.includes('mama') || lowerName.includes('kedi') || lowerName.includes('köpek') || shop.includes('pet') || amenity.includes('veterinary');
  }
  if (category === 'cigkofteci') {
    return lowerName.includes('çiğ') || lowerName.includes('cig') || lowerName.includes('komagene') || lowerName.includes('battalbey') || lowerName.includes('oses') || lowerName.includes('tatlıses') || lowerName.includes('adıyaman');
  }
  if (category === 'borekci') {
    return lowerName.includes('börek') || lowerName.includes('borek') || lowerName.includes('poğaça') || lowerName.includes('boyoz') || shop.includes('bakery') || shop.includes('pastry');
  }
  if (category === 'dondurmaci') {
    return lowerName.includes('dondurma') || lowerName.includes('gelato') || lowerName.includes('waffle') || lowerName.includes('mado') || cuisine.includes('ice_cream') || amenity.includes('ice_cream');
  }
  if (category === 'lastikci') {
    return lowerName.includes('lastik') || lowerName.includes('rot') || lowerName.includes('balans') || lowerName.includes('jant') || lowerName.includes('lassa') || lowerName.includes('michelin') || lowerName.includes('bridgestone') || shop.includes('tyres');
  }
  if (category === 'donerci') {
    return lowerName.includes('döner') || lowerName.includes('doner') || lowerName.includes('iskender') || lowerName.includes('kebap') || lowerName.includes('dürüm');
  }
  if (category === 'kokorecci') {
    return lowerName.includes('kokoreç') || lowerName.includes('kokorec') || lowerName.includes('midye');
  }
  if (category === 'tatlici') {
    return lowerName.includes('tatlı') || lowerName.includes('baklava') || lowerName.includes('künefe') || lowerName.includes('kadayıf') || lowerName.includes('güllüoğlu') || lowerName.includes('lokum') || shop.includes('confectionery') || shop.includes('pastry');
  }
  if (category === 'insurance_agency') {
    return lowerName.includes('sigorta') || lowerName.includes('kasko') || lowerName.includes('acente') || lowerName.includes('allianz') || lowerName.includes('anadolu') || lowerName.includes('axa') || office.includes('insurance');
  }
  if (category === 'travel_agency') {
    return lowerName.includes('tur') || lowerName.includes('turizm') || lowerName.includes('seyahat') || lowerName.includes('travel') || lowerName.includes('bilet') || shop.includes('travel_agency');
  }
  if (category === 'butcher') {
    return lowerName.includes('kasap') || lowerName.includes('şarküteri') || lowerName.includes('et') || lowerName.includes('tavuk') || shop.includes('butcher') || shop.includes('deli');
  }
  if (category === 'cilingir') {
    return lowerName.includes('çilingir') || lowerName.includes('anahtar') || lowerName.includes('kilit') || shop.includes('locksmith');
  }
  if (category === 'balikci') {
    return lowerName.includes('balık') || lowerName.includes('balik') || lowerName.includes('hamsi') || shop.includes('seafood');
  }
  if (category === 'manav') {
    return lowerName.includes('manav') || lowerName.includes('sebze') || lowerName.includes('meyve') || shop.includes('greengrocer');
  }
  if (category === 'terzi') {
    return lowerName.includes('terzi') || lowerName.includes('dikim') || lowerName.includes('tadilat') || shop.includes('tailor');
  }
  if (category === 'oto_elektrik') {
    return lowerName.includes('elektrik') || lowerName.includes('akü') || lowerName.includes('aku') || lowerName.includes('klima') || lowerName.includes('marş');
  }

  return true;
}

function inferCategoryForPoi(name: string, tags: Record<string, string> | undefined): { key: RadarCategoryKey; label: string } {
  for (const [key, meta] of Object.entries(RADAR_CATEGORIES)) {
    if (matchesCategorySemantics(name, tags, key as RadarCategoryKey)) {
      return { key: key as RadarCategoryKey, label: meta.label };
    }
  }
  const amenity = tags?.amenity;
  const shop = tags?.shop;
  if (amenity) return { key: 'restaurant', label: 'Yeme & İçme' };
  if (shop) return { key: 'market', label: 'Perakende & Mağaza' };
  return { key: 'cafe', label: 'Ticari İşletme' };
}

const POI_QUERY_CACHE = new Map<string, { data: CompetitorPoi[]; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

export async function fetchOverpassCompetitorPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): Promise<CompetitorPoi[]> {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `${roundedLat}-${roundedLng}-${radiusMeters}-${category}`;

  const cached = POI_QUERY_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const isAll = category === 'all' || !category;
  const categoryMeta = isAll
    ? { label: 'Tüm İşletmeler', idealDensityPerKm2: 45 }
    : (RADAR_CATEGORIES[category] ?? RADAR_CATEGORIES.cafe);

  const tagFilter = isAll
    ? '["amenity"]; node(around:' + radiusMeters + ',' + lat + ',' + lng + ')["shop"]; node(around:' + radiusMeters + ',' + lat + ',' + lng + ')["office"]'
    : (CATEGORY_TAG_MAP[category] ?? '["amenity"="cafe"]');

  const query = `
    [out:json][timeout:3];
    (
      node(around:${radiusMeters},${lat},${lng})${tagFilter};
      way(around:${radiusMeters},${lat},${lng})${tagFilter};
    );
    out center 80;
  `.trim();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

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
        const pois: CompetitorPoi[] = [];

        for (const el of elements) {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;

          if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

          const dist = calculateDistanceMeters(lat, lng, elLat, elLng);
          if (dist > radiusMeters) continue;

          const rawName =
            el.tags?.name ||
            el.tags?.brand ||
            el.tags?.['name:tr'];

          let poiCategory = category;
          let poiCategoryLabel = categoryMeta.label;

          if (isAll) {
            const inferred = inferCategoryForPoi(rawName || '', el.tags);
            poiCategory = inferred.key;
            poiCategoryLabel = inferred.label;
          } else if (rawName && !matchesCategorySemantics(rawName, el.tags, category)) {
            continue;
          }

          const displayName = rawName || `${poiCategoryLabel} İşletmesi`;

          pois.push({
            id: `osm-${el.type}-${el.id}`,
            name: displayName,
            lat: elLat,
            lng: elLng,
            category: poiCategory,
            categoryLabel: poiCategoryLabel,
            address: el.tags?.['addr:street']
              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] ?? ''}`.trim()
              : undefined,
            brand: el.tags?.brand,
            distanceMeters: dist,
          });
        }

        const sorted = pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
        POI_QUERY_CACHE.set(cacheKey, { data: sorted, ts: Date.now() });
        return sorted;
      }
    } catch {
      continue;
    }
  }

  POI_QUERY_CACHE.set(cacheKey, { data: [], ts: Date.now() });
  return [];
}

const SECTOR_COUNTS_CACHE = new Map<string, { data: Record<string, number>; ts: number }>();

export async function fetchAreaSectorCounts(
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<Record<string, number>> {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `sectors-${roundedLat}-${roundedLng}-${radiusMeters}`;

  const cached = SECTOR_COUNTS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const query = `
    [out:json][timeout:3];
    (
      node(around:${radiusMeters},${lat},${lng})["amenity"];
      node(around:${radiusMeters},${lat},${lng})["shop"];
      node(around:${radiusMeters},${lat},${lng})["office"];
    );
    out tags 120;
  `.trim();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

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
        const counts: Record<string, number> = {};

        for (const el of elements) {
          const rawName = el.tags?.name || el.tags?.brand || el.tags?.['name:tr'] || '';
          const amenity = (el.tags?.amenity || '').toLowerCase();
          const shop = (el.tags?.shop || '').toLowerCase();
          const office = (el.tags?.office || '').toLowerCase();
          const leisure = (el.tags?.leisure || '').toLowerCase();

          // Direct tag checks first
          if (amenity === 'cafe' || amenity === 'coffee_shop') counts.cafe = (counts.cafe || 0) + 1;
          else if (amenity === 'pharmacy') counts.pharmacy = (counts.pharmacy || 0) + 1;
          else if (amenity === 'dentist') counts.dental_clinic = (counts.dental_clinic || 0) + 1;
          else if (amenity === 'restaurant') counts.restaurant = (counts.restaurant || 0) + 1;
          else if (amenity === 'car_wash') counts.car_wash = (counts.car_wash || 0) + 1;
          else if (shop === 'supermarket' || shop === 'convenience' || shop === 'grocery') counts.market = (counts.market || 0) + 1;
          else if (shop === 'bakery' || shop === 'pastry') counts.bakery = (counts.bakery || 0) + 1;
          else if (shop === 'butcher') counts.butcher = (counts.butcher || 0) + 1;
          else if (shop === 'hairdresser' || shop === 'barber' || shop === 'beauty') counts.hairdresser = (counts.hairdresser || 0) + 1;
          else if (shop === 'pet' || amenity === 'veterinary') counts.pet_shop = (counts.pet_shop || 0) + 1;
          else if (shop === 'clothes' || shop === 'boutique') counts.boutique = (counts.boutique || 0) + 1;
          else if (leisure === 'fitness_centre' || leisure === 'sports_centre') counts.gym = (counts.gym || 0) + 1;
          else if (office === 'insurance') counts.insurance_agency = (counts.insurance_agency || 0) + 1;
          else if (office === 'estate_agent') counts.real_estate = (counts.real_estate || 0) + 1;
          else if (office === 'lawyer') counts.law_firm = (counts.law_firm || 0) + 1;
          else {
            for (const [catKey] of Object.entries(RADAR_CATEGORIES)) {
              if (matchesCategorySemantics(rawName, el.tags, catKey as RadarCategoryKey)) {
                counts[catKey] = (counts[catKey] || 0) + 1;
                break;
              }
            }
          }
        }

        SECTOR_COUNTS_CACHE.set(cacheKey, { data: counts, ts: Date.now() });
        return counts;
      }
    } catch {
      continue;
    }
  }

  return {};
}
