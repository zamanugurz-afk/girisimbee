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
  const shop = (tags?.shop || '').toLowerCase();
  const amenity = (tags?.amenity || '').toLowerCase();
  const office = (tags?.office || '').toLowerCase();
  const leisure = (tags?.leisure || '').toLowerCase();
  const cuisine = (tags?.cuisine || '').toLowerCase();

  if (category === 'pet_shop') {
    return lowerName.includes('pet') || lowerName.includes('veteriner') || lowerName.includes('pati') || lowerName.includes('mama') || lowerName.includes('kedi') || lowerName.includes('köpek') || shop.includes('pet') || amenity.includes('veterinary');
  }
  if (category === 'market') {
    return lowerName.includes('market') || lowerName.includes('bakkal') || lowerName.includes('gıda') || lowerName.includes('büfe') || lowerName.includes('tekal') || lowerName.includes('tekel') || lowerName.includes('şok') || lowerName.includes('a101') || lowerName.includes('bim') || lowerName.includes('migros') || lowerName.includes('carrefour') || shop.includes('supermarket') || shop.includes('convenience') || shop.includes('grocery');
  }
  if (category === 'bakery') {
    return lowerName.includes('fırın') || lowerName.includes('firin') || lowerName.includes('pastane') || lowerName.includes('ekmek') || lowerName.includes('patisserie') || lowerName.includes('pasta') || lowerName.includes('unlu') || shop.includes('bakery') || shop.includes('pastry');
  }
  if (category === 'butcher') {
    return lowerName.includes('kasap') || lowerName.includes('şarküteri') || lowerName.includes('sarkuteri') || lowerName.includes('et') || lowerName.includes('tavuk') || shop.includes('butcher') || shop.includes('deli');
  }
  if (category === 'hairdresser') {
    return lowerName.includes('kuaför') || lowerName.includes('kuafor') || lowerName.includes('berber') || lowerName.includes('barber') || lowerName.includes('güzellik') || lowerName.includes('estetik') || lowerName.includes('nail') || lowerName.includes('hair') || shop.includes('hairdresser') || shop.includes('beauty');
  }
  if (category === 'pharmacy') {
    return lowerName.includes('eczane') || lowerName.includes('pharmacy') || amenity.includes('pharmacy');
  }
  if (category === 'gym') {
    return lowerName.includes('spor') || lowerName.includes('gym') || lowerName.includes('fitness') || lowerName.includes('pilates') || lowerName.includes('crossfit') || leisure.includes('fitness_centre') || leisure.includes('sports_centre');
  }
  if (category === 'car_wash') {
    return lowerName.includes('yıkama') || lowerName.includes('yikama') || lowerName.includes('car wash') || lowerName.includes('detailing') || amenity.includes('car_wash');
  }
  if (category === 'boutique') {
    return lowerName.includes('butik') || lowerName.includes('giyim') || lowerName.includes('moda') || lowerName.includes('boutique') || lowerName.includes('fashion') || shop.includes('clothes') || shop.includes('boutique');
  }
  if (category === 'dry_cleaning') {
    return lowerName.includes('kuru temizleme') || lowerName.includes('dry clean') || lowerName.includes('laundry') || shop.includes('dry_cleaning') || shop.includes('laundry');
  }
  if (category === 'insurance_agency') {
    return lowerName.includes('sigorta') || lowerName.includes('kasko') || lowerName.includes('acente') || lowerName.includes('allianz') || lowerName.includes('anadolu') || lowerName.includes('axa') || office.includes('insurance');
  }
  if (category === 'travel_agency') {
    return lowerName.includes('tur') || lowerName.includes('turizm') || lowerName.includes('seyahat') || lowerName.includes('travel') || lowerName.includes('bilet') || shop.includes('travel_agency');
  }
  if (category === 'real_estate') {
    return lowerName.includes('emlak') || lowerName.includes('gayrimenkul') || lowerName.includes('re/max') || lowerName.includes('turyap') || lowerName.includes('coldwell') || office.includes('estate_agent');
  }
  if (category === 'auto_gallery') {
    return lowerName.includes('galeri') || lowerName.includes('oto galeri') || lowerName.includes('otomotiv') || lowerName.includes('motors') || shop.includes('car');
  }
  if (category === 'stationery') {
    return lowerName.includes('kırtasiye') || lowerName.includes('kirtasiye') || lowerName.includes('kitap') || lowerName.includes('fotokopi') || shop.includes('stationery') || shop.includes('books');
  }
  if (category === 'florist') {
    return lowerName.includes('çiçek') || lowerName.includes('cicek') || lowerName.includes('florist') || shop.includes('florist');
  }
  if (category === 'optician') {
    return lowerName.includes('optik') || lowerName.includes('gözlük') || lowerName.includes('gozluk') || shop.includes('optician');
  }
  if (category === 'dental_clinic') {
    return lowerName.includes('diş') || lowerName.includes('dis') || lowerName.includes('dent') || lowerName.includes('dental') || amenity.includes('dentist');
  }
  if (category === 'kindergarten') {
    return lowerName.includes('kreş') || lowerName.includes('kres') || lowerName.includes('anaokulu') || amenity.includes('kindergarten');
  }
  if (category === 'law_firm') {
    return lowerName.includes('avukat') || lowerName.includes('hukuk') || lowerName.includes('law') || office.includes('lawyer');
  }
  if (category === 'software_agency') {
    return lowerName.includes('yazılım') || lowerName.includes('yazilim') || lowerName.includes('dijital') || lowerName.includes('ajans') || office.includes('it') || office.includes('company');
  }
  if (category === 'furniture') {
    return lowerName.includes('mobilya') || lowerName.includes('koltuk') || lowerName.includes('dekorasyon') || shop.includes('furniture');
  }
  if (category === 'electronics') {
    return lowerName.includes('elektronik') || lowerName.includes('telefon') || lowerName.includes('bilgisayar') || lowerName.includes('teknoloji') || shop.includes('electronics');
  }
  if (category === 'cigkofteci') {
    return lowerName.includes('çiğ') || lowerName.includes('cig') || lowerName.includes('komagene') || lowerName.includes('battalbey') || lowerName.includes('oses') || lowerName.includes('tatlıses') || lowerName.includes('adıyaman');
  }
  if (category === 'borekci') {
    return lowerName.includes('börek') || lowerName.includes('borek') || lowerName.includes('poğaça') || lowerName.includes('boyoz') || (shop.includes('bakery') && lowerName.includes('börek'));
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
    return lowerName.includes('tatlı') || lowerName.includes('baklava') || lowerName.includes('künefe') || lowerName.includes('kadayıf') || lowerName.includes('güllüoğlu') || lowerName.includes('lokum') || shop.includes('confectionery');
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
  if (category === 'cafe') {
    return lowerName.includes('kahve') || lowerName.includes('cafe') || lowerName.includes('coffee') || lowerName.includes('kafe') || lowerName.includes('espresso') || lowerName.includes('roaster') || lowerName.includes('çay') || lowerName.includes('roastery') || amenity.includes('cafe') || amenity.includes('coffee_shop');
  }
  if (category === 'restaurant') {
    return lowerName.includes('restoran') || lowerName.includes('restaurant') || lowerName.includes('lokanta') || lowerName.includes('meyhane') || lowerName.includes('bistro') || lowerName.includes('burger') || lowerName.includes('pizza') || lowerName.includes('köfte') || amenity.includes('restaurant') || amenity.includes('fast_food');
  }

  return false;
}

