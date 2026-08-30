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
  'https://z.overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

const EXCLUDED_AMENITIES = new Set([
  'school',
  'place_of_worship',
  'hospital',
  'bank',
  'fuel',
  'atm',
  'parking',
  'university',
  'college',
  'police',
  'fire_station',
  'post_office',
  'townhall',
  'courthouse',
  'grave_yard',
  'shelter',
  'toilets',
  'bench',
  'waste_basket',
  'recycling',
  'telephone',
]);

const CATEGORY_TAG_MAP: Record<string, string> = {
  cafe: '["amenity"~"cafe|coffee_shop"]',
  pet_shop: '["shop"~"pet|pet_grooming"]; node(around:RADIUS,LAT,LNG)["amenity"="veterinary"]; way(around:RADIUS,LAT,LNG)["amenity"="veterinary"]',
  butcher: '["shop"~"butcher|deli"]',
  bakery: '["shop"~"bakery|pastry|confectionery"]',
  market: '["shop"~"supermarket|convenience|grocery"]',
  hairdresser: '["shop"~"hairdresser|beauty|barber"]',
  gym: '["leisure"~"fitness_centre|sports_centre"]',
  pharmacy: '["amenity"="pharmacy"]',
  car_wash: '["amenity"="car_wash"]',
  restaurant: '["amenity"~"restaurant|fast_food"]',
  boutique: '["shop"~"clothes|boutique|fashion"]',
  dry_cleaning: '["shop"~"dry_cleaning|laundry|tailor"]',
  insurance_agency: '["office"="insurance"]',
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
  dondurmaci: '["amenity"="ice_cream"]',
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

function hasWord(text: string | undefined, words: string[]): boolean {
  if (!text) return false;
  const lower = ' ' + text.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, ' ') + ' ';
  return words.some((w) => lower.includes(' ' + w.toLowerCase() + ' '));
}

