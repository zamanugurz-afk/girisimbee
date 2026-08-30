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

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  cafe: ['["amenity"~"cafe|coffee_shop|ice_cream|bistro"]', '["shop"~"coffee|tea"]'],
  pet_shop: ['["shop"~"pet|pet_grooming"]', '["amenity"="veterinary"]'],
  butcher: ['["shop"~"butcher|deli"]'],
  bakery: ['["shop"~"bakery|pastry|confectionery"]'],
  market: ['["shop"~"supermarket|convenience|grocery"]'],
  hairdresser: ['["shop"~"hairdresser|beauty|barber"]'],
  gym: ['["leisure"~"fitness_centre|sports_centre"]'],
  pharmacy: ['["amenity"="pharmacy"]'],
  car_wash: ['["amenity"="car_wash"]'],
  restaurant: ['["amenity"~"restaurant|fast_food|food_court|bistro"]'],
  boutique: ['["shop"~"clothes|boutique|fashion"]'],
  dry_cleaning: ['["shop"~"dry_cleaning|laundry|tailor"]'],
  insurance_agency: ['["office"="insurance"]'],
  travel_agency: ['["shop"="travel_agency"]'],
  real_estate: ['["office"="estate_agent"]'],
  auto_gallery: ['["shop"~"car|car_repair|car_parts"]'],
  stationery: ['["shop"~"stationery|books"]'],
  florist: ['["shop"="florist"]'],
  optician: ['["shop"="optician"]'],
  dental_clinic: ['["amenity"="dentist"]'],
  kindergarten: ['["amenity"="kindergarten"]'],
  law_firm: ['["office"="lawyer"]'],
  software_agency: ['["office"~"it|company"]'],
  furniture: ['["shop"="furniture"]'],
  electronics: ['["shop"="electronics"]'],
  borekci: ['["shop"~"bakery|pastry"]'],
  dondurmaci: ['["amenity"="ice_cream"]'],
  lastikci: ['["shop"~"tyres|car_repair"]'],
  cigkofteci: ['["amenity"~"fast_food|restaurant"]'],
  tatlici: ['["shop"~"confectionery|pastry|bakery"]'],
  donerci: ['["amenity"~"restaurant|fast_food"]'],
  kokorecci: ['["amenity"~"fast_food|restaurant"]'],
  cilingir: ['["shop"="locksmith"]'],
  balikci: ['["shop"="seafood"]'],
  manav: ['["shop"="greengrocer"]'],
  terzi: ['["shop"="tailor"]'],
  oto_elektrik: ['["shop"~"car_repair|car_parts"]'],
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
    hasWord(n, ['fırın', 'fırını', 'firin', 'pastane', 'pastanesi', 'patisserie', 'unlu mamüller', 'unlu mamulleri', 'ekmek', 'simit', 'simitçi'])
  ) {
    return { key: 'bakery', label: 'Fırın & Unlu Mamüller' };
  }

  // 4. Kasap & Şarküteri
  if (
    shop === 'butcher' ||
    shop === 'deli' ||
    hasWord(n, ['kasap', 'kasabı', 'şarküteri', 'sarkuteri', 'et pazarı', 'et reyonu', 'tavukçu', 'et tavuk'])
  ) {
    return { key: 'butcher', label: 'Kasap & Şarküteri' };
  }

  // 5. Süpermarket & Bakkal
  if (
    shop === 'supermarket' ||
    shop === 'convenience' ||
    shop === 'grocery' ||
    hasWord(n, ['market', 'marketi', 'bakkal', 'bakkalı', 'büfe', 'büfesi', 'gıda', 'tekel', 'şok', 'a101', 'bim', 'migros', 'carrefour', 'carrefoursa', 'tarım kredi', 'file', 'macrocenter', 'gross'])
  ) {
    return { key: 'market', label: 'Süpermarket & Bakkal' };
  }

  // 6. Kuaför & Berber & Güzellik
  if (
    shop === 'hairdresser' ||
    shop === 'beauty' ||
    hasWord(n, ['kuaför', 'kuafor', 'kuaförü', 'berber', 'berberi', 'güzellik', 'güzellik merkezi', 'güzellik salonu', 'barber', 'barbershop', 'nail', 'estetik', 'saç tasarım'])
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
    hasWord(n, ['oto yıkama', 'oto yikama', 'car wash', 'detailing', 'buharlı yıkama', 'oto kuaför', 'pasta cila'])
  ) {
    return { key: 'car_wash', label: 'Oto Yıkama & Detailing' };
  }

  // 9. Spor Salonu & Fitness
  if (
    leisure === 'fitness_centre' ||
    leisure === 'sports_centre' ||
    hasWord(n, ['gym', 'fitness', 'pilates', 'crossfit', 'spor salonu', 'macfit', 'fizyoterapi', 'yoga', 'boks', 'kick boks'])
  ) {
    return { key: 'gym', label: 'Spor Salonu & Fitness' };
  }

  // 10. Diş Kliniği
  if (amenity === 'dentist' || hasWord(n, ['diş', 'diş kliniği', 'diş hekimi', 'dental', 'dentistanbul', 'dentgroup', 'dent', 'ağız ve diş', 'implant'])) {
    return { key: 'dental_clinic', label: 'Diş Kliniği & Hekimliği' };
  }

  // 11. Börekçi
  if (hasWord(n, ['börek', 'böreği', 'börekçi', 'borek', 'borekci', 'kır pidesi', 'poğaça', 'boyoz', 'su böreği'])) {
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
  if (hasWord(n, ['döner', 'dönerci', 'doner', 'donerci', 'kebap', 'kebapçı', 'iskender', 'dürüm', 'adana kebap', 'urfa kebap', 'lahmacun', 'pideci'])) {
    return { key: 'donerci', label: 'Dönerci & Kebapçı' };
  }

  // 15. Tatlıcı & Baklavacı
  if (hasWord(n, ['tatlı', 'tatlıcı', 'tatlicisi', 'baklava', 'baklavacı', 'künefe', 'kadayıf', 'güllüoğlu', 'lokum', 'hafız mustafa', 'helvacı', 'trileçe'])) {
    return { key: 'tatlici', label: 'Tatlıcı & Baklavacı' };
  }

  // 16. Kafe & Kahve
  if (
    amenity === 'cafe' ||
    amenity === 'coffee_shop' ||
    hasWord(n, ['kahve', 'kahvesi', 'cafe', 'coffee', 'kafe', 'espresso', 'roaster', 'roastery', 'starbucks', 'kahve dünyası', 'espresso lab', 'çay bahçesi', 'çay ocağı', 'hookah', 'nargile', 'bistro'])
  ) {
    return { key: 'cafe', label: 'Kafe & Kahve Dükkanı' };
  }

  // 17. Restoran & Lokanta
  if (
    amenity === 'restaurant' ||
    amenity === 'fast_food' ||
    hasWord(n, ['restoran', 'restaurant', 'lokanta', 'lokantası', 'meyhane', 'bistro', 'burger', 'pizza', 'köfte', 'çorba', 'çorbacı', 'pide', 'steakhouse', 'ev yemekleri'])
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
    hasWord(n, ['emlak', 'emlakçılık', 'gayrimenkul', 're/max', 'remax', 'coldwell', 'turyap', 'keller williams', 'cb', 'arsa'])
  ) {
    return { key: 'real_estate', label: 'Gayrimenkul & Emlak Ofisi' };
  }

  // 20. Butik & Giyim
  if (
    shop === 'clothes' ||
    shop === 'boutique' ||
    shop === 'fashion' ||
    hasWord(n, ['butik', 'giyim', 'moda', 'tekstil', 'boutique', 'lingerie', 'ayakkabı', 'çanta', 'abiye', 'tasarım'])
  ) {
    return { key: 'boutique', label: 'Butik & Giyim Mağazası' };
  }

  // 21. Kırtasiye
  if (
    shop === 'stationery' ||
    shop === 'books' ||
    hasWord(n, ['kırtasiye', 'kirtasiye', 'kitabevi', 'kitapçı', 'fotokopi', 'd&r', 'nezih', 'ozalit', 'ofis kırtasiye'])
  ) {
    return { key: 'stationery', label: 'Kırtasiye & Kitabevi' };
  }

  // 22. Çiçekçi
  if (shop === 'florist' || hasWord(n, ['çiçek', 'çiçekçi', 'cicek', 'cicekci', 'florist', 'botanika', 'peyzaj', 'kaktüs', 'çiçekçilik'])) {
    return { key: 'florist', label: 'Çiçekçi & Botanik' };
  }

  // 23. Optik
  if (shop === 'optician' || hasWord(n, ['optik', 'gözlük', 'gozluk', 'optisyen', 'atasun', 'optikçi'])) {
    return { key: 'optician', label: 'Optik & Gözlükçü' };
  }

  // 24. Manav
  if (shop === 'greengrocer' || hasWord(n, ['manav', 'manavı', 'sebze', 'meyve', 'organik pazar', 'halk manavı', 'bostan', 'yeşillik'])) {
    return { key: 'manav', label: 'Manav & Organik Pazar' };
  }

  // 25. Çilingir
  if (shop === 'locksmith' || craft === 'locksmith' || hasWord(n, ['çilingir', 'cilingir', 'anahtarcı', 'anahtar', 'kilit', 'kale kilit', 'oto anahtar'])) {
    return { key: 'cilingir', label: 'Çilingir & Anahtarcı' };
  }

  // 26. Terzi
  if (shop === 'tailor' || craft === 'tailor' || hasWord(n, ['terzi', 'terzisi', 'dikim', 'tadilat', 'dikimevi', 'paça dikimi'])) {
    return { key: 'terzi', label: 'Terzi & Dikim Evi' };
  }

  // 27. Kuru Temizleme & Lostra
  if (shop === 'dry_cleaning' || shop === 'laundry' || hasWord(n, ['kuru temizleme', 'lostra', 'lostracı', 'halı yıkama', 'ütüleme', 'dry clean'])) {
    return { key: 'dry_cleaning', label: 'Kuru Temizleme & Lostra' };
  }

  // 28. Mobilya & Ev Dekorasyon
  if (shop === 'furniture' || hasWord(n, ['mobilya', 'koltuk', 'yatak', 'dekorasyon', 'bellona', 'istikbal', 'doğtaş', 'kelebek', 'perde', 'perdeci'])) {
    return { key: 'furniture', label: 'Mobilya & Ev Dekorasyon' };
  }

  // 29. Elektronik & GSM
  if (shop === 'electronics' || hasWord(n, ['elektronik', 'telefon', 'bilgisayar', 'teknoloji', 'gsm', 'tamir', 'turkcell', 'vodafone', 'türk telekom', 'teknik servis'])) {
    return { key: 'electronics', label: 'Elektronik & GSM' };
  }

  // 30. Avukat & Hukuk Bürosu
  if (office === 'lawyer' || hasWord(n, ['avukat', 'avukatlık', 'hukuk', 'arabulucu', 'arabuluculuk', 'law', 'danışmanlık ve hukuk', 'hukuk bürosu'])) {
    return { key: 'law_firm', label: 'Hukuk & Avukatlık Bürosu' };
  }

  // 31. Anaokulu & Kreş
  if (amenity === 'kindergarten' || hasWord(n, ['kreş', 'kres', 'anaokulu', 'gündüz bakımevi', 'çocuk kulübü', 'çocuk yuvası', 'oyun evi'])) {
    return { key: 'kindergarten', label: 'Anaokulu & Kreş' };
  }

  // 32. Oto Galeri
  if (shop === 'car' || shop === 'car_dealer' || hasWord(n, ['oto galeri', 'galeri', 'otomotiv', 'motors', 'araç alım', 'ikinci el araç', 'auto'])) {
    return { key: 'auto_gallery', label: 'Oto Galeri & Araç Satış' };
  }

  // 33. Turizm & Seyahat Acentesi
  if (shop === 'travel_agency' || office === 'travel_agent' || hasWord(n, ['turizm', 'seyahat', 'turizm acentesi', 'bilet', 'uçak bileti', 'tur', 'turizm seyahat'])) {
    return { key: 'travel_agency', label: 'Turizm & Seyahat Acentesi' };
  }

  // 34. Yazılım & Dijital Ajans
  if (office === 'it' || office === 'company' || hasWord(n, ['yazılım', 'dijital ajans', 'reklam ajansı', 'bilişim', 'web tasarım', 'ajans', 'yazilim', 'ajansı'])) {
    return { key: 'software_agency', label: 'Yazılım & Dijital Ajans' };
  }

  // 35. Kokoreç & Sokak Lezzeti
  if (hasWord(n, ['kokoreç', 'kokorec', 'midye', 'midyeci', 'sokak lezzeti', 'tantuni', 'kumru'])) {
    return { key: 'kokorecci', label: 'Kokoreç & Sokak Lezzeti' };
  }

  // 36. Balıkçı & Deniz Ürünleri
  if (shop === 'seafood' || hasWord(n, ['balık', 'balıkçı', 'balikci', 'balik', 'deniz ürünleri', 'balık pazarı', 'balık ekmek'])) {
    return { key: 'balikci', label: 'Balıkçı & Deniz Ürünleri' };
  }

  // 37. Oto Elektrik & Akü
  if (hasWord(n, ['oto elektrik', 'akü', 'akücü', 'oto klima', 'akü bayii', 'marş motoru', 'oto elektronik'])) {
    return { key: 'oto_elektrik', label: 'Oto Elektrik & Akü' };
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
    query = `
      [out:json][timeout:15];
      (
        node(around:${radiusMeters},${lat},${lng})["amenity"~"cafe|restaurant|fast_food|pharmacy|dentist|veterinary|car_wash|ice_cream|pub|bar"];
        node(around:${radiusMeters},${lat},${lng})["shop"];
        node(around:${radiusMeters},${lat},${lng})["office"];
        node(around:${radiusMeters},${lat},${lng})["leisure"="fitness_centre"];
        way(around:${radiusMeters},${lat},${lng})["amenity"~"cafe|restaurant|fast_food|pharmacy|dentist|veterinary|car_wash|ice_cream|pub|bar"];
        way(around:${radiusMeters},${lat},${lng})["shop"];
      );
      out center 120;
    `.trim();
  } else {
    const filters = CATEGORY_TAG_MAP[category] ?? ['["amenity"~"cafe|restaurant"]'];
    const nodes = filters.map((f) => `node(around:${radiusMeters},${lat},${lng})${f};`).join('\n');
    const ways = filters.map((f) => `way(around:${radiusMeters},${lat},${lng})${f};`).join('\n');

    query = `
      [out:json][timeout:10];
      (
        ${nodes}
        ${ways}
      );
      out center 80;
    `.trim();
  }

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        const text = await res.text();
        if (!text.trim().startsWith('{')) continue;
        const json = JSON.parse(text) as OverpassResponse;
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

/* ========================================================================= */
/* GOOGLE PLACES API INTEGRATION (0$ with 200$ Monthly Free Tier & Caching)   */
/* ========================================================================= */

interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
}