function inferCategoryForPoi(name: string, tags: Record<string, string> | undefined): { key: RadarCategoryKey; label: string } {
  const priorityKeys: RadarCategoryKey[] = [
    'pet_shop',
    'pharmacy',
    'butcher',
    'bakery',
    'hairdresser',
    'gym',
    'market',
    'dental_clinic',
    'car_wash',
    'cigkofteci',
    'borekci',
    'dondurmaci',
    'donerci',
    'tatlici',
    'kokorecci',
    'insurance_agency',
    'real_estate',
    'travel_agency',
    'boutique',
    'stationery',
    'florist',
    'optician',
    'kindergarten',
    'law_firm',
    'software_agency',
    'furniture',
    'electronics',
    'lastikci',
    'dry_cleaning',
    'cilingir',
    'balikci',
    'manav',
    'terzi',
    'oto_elektrik',
    'cafe',
    'restaurant',
  ];

  for (const key of priorityKeys) {
    if (matchesCategorySemantics(name, tags, key)) {
      const meta = RADAR_CATEGORIES[key] ?? RADAR_CATEGORIES.cafe;
      return { key, label: meta.label };
    }
  }

  const amenity = (tags?.amenity || '').toLowerCase();
  const shop = (tags?.shop || '').toLowerCase();

  if (amenity === 'cafe' || amenity === 'coffee_shop') return { key: 'cafe', label: 'Kafe & Kahve Dükkanı' };
  if (amenity === 'restaurant' || amenity === 'fast_food') return { key: 'restaurant', label: 'Restoran & Lokanta' };
  if (shop) return { key: 'market', label: 'Market & Mağaza' };

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