export function classifyPoi(
  name: string | undefined,
  tags: Record<string, string> | undefined,
): { key: RadarCategoryKey; label: string } {
  const n = name || '';
  const amenity = (tags?.amenity || '').toLowerCase();
  const shop = (tags?.shop || '').toLowerCase();
  const office = (tags?.office || '').toLowerCase();
  const leisure = (tags?.leisure || '').toLowerCase();
  const craft = (tags?.craft || '').toLowerCase();

  // 1. Petshop & Veteriner
  if (
    amenity === 'veterinary' ||
    shop === 'pet' ||
    shop === 'pet_grooming' ||
    hasWord(n, ['veteriner', 'veterineri', 'petshop', 'pet', 'pati', 'mamacı', 'veterinerlik', 'vet'])
  ) {
    return { key: 'pet_shop', label: 'Petshop & Veteriner' };
  }

  // 2. Eczane
  if (amenity === 'pharmacy' || hasWord(n, ['eczane', 'eczanesi', 'pharmacy'])) {
    return { key: 'pharmacy', label: 'Eczane & Medikal' };
  }

  // 3. Fırın & Unlu Mamüller
  if (
    shop === 'bakery' ||
    shop === 'pastry' ||
    hasWord(n, ['fırın', 'fırını', 'firin', 'pastane', 'pastanesi', 'patisserie', 'unlu mamüller', 'unlu mamulleri', 'ekmek'])
  ) {
    return { key: 'bakery', label: 'Fırın & Unlu Mamüller' };
  }

  // 4. Kasap & Şarküteri
  if (
    shop === 'butcher' ||
    shop === 'deli' ||
    hasWord(n, ['kasap', 'kasabı', 'şarküteri', 'sarkuteri', 'et pazarı', 'et reyonu'])
  ) {
    return { key: 'butcher', label: 'Kasap & Şarküteri' };
  }

  // 5. Süpermarket & Bakkal
  if (
    shop === 'supermarket' ||
    shop === 'convenience' ||
    shop === 'grocery' ||
    hasWord(n, ['market', 'marketi', 'bakkal', 'bakkalı', 'büfe', 'büfesi', 'gıda', 'şok', 'a101', 'bim', 'migros', 'carrefour', 'carrefoursa', 'tarım kredi', 'file', 'macrocenter', 'gross'])
  ) {
    return { key: 'market', label: 'Süpermarket & Bakkal' };
  }

  // 6. Kuaför & Berber & Güzellik
  if (
    shop === 'hairdresser' ||
    shop === 'beauty' ||
    hasWord(n, ['kuaför', 'kuafor', 'kuaförü', 'berber', 'berberi', 'güzellik', 'güzellik merkezi', 'barber', 'barbershop', 'nail', 'estetik', 'saç tasarım'])
  ) {
    return { key: 'hairdresser', label: 'Kuaför & Güzellik' };
  }

  // 7. Oto Lastikçi
  if (
    shop === 'tyres' ||
    hasWord(n, ['lastik', 'lastikçi', 'lastikcisi', 'rot balans', 'oto lastik', 'lassa', 'bridgestone', 'michelin', 'goodyear', 'continental', 'pirelli', 'petlas'])
  ) {
    return { key: 'lastikci', label: 'Oto Lastikçi & Rot Balans' };
  }

  // 8. Oto Yıkama & Detailing
  if (
    amenity === 'car_wash' ||
    hasWord(n, ['oto yıkama', 'oto yikama', 'car wash', 'detailing', 'buharlı yıkama', 'oto kuaför'])
  ) {
    return { key: 'car_wash', label: 'Oto Yıkama & Detailing' };
  }

  // 9. Spor Salonu & Fitness
  if (
    leisure === 'fitness_centre' ||
    leisure === 'sports_centre' ||
    hasWord(n, ['gym', 'fitness', 'pilates', 'crossfit', 'spor salonu', 'macfit', 'fizyoterapi', 'yoga'])
  ) {
    return { key: 'gym', label: 'Spor Salonu & Fitness' };
  }

  // 10. Diş Kliniği
  if (amenity === 'dentist' || hasWord(n, ['diş', 'diş kliniği', 'diş hekimi', 'dental', 'dentistanbul', 'dentgroup', 'dent'])) {
    return { key: 'dental_clinic', label: 'Diş Kliniği & Hekimliği' };
  }

  // 11. Börekçi
  if (hasWord(n, ['börek', 'böreği', 'börekçi', 'borek', 'borekci', 'kır pidesi', 'poğaça', 'boyoz'])) {
    return { key: 'borekci', label: 'Börekçi & Poğaçacı' };
  }

  // 12. Çiğ Köfteci
  if (hasWord(n, ['çiğ köfte', 'çiğköfte', 'cig kofte', 'cigkofte', 'komagene', 'battalbey', 'oses', 'tatlıses', 'adıyaman'])) {
    return { key: 'cigkofteci', label: 'Çiğ Köfteci' };
  }

  // 13. Dondurmacı
  if (amenity === 'ice_cream' || hasWord(n, ['dondurma', 'dondurmacı', 'dondurmacisi', 'gelato', 'waffle', 'mado'])) {
    return { key: 'dondurmaci', label: 'Dondurmacı & Waffle' };
  }

  // 14. Dönerci & Kebapçı
  if (hasWord(n, ['döner', 'dönerci', 'doner', 'donerci', 'kebap', 'kebapçı', 'iskender', 'dürüm', 'adana kebap', 'urfa kebap'])) {
    return { key: 'donerci', label: 'Dönerci & Kebapçı' };
  }

  // 15. Tatlıcı & Baklavacı
  if (hasWord(n, ['tatlı', 'tatlıcı', 'tatlicisi', 'baklava', 'baklavacı', 'künefe', 'kadayıf', 'güllüoğlu', 'lokum', 'hafız mustafa', 'helvacı'])) {
    return { key: 'tatlici', label: 'Tatlıcı & Baklavacı' };
  }

  // 16. Kafe & Kahve
  if (
    amenity === 'cafe' ||
    amenity === 'coffee_shop' ||
    hasWord(n, ['kahve', 'kahvesi', 'cafe', 'coffee', 'kafe', 'espresso', 'roaster', 'roastery', 'starbucks', 'kahve dünyası', 'espresso lab', 'çay bahçesi', 'çay ocağı', 'hookah', 'nargile'])
  ) {
    return { key: 'cafe', label: 'Kafe & Kahve Dükkanı' };
  }

  // 17. Restoran & Lokanta
  if (
    amenity === 'restaurant' ||
    amenity === 'fast_food' ||
    hasWord(n, ['restoran', 'restaurant', 'lokanta', 'lokantası', 'meyhane', 'bistro', 'burger', 'pizza', 'köfte', 'çorba', 'çorbacı', 'pide', 'balıkçı', 'steakhouse'])
  ) {
    return { key: 'restaurant', label: 'Restoran & Lokanta' };
  }

  // 18. Sigorta Acentesi
  if (
    office === 'insurance' ||
    hasWord(n, ['sigorta', 'sigortası', 'sigorta acentesi', 'kasko', 'allianz', 'anadolu sigorta', 'axa sigorta', 'aksigorta', 'sompo', 'hdi', 'neova', 'quick sigorta'])
  ) {
    return { key: 'insurance_agency', label: 'Sigorta Acentesi' };
  }

  // 19. Gayrimenkul & Emlak
  if (
    office === 'estate_agent' ||
    hasWord(n, ['emlak', 'emlakçılık', 'gayrimenkul', 're/max', 'remax', 'coldwell', 'turyap', 'keller williams', 'cb'])
  ) {
    return { key: 'real_estate', label: 'Gayrimenkul Danışmanlığı' };
  }

  // 20. Butik & Giyim
  if (
    shop === 'clothes' ||
    shop === 'boutique' ||
    shop === 'fashion' ||
    hasWord(n, ['butik', 'giyim', 'moda', 'tekstil', 'boutique', 'lingerie', 'ayakkabı', 'çanta', 'abiye'])
  ) {
    return { key: 'boutique', label: 'Butik & Giyim Mağazası' };
  }

  // 21. Kırtasiye
  if (
    shop === 'stationery' ||
    shop === 'books' ||
    hasWord(n, ['kırtasiye', 'kirtasiye', 'kitabevi', 'kitapçı', 'fotokopi', 'd&r', 'nezih', 'ozalit'])
  ) {
    return { key: 'stationery', label: 'Kırtasiye & Kitabevi' };
  }

  // 22. Çiçekçi
  if (shop === 'florist' || hasWord(n, ['çiçek', 'çiçekçi', 'cicek', 'cicekci', 'florist', 'botanika', 'peyzaj'])) {
    return { key: 'florist', label: 'Çiçekçi & Botanik' };
  }

  // 23. Optik
  if (shop === 'optician' || hasWord(n, ['optik', 'gözlük', 'gozluk', 'optisyen', 'atasun', 'optikçi'])) {
    return { key: 'optician', label: 'Optik & Gözlükçü' };
  }

  // 24. Manav
  if (shop === 'greengrocer' || hasWord(n, ['manav', 'manavı', 'sebze', 'meyve', 'organik pazar', 'halk manavı'])) {
    return { key: 'manav', label: 'Manav & Organik Pazar' };
  }

  // 25. Çilingir
  if (shop === 'locksmith' || craft === 'locksmith' || hasWord(n, ['çilingir', 'cilingir', 'anahtarcı', 'anahtar', 'kilit'])) {
    return { key: 'cilingir', label: 'Çilingir & Anahtarcı' };
  }

  // 26. Terzi
  if (shop === 'tailor' || craft === 'tailor' || hasWord(n, ['terzi', 'terzisi', 'dikim', 'tadilat', 'kuru temizleme'])) {
    return { key: 'terzi', label: 'Terzi & Kuru Temizleme' };
  }

  // 27. Mobilya
  if (shop === 'furniture' || hasWord(n, ['mobilya', 'koltuk', 'yatak', 'dekorasyon', 'bellona', 'istikbal', 'doğtaş', 'kelebek'])) {
    return { key: 'furniture', label: 'Mobilya & Ev Dekorasyon' };
  }

  // 28. Elektronik
  if (shop === 'electronics' || hasWord(n, ['elektronik', 'telefon', 'bilgisayar', 'teknoloji', 'gsm', 'tamir', 'turkcell', 'vodafone', 'türk telekom'])) {
    return { key: 'electronics', label: 'Elektronik & GSM' };
  }

  // 29. Avukat & Hukuk
  if (office === 'lawyer' || hasWord(n, ['avukat', 'hukuk', 'arabuluculuk', 'law'])) {
    return { key: 'law_firm', label: 'Hukuk & Avukatlık Bürosu' };
  }

  // 30. Anaokulu
  if (amenity === 'kindergarten' || hasWord(n, ['kreş', 'kres', 'anaokulu', 'gündüz bakımevi'])) {
    return { key: 'kindergarten', label: 'Anaokulu & Kreş' };
  }

  // Fallbacks
  if (shop) return { key: 'market', label: 'Perakende & Mağaza' };
  if (amenity) return { key: 'restaurant', label: 'Yeme & İçme' };
  if (office) return { key: 'software_agency', label: 'Ofis & Danışmanlık' };

  return { key: 'cafe', label: 'Ticari İşletme' };
}