interface GooglePlacesResponse {
  results?: GooglePlaceResult[];
  status?: string;
  error_message?: string;
}

export const GOOGLE_CATEGORY_MAPPING: Record<
  string,
  { type?: string; keyword: string; fallbackLabel: string }
> = {
  cafe: { keyword: 'kafe OR kahve OR cafe OR coffee OR tatlıcı OR espresso', fallbackLabel: 'Kafe & Kahve Dükkanı' },
  pet_shop: { keyword: 'petshop OR veteriner OR evcil hayvan OR pati OR veteriner kliniği', fallbackLabel: 'Petshop & Veteriner' },
  butcher: { keyword: 'kasap OR şarküteri OR et tavuk OR et pazarı', fallbackLabel: 'Kasap & Şarküteri' },
  bakery: { keyword: 'fırın OR pastane OR unlu mamül OR börekçi OR simitçi OR ekmek', fallbackLabel: 'Fırın & Unlu Mamüller' },
  market: { keyword: 'market OR bakkal OR süpermarket OR tekel bayii OR gıda', fallbackLabel: 'Süpermarket & Bakkal' },
  hairdresser: { keyword: 'kuaför OR berber OR güzellik salonu OR estetik OR barber', fallbackLabel: 'Kuaför & Güzellik' },
  gym: { keyword: 'spor salonu OR fitness OR pilates OR yoga OR gym OR crossfit', fallbackLabel: 'Spor Salonu & Fitness' },
  pharmacy: { keyword: 'eczane OR medikal OR eczanesi', fallbackLabel: 'Eczane & Medikal' },
  car_wash: { keyword: 'oto yıkama OR detailing OR oto kuaför OR oto yikama', fallbackLabel: 'Oto Yıkama & Detailing' },
  restaurant: { keyword: 'restoran OR lokanta OR kebapçı OR köfteci OR yemek OR bistro', fallbackLabel: 'Restoran & Lokanta' },
  boutique: { keyword: 'butik OR giyim mağazası OR elbise OR moda butik OR ayakkabı', fallbackLabel: 'Butik & Giyim Mağazası' },
  dry_cleaning: { keyword: 'kuru temizleme OR lostra OR halı yıkama OR terzi lostra', fallbackLabel: 'Kuru Temizleme & Lostra' },
  insurance_agency: { keyword: 'sigorta acentesi OR sigortacılık OR kasko trafik OR sigorta', fallbackLabel: 'Sigorta Acentesi' },
  travel_agency: { keyword: 'turizm seyahat acentesi OR tur acentesi OR bilet satış OR turizm', fallbackLabel: 'Turizm & Seyahat Acentesi' },
  real_estate: { keyword: 'emlak OR gayrimenkul ofisi OR danışmanlık OR emlakçı', fallbackLabel: 'Gayrimenkul & Emlak Ofisi' },
  auto_gallery: { keyword: 'oto galeri OR galeri OR otomotiv OR araç alım satım OR motors', fallbackLabel: 'Oto Galeri & Araç Satış' },
  stationery: { keyword: 'kırtasiye OR kitabevi OR ofis malzemeleri OR kırtasiyeci', fallbackLabel: 'Kırtasiye & Kitabevi' },
  florist: { keyword: 'çiçekçi OR çiçek OR botanik OR peyzaj OR çiçekçilik', fallbackLabel: 'Çiçekçi & Botanik' },
  optician: { keyword: 'optik OR gözlükçü OR optisyen OR gözlük', fallbackLabel: 'Optik & Gözlükçü' },
  dental_clinic: { keyword: 'diş hekimi OR diş kliniği OR dental poliklinik OR ağız diş sağlığı OR dentist', fallbackLabel: 'Diş Kliniği & Hekimliği' },
  kindergarten: { keyword: 'anaokulu OR kreş OR gündüz bakımevi OR çocuk yuvası OR oyun evi', fallbackLabel: 'Anaokulu & Kreş' },
  law_firm: { keyword: 'avukat OR avukatlık bürosu OR hukuk bürosu OR arabuluculuk OR hukuk danışmanlığı', fallbackLabel: 'Hukuk & Avukatlık Bürosu' },
  software_agency: { keyword: 'yazılım ajansı OR dijital ajans OR bilişim OR web tasarım OR yazılım', fallbackLabel: 'Yazılım & Dijital Ajans' },
  furniture: { keyword: 'mobilya OR koltuk OR mobilyacı OR ev dekorasyon OR masa sandalye', fallbackLabel: 'Mobilya & Ev Dekorasyon' },
  electronics: { keyword: 'telefon tamir OR gsm OR elektronik OR bilgisayar servisi OR teknik servis', fallbackLabel: 'Elektronik & GSM' },
  borekci: { keyword: 'börekçi OR börek salonu OR su böreği OR poğaça OR kır pidesi', fallbackLabel: 'Börekçi & Poğaçacı' },
  dondurmaci: { keyword: 'dondurmacı OR dondurma OR waffle OR gelato OR dondurmacisi', fallbackLabel: 'Dondurmacı & Waffle' },
  lastikci: { keyword: 'lastikçi OR oto lastik OR rot balans OR lastik bayi OR oto lastikçi', fallbackLabel: 'Oto Lastikçi & Rot Balans' },
  cigkofteci: { keyword: 'çiğ köfteci OR çiğköfte OR adıyamancı OR çiğ köfte', fallbackLabel: 'Çiğ Köfteci' },
  tatlici: { keyword: 'tatlıcı OR baklavacı OR künefeci OR tatlı salonu OR helvacı', fallbackLabel: 'Tatlıcı & Baklavacı' },
  donerci: { keyword: 'dönerci OR kebapçı OR dürümcü OR iskender OR pideci', fallbackLabel: 'Dönerci & Kebapçı' },
  kokorecci: { keyword: 'kokoreç OR midyeci OR sokak lezzeti OR kokoreççi OR tantuni', fallbackLabel: 'Kokoreç & Sokak Lezzeti' },
  cilingir: { keyword: 'çilingir OR anahtarcı OR oto anahtar OR kilit açma OR kale kilit', fallbackLabel: 'Çilingir & Anahtarcı' },
  balikci: { keyword: 'balıkçı OR balık restoranı OR balık pazarı OR taze balık OR balık ekmek', fallbackLabel: 'Balıkçı & Deniz Ürünleri' },
  manav: { keyword: 'manav OR yeşillik OR meyve sebze OR şarküteri manav OR halk manavı', fallbackLabel: 'Manav & Organik Pazar' },
  terzi: { keyword: 'terzi OR dikim evi OR terzilik OR elbise tadilat OR paça dikimi', fallbackLabel: 'Terzi & Dikim Evi' },
  oto_elektrik: { keyword: 'oto elektrik OR akücü OR oto klima OR akü bayii OR oto elektronik', fallbackLabel: 'Oto Elektrik & Akü' },
};

