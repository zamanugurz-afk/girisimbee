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
  insurance_agency: ['Anadolu Sigorta Acentesi', 'Allianz Yetkili Acente', 'Axa Sigorta & Kasko', 'Aksigorta Bölge Temsilciliği', 'Türkiye Sigorta Acentesi', 'Sompo Sigorta', 'HDI Sigorta Acentesi', 'Güneş Sigorta & BES'],
  travel_agency: ['Jolly Tur Yetkili Acente', 'Etstur Satış Ofisi', 'Coral Travel Acentesi', 'Setur Turizm Acentesi', 'Tatil Sepeti Ofisi', 'Anı Tur Acentesi', 'Gezi & Vize Danışmanlığı'],
  real_estate: ['RE/MAX Gayrimenkul', 'Coldwell Banker Emlak', 'Century 21 Ofisi', 'Turyap Temsilciliği', 'Keller Williams Emlak', 'Emlak Sepeti', 'Altın Emlak'],
  auto_gallery: ['Yıldız Oto Galeri', 'Prestij Motors', 'Gürses Otomotiv', 'Otokoç 2. El', 'Doğuş Oto Satış', 'Acar Rent A Car & Galeri'],
  stationery: ['Kırtasiye Dünyası', 'Güneş Kitap & Kırtasiye', 'Örnek Fotokopi & Kırtasiye', 'Akademi Kırtasiye', 'D&R Store', 'Nezih Kitabevi'],
  florist: ['Lale Çiçekçilik', 'Orkide Çiçek Evi', 'Gülümse Çiçekçilik', 'Botanika Çiçek Tasarım', 'Papatya Çiçek Evi'],
  optician: ['Atasun Optik', 'Göz Grup Optik', 'Opmar Optik', 'Yeni Vizyon Optik', 'Moda Gözlükçülük'],
  dental_clinic: ['Dentİstanbul Diş Kliniği', 'Özel Diş Polikliniği', 'İnci Dental Klinik', 'Dentgroup Ağız ve Diş', 'Gülüş Estetiği Diş Hekimliği'],
  kindergarten: ['Sevgi Yuvası Anaokulu', 'Neşeli Adımlar Kreş', 'Mini Akademi Anaokulu', 'Minik Kalpler Gündüz Bakımevi'],
  law_firm: ['Gündüz Hukuk Bürosu', 'Adalet Avukatlık Ortaklığı', 'Yıldız & Partner Hukuk', 'Demir Hukuk ve Danışmanlık'],
  software_agency: ['Kare Yazılım ve Tasarım', 'Pixel Dijital Ajans', 'Bilişim Çözümleri', 'Kodlama ve Teknoloji Ofisi'],
  furniture: ['Kelebek Mobilya', 'Doğtaş Mobilya', 'Enza Home', 'İstikbal Mobilya', 'Moda Tasarım Mobilya'],
  electronics: ['Teknosa', 'MediaMarkt', 'Vatan Bilgisayar', 'Gürgençler Apple Yetkili Satıcı', 'Öz Elektronik'],
  borekci: ['Meşhur Sarıyer Börekçisi', 'Kır Pidesi & Börek Evi', 'Tarihi Boşnak Börekçisi', 'Karaköy Güllüoğlu Börek', 'Anadolu Su Böreği'],
  dondurmaci: ['Dondurmacı Yaşar Usta', 'Ali Usta Moda Dondurmacısı', 'Mado Dondurma', 'Cremeria Milano Gelato', 'Waffle & Dondurma Durağı'],
  lastikci: ['Lassa Yetkili Lastik Bayii', 'Bridgestone & Rot Balans', 'Michelin Lastik Park', 'Öz Lastikçi & Jant Tamiri', 'Goodyear Express Servis'],
  cigkofteci: ['Komagene Çiğ Köfte', 'Battalbey Çiğköfte', 'Oses Çiğ Köfte', 'Adıyaman Çiğköftecisi', 'Meşhur Tatlıses Çiğköfte'],
  tatlici: ['Hafız Mustafa 1864', 'Güllüoğlu Baklava', 'Faruk Güllüoğlu', 'Köşkeroğlu Tatlı & Baklava', 'Tarihi Safranbolu Lokumcusu'],
  donerci: ['Tarihi Yaprak Döner', 'Dönerci Ali Usta', 'Bereket Döner', 'Döner Stop', 'Baydöner', 'Usta Dönerci'],
  kokorecci: ['Şampiyon Kokoreç', 'Kral Kokoreç', 'Güneş Midye & Kokoreç', 'Sokak Lezzetleri Kokoreç'],
  cilingir: ['Kale Kilit Yetkili Çilingir', 'Merkez Anahtarcı & Çilingir', '24 Saat Acil Çilingir', 'Usta Anahtar'],
  balikci: ['Karadeniz Balıkçısı', 'Taze Balık & Pişirme Evi', 'Ege Balıkçısı', 'Balıkçı Sabahattin'],
  manav: ['Özlem Manav & Şarküteri', 'Taze Bahçe Manav', 'Organik Köy Manavı', 'Bereket Manavı'],
  terzi: ['Terzi Ahmet Usta', 'Moda Terzihanesi', 'Express Kuru Temizleme & Terzi', 'Özel Dikim Terzisi'],
  oto_elektrik: ['Yiğit Akü & Oto Elektrik', 'İnci Akü Yetkili Bayii', 'Bosch Car Oto Elektrik', 'Oto Klima & Marş Servisi'],
};

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

  const categoryMeta = RADAR_CATEGORIES[category] ?? RADAR_CATEGORIES.cafe;
  const tagFilter = CATEGORY_TAG_MAP[category] ?? '["amenity"="cafe"]';

  const query = `
    [out:json][timeout:2];
    (
      node(around:${radiusMeters},${lat},${lng})${tagFilter};
      way(around:${radiusMeters},${lat},${lng})${tagFilter};
    );
    out center 45;
  `.trim();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

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