const POI_QUERY_CACHE = new Map<string, { data: CompetitorPoi[]; ts: number }>();
const CACHE_TTL_MS = 1000 * 60 * 3; // 3 minutes

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

  let query = '';
  if (isAll) {
    const amenityRegex = 'cafe|restaurant|fast_food|pharmacy|dentist|veterinary|car_wash|ice_cream|bar|pub';
    const shopRegex = 'supermarket|convenience|grocery|bakery|pastry|butcher|hairdresser|beauty|tyres|pet|clothes|boutique|stationery|florist|optician|furniture|electronics|locksmith|greengrocer|seafood|tailor|confectionery|car_repair';
    const officeRegex = 'insurance|estate_agent|lawyer|company|it';
    const leisureRegex = 'fitness_centre|sports_centre';

    query = `
      [out:json][timeout:5];
      (
        node(around:${radiusMeters},${lat},${lng})["amenity"~"${amenityRegex}"];
        node(around:${radiusMeters},${lat},${lng})["shop"~"${shopRegex}"];
        node(around:${radiusMeters},${lat},${lng})["office"~"${officeRegex}"];
        node(around:${radiusMeters},${lat},${lng})["leisure"~"${leisureRegex}"];
        way(around:${radiusMeters},${lat},${lng})["amenity"~"${amenityRegex}"];
        way(around:${radiusMeters},${lat},${lng})["shop"~"${shopRegex}"];
        way(around:${radiusMeters},${lat},${lng})["office"~"${officeRegex}"];
      );
      out center 120;
    `.trim();
  } else {
    const rawTagFilter = CATEGORY_TAG_MAP[category] ?? '["amenity"~"cafe|restaurant"]';
    const tagFilter = rawTagFilter
      .replace(/RADIUS/g, String(radiusMeters))
      .replace(/LAT/g, String(lat))
      .replace(/LNG/g, String(lng));

    query = `
      [out:json][timeout:4];
      (
        node(around:${radiusMeters},${lat},${lng})${tagFilter};
        way(around:${radiusMeters},${lat},${lng})${tagFilter};
      );
      out center 80;
    `.trim();
  }

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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
          const tags = el.tags || {};
          const amenity = (tags.amenity || '').toLowerCase();

          // 1. Exclude public and non-commercial entities
          if (EXCLUDED_AMENITIES.has(amenity)) continue;

          // 2. Must have recognized commercial tag or named entity
          const hasCommercialTag =
            tags.shop ||
            (tags.amenity && !EXCLUDED_AMENITIES.has(amenity)) ||
            tags.office ||
            tags.craft ||
            (tags.leisure && tags.leisure.includes('fitness'));
          if (!hasCommercialTag && !tags.name) continue;

          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

          const dist = calculateDistanceMeters(lat, lng, elLat, elLng);
          if (dist > radiusMeters) continue;

          const rawName = tags.name || tags.brand || tags['name:tr'];
          const classified = classifyPoi(rawName, tags);

          if (!isAll && classified.key !== category) {
            continue;
          }

          const displayName = rawName || `${classified.label} İşletmesi`;

          pois.push({
            id: `osm-${el.type}-${el.id}`,
            name: displayName,
            lat: elLat,
            lng: elLng,
            category: classified.key,
            categoryLabel: classified.label,
            address: tags['addr:street']
              ? `${tags['addr:street']} ${tags['addr:housenumber'] ?? ''}`.trim()
              : undefined,
            brand: tags.brand,
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

  // Run 'all' query to obtain complete sector distribution
  const allPois = await fetchOverpassCompetitorPois(lat, lng, radiusMeters, 'all');
  const counts: Record<string, number> = {};

  for (const p of allPois) {
    if (p.category && p.category !== 'all') {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  }

  SECTOR_COUNTS_CACHE.set(cacheKey, { data: counts, ts: Date.now() });
  return counts;
}