const GOOGLE_PLACES_CACHE = new Map<string, { data: CompetitorPoi[]; ts: number }>();

export function getGooglePlacesApiKey(): string | null {
  return (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    null
  );
}

const ALL_COMMERCIAL_SECTOR_KEYS: RadarCategoryKey[] = [
  'cafe',
  'restaurant',
  'market',
  'bakery',
  'hairdresser',
  'pharmacy',
  'pet_shop',
  'florist',
  'gym',
  'law_firm',
  'butcher',
  'car_wash',
  'boutique',
  'dry_cleaning',
  'dental_clinic',
  'real_estate',
  'auto_gallery',
  'stationery',
  'electronics',
  'furniture',
  'borekci',
  'donerci',
  'tatlici',
  'cilingir',
  'balikci',
  'manav',
  'terzi',
  'oto_elektrik',
];

export async function fetchGooglePlacesPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): Promise<CompetitorPoi[] | null> {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) return null;

  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `gplaces-${roundedLat}-${roundedLng}-${radiusMeters}-${category}`;

  const cached = GOOGLE_PLACES_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const isAll = category === 'all' || !category;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    // If 'all' (Tüm Sektörler & İşletmeler) is requested:
    // Aggregate all real businesses across commercial sectors in parallel for 100% accurate catchment representation
    if (isAll) {
      const promises = ALL_COMMERCIAL_SECTOR_KEYS.map(async (secKey) => {
        const secMapping = GOOGLE_CATEGORY_MAPPING[secKey];
        if (!secMapping?.keyword) return [];

        const secCacheKey = `gplaces-${roundedLat}-${roundedLng}-${radiusMeters}-${secKey}`;
        const secCached = GOOGLE_PLACES_CACHE.get(secCacheKey);
        if (secCached && Date.now() - secCached.ts < CACHE_TTL_MS) {
          return secCached.data;
        }

        const secParams = new URLSearchParams({
          location: `${lat},${lng}`,
          radius: radiusMeters.toString(),
          key: apiKey,
          language: 'tr',
          keyword: secMapping.keyword,
        });

        try {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${secParams.toString()}`;
          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) return [];
          const json = (await res.json()) as GooglePlacesResponse;
          if (json.status !== 'OK') return [];

          const secPois: CompetitorPoi[] = [];
          for (const place of json.results || []) {
            if (!place.geometry?.location || !place.name) continue;
            if (place.business_status === 'CLOSED_PERMANENTLY') continue;

            const pLat = place.geometry.location.lat;
            const pLng = place.geometry.location.lng;
            const dist = calculateDistanceMeters(lat, lng, pLat, pLng);
            if (dist > radiusMeters) continue;

            secPois.push({
              id: `gp-${place.place_id}`,
              name: place.name,
              lat: pLat,
              lng: pLng,
              category: secKey,
              categoryLabel: secMapping.fallbackLabel,
              address: place.vicinity,
              distanceMeters: Math.round(dist),
            });
          }

          GOOGLE_PLACES_CACHE.set(secCacheKey, { data: secPois, ts: Date.now() });
          return secPois;
        } catch {
          return [];
        }
      });

      const sectorResults = await Promise.all(promises);
      clearTimeout(timeoutId);

      const uniqueMap = new Map<string, CompetitorPoi>();
      for (const list of sectorResults) {
        for (const poi of list) {
          if (!uniqueMap.has(poi.id)) {
            uniqueMap.set(poi.id, poi);
          }
        }
      }

      const allAggregatedPois = Array.from(uniqueMap.values()).sort(
        (a, b) => a.distanceMeters - b.distanceMeters,
      );

      GOOGLE_PLACES_CACHE.set(cacheKey, { data: allAggregatedPois, ts: Date.now() });
      return allAggregatedPois;
    }

    // Specific Sector Query
    const mapping = GOOGLE_CATEGORY_MAPPING[category] || { keyword: category, fallbackLabel: 'Ticari İşletme' };
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radiusMeters.toString(),
      key: apiKey,
      language: 'tr',
      keyword: mapping.keyword,
    });

    const legacyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const legacyRes = await fetch(legacyUrl, { signal: controller.signal });

    if (legacyRes.ok) {
      const json = (await legacyRes.json()) as GooglePlacesResponse;
      if (json.status === 'OK' || json.status === 'ZERO_RESULTS') {
        clearTimeout(timeoutId);
        const results = json.results || [];
        const pois: CompetitorPoi[] = [];

        for (const place of results) {
          if (!place.geometry?.location || !place.name) continue;
          if (place.business_status === 'CLOSED_PERMANENTLY') continue;

          const pLat = place.geometry.location.lat;
          const pLng = place.geometry.location.lng;
          const dist = calculateDistanceMeters(lat, lng, pLat, pLng);

          if (dist > radiusMeters) continue;

          pois.push({
            id: `gp-${place.place_id}`,
            name: place.name,
            lat: pLat,
            lng: pLng,
            category,
            categoryLabel: mapping.fallbackLabel,
            address: place.vicinity,
            distanceMeters: Math.round(dist),
          });
        }

        const sorted = pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
        GOOGLE_PLACES_CACHE.set(cacheKey, { data: sorted, ts: Date.now() });
        return sorted;
      }
    }

    // 2. Try Places API (New - v1)
    const newPlacesUrl = 'https://places.googleapis.com/v1/places:searchNearby';
    const newRes = await fetch(newPlacesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types',
      },
      body: JSON.stringify({
        includedTypes: mapping.type ? [mapping.type] : ['restaurant', 'cafe', 'store'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (newRes.ok) {
      const newJson = await newRes.json();
      const places = newJson.places || [];
      const pois: CompetitorPoi[] = [];

      for (const p of places) {
        if (!p.location?.latitude || !p.location?.longitude || !p.displayName?.text) continue;

        const pLat = p.location.latitude;
        const pLng = p.location.longitude;
        const dist = calculateDistanceMeters(lat, lng, pLat, pLng);
        if (dist > radiusMeters) continue;

        let catKey = category;
        let catLabel = mapping.fallbackLabel;

        if (isAll) {
          const typesRecord: Record<string, string> = {};
          for (const t of p.types || []) {
            typesRecord[t] = t;
          }
          const classified = classifyPoi(p.displayName.text, typesRecord);
          catKey = classified.key;
          catLabel = classified.label;
        }

        pois.push({
          id: `gp-${p.id}`,
          name: p.displayName.text,
          lat: pLat,
          lng: pLng,
          category: catKey,
          categoryLabel: catLabel,
          address: p.formattedAddress,
          distanceMeters: Math.round(dist),
        });
      }

      const sorted = pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
      GOOGLE_PLACES_CACHE.set(cacheKey, { data: sorted, ts: Date.now() });
      return sorted;
    }

    return null;
  } catch (err: any) {
    console.warn('[google-places] Fetch failed, falling back to Overpass:', err?.message);
    return null;
  }
}

/**
 * Unified Competitor POI Fetcher
 * 1. Uses Google Places API if GOOGLE_PLACES_API_KEY / GOOGLE_MAPS_API_KEY is configured.
 * 2. Seamlessly falls back to OpenStreetMap Overpass API if no key or quota exceeded.
 */
export async function fetchCompetitorPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): Promise<CompetitorPoi[]> {
  // 1. Try Google Places API first
  const googlePois = await fetchGooglePlacesPois(lat, lng, radiusMeters, category);
  if (googlePois && googlePois.length > 0) {
    return googlePois;
  }

  // 2. Fallback to OpenStreetMap Overpass API
  return fetchOverpassCompetitorPois(lat, lng, radiusMeters, category);
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
  const allPois = await fetchCompetitorPois(lat, lng, radiusMeters, 'all');
  const counts: Record<string, number> = {};

  for (const p of allPois) {
    if (p.category && p.category !== 'all') {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  }

  SECTOR_COUNTS_CACHE.set(cacheKey, { data: counts, ts: Date.now() });
  return counts;
}