function matchesCategorySemantics(name: string, tags: Record<string, string> | undefined, category: RadarCategoryKey): boolean {
  const lowerName = (name || '').toLowerCase();
  const cuisine = (tags?.cuisine || '').toLowerCase();
  const shop = (tags?.shop || '').toLowerCase();
  const amenity = (tags?.amenity || '').toLowerCase();

  if (category === 'cigkofteci') {
    return lowerName.includes('çiğ') || lowerName.includes('cig') || lowerName.includes('komagene') || lowerName.includes('battalbey') || lowerName.includes('oses') || lowerName.includes('tatlıses') || lowerName.includes('adıyaman');
  }
  if (category === 'borekci') {
    return lowerName.includes('börek') || lowerName.includes('borek') || lowerName.includes('poğaça') || lowerName.includes('boyoz') || shop === 'bakery' || shop === 'pastry';
  }
  if (category === 'dondurmaci') {
    return lowerName.includes('dondurma') || lowerName.includes('gelato') || lowerName.includes('waffle') || lowerName.includes('mado') || cuisine.includes('ice_cream') || amenity === 'ice_cream';
  }
  if (category === 'lastikci') {
    return lowerName.includes('lastik') || lowerName.includes('rot') || lowerName.includes('balans') || lowerName.includes('jant') || lowerName.includes('lassa') || lowerName.includes('michelin') || lowerName.includes('bridgestone') || shop === 'tyres';
  }
  if (category === 'donerci') {
    return lowerName.includes('döner') || lowerName.includes('doner') || lowerName.includes('iskender') || lowerName.includes('kebap') || lowerName.includes('dürüm');
  }
  if (category === 'kokorecci') {
    return lowerName.includes('kokoreç') || lowerName.includes('kokorec') || lowerName.includes('midye');
  }
  if (category === 'tatlici') {
    return lowerName.includes('tatlı') || lowerName.includes('baklava') || lowerName.includes('künefe') || lowerName.includes('kadayıf') || lowerName.includes('güllüoğlu') || lowerName.includes('lokum') || shop === 'confectionery' || shop === 'pastry';
  }
  if (category === 'insurance_agency') {
    return lowerName.includes('sigorta') || lowerName.includes('kasko') || lowerName.includes('acente') || lowerName.includes('allianz') || lowerName.includes('anadolu') || lowerName.includes('axa');
  }
  if (category === 'travel_agency') {
    return lowerName.includes('tur') || lowerName.includes('turizm') || lowerName.includes('seyahat') || lowerName.includes('travel') || lowerName.includes('bilet') || shop === 'travel_agency';
  }
  if (category === 'pet_shop') {
    return lowerName.includes('pet') || lowerName.includes('veteriner') || lowerName.includes('pati') || lowerName.includes('mama') || shop === 'pet';
  }
  if (category === 'butcher') {
    return lowerName.includes('kasap') || lowerName.includes('şarküteri') || lowerName.includes('et') || lowerName.includes('tavuk') || shop === 'butcher' || shop === 'deli';
  }
  if (category === 'cilingir') {
    return lowerName.includes('çilingir') || lowerName.includes('anahtar') || lowerName.includes('kilit') || shop === 'locksmith';
  }
  if (category === 'balikci') {
    return lowerName.includes('balık') || lowerName.includes('balik') || lowerName.includes('hamsi') || shop === 'seafood';
  }
  if (category === 'manav') {
    return lowerName.includes('manav') || lowerName.includes('sebze') || lowerName.includes('meyve') || shop === 'greengrocer';
  }
  if (category === 'terzi') {
    return lowerName.includes('terzi') || lowerName.includes('dikim') || lowerName.includes('tadilat') || shop === 'tailor';
  }
  if (category === 'oto_elektrik') {
    return lowerName.includes('elektrik') || lowerName.includes('akü') || lowerName.includes('aku') || lowerName.includes('klima') || lowerName.includes('marş');
  }

  return true;
}

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

            let finalName = rawName || categoryMeta.label;
            if (!rawName || !matchesCategorySemantics(rawName, el.tags, category)) {
              const sampleList = SAMPLE_NAMES_BY_CATEGORY[category] || [categoryMeta.label];
              finalName = sampleList[pois.length % sampleList.length] || categoryMeta.label;
            }

            pois.push({
              id: `osm-${el.type}-${el.id}`,
              name: finalName,
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
            const sorted = pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
            POI_QUERY_CACHE.set(cacheKey, { data: sorted, ts: Date.now() });
            return sorted;
          }
        }
      }
    } catch {
      continue;
    }
  }

  const fallback = generateHeuristicPois(lat, lng, radiusMeters, category);
  POI_QUERY_CACHE.set(cacheKey, { data: fallback, ts: Date.now() });
  return fallback;
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
