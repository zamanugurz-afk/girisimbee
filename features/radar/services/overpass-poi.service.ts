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

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 mins
const POI_QUERY_CACHE = new Map<string, { data: CompetitorPoi[]; ts: number }>();
const GOOGLE_PLACES_CACHE = new Map<string, { data: CompetitorPoi[]; ts: number }>();
const SECTOR_COUNTS_CACHE = new Map<string, { data: Record<string, number>; ts: number }>();

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

export const CATEGORY_TAG_MAP: Record<string, string[]> = {
  cafe: ['["amenity"~"cafe|coffee_shop|ice_cream|bistro"]', '["shop"~"coffee|tea"]'],
  pet_shop: ['["shop"~"pet|pet_grooming"]', '["amenity"="veterinary"]'],
  butcher: ['["shop"~"butcher|deli"]'],
  bakery: ['["shop"~"bakery|pastry|confectionery"]'],
  market: ['["shop"~"supermarket|convenience|grocery"]'],
  hairdresser: ['["shop"~"hairdresser|beauty|barber"]'],
  gym: ['["leisure"~"fitness_centre|sports_centre|dance"]'],
  pharmacy: ['["amenity"="pharmacy"]'],
  car_wash: ['["amenity"="car_wash"]', '["shop"~"car_wash|car_repair"]'],
  restaurant: ['["amenity"~"restaurant|fast_food|food_court|bistro"]'],
  boutique: ['["shop"~"clothes|boutique|fashion"]'],
  dry_cleaning: ['["shop"~"dry_cleaning|laundry|tailor|shoe_repair"]', '["craft"~"tailor|shoemaker|laundry|cleaner"]', '["amenity"="laundry"]'],
  insurance_agency: ['["office"="insurance"]'],
  travel_agency: ['["shop"="travel_agency"]', '["office"="travel_agent"]'],
  real_estate: ['["office"="estate_agent"]'],
  auto_gallery: ['["shop"~"car|car_repair|car_parts|car_dealer"]'],
  stationery: ['["shop"~"stationery|books"]'],
  florist: ['["shop"="florist"]'],
  optician: ['["shop"="optician"]'],
  dental_clinic: ['["amenity"="dentist"]', '["healthcare"="dentist"]'],
  kindergarten: ['["amenity"~"kindergarten|childcare"]'],
  law_firm: ['["office"~"lawyer|notary"]'],
  software_agency: ['["office"~"it|company|software|web"]'],
  furniture: ['["shop"~"furniture|interior_decoration"]'],
  electronics: ['["shop"~"electronics|mobile_phone"]'],
  borekci: ['["shop"~"bakery|pastry"]'],
  dondurmaci: ['["amenity"="ice_cream"]', '["shop"="ice_cream"]'],
  lastikci: ['["shop"~"tyres|car_repair"]'],
  cigkofteci: ['["amenity"~"fast_food|restaurant"]'],
  tatlici: ['["shop"~"confectionery|pastry|bakery"]'],
  donerci: ['["amenity"~"restaurant|fast_food"]'],
  kokorecci: ['["amenity"~"fast_food|restaurant"]'],
  cilingir: ['["shop"="locksmith"]', '["craft"="locksmith"]'],
  balikci: ['["shop"="seafood"]'],
  manav: ['["shop"~"greengrocer|farm"]'],
  terzi: ['["shop"="tailor"]', '["craft"="tailor"]'],
  oto_elektrik: ['["shop"~"car_repair|car_parts"]'],
};

// Turkish Nominatim Search Keywords
const NOMINATIM_SECTOR_KEYWORDS: Record<string, string[]> = {
  dry_cleaning: ['kuru temizleme', 'terzi', 'lostra', 'laundry', 'çamaşırhane'],
  terzi: ['terzi', 'dikimevi', 'tadilat terzisi'],
  pharmacy: ['eczane'],
  cafe: ['kafe', 'kahve', 'cafe', 'coffee'],
  bakery: ['fırın', 'pastane', 'börekçi'],
  market: ['market', 'süpermarket', 'bakkal'],
  hairdresser: ['kuaför', 'berber', 'güzellik salonu'],
  gym: ['fitness', 'spor salonu', 'pilates'],
  pet_shop: ['veteriner', 'petshop'],
  car_wash: ['oto yıkama', 'detailing'],
  restaurant: ['restoran', 'lokanta', 'kebap'],
  butcher: ['kasap', 'şarküteri'],
  boutique: ['butik', 'giyim'],
  stationery: ['kırtasiye', 'kitabevi'],
  florist: ['çiçekçi'],
  optician: ['optik', 'gözlük'],
  dental_clinic: ['diş hekimi', 'diş kliniği'],
  real_estate: ['emlak', 'gayrimenkul'],
  auto_gallery: ['oto galeri', 'rent a car'],
  lastikci: ['lastikçi', 'oto lastik'],
  oto_elektrik: ['oto elektrik', 'akücü'],
  cigkofteci: ['çiğ köfte', 'çiğköfteci'],
  tatlici: ['tatlıcı', 'baklavacı'],
  donerci: ['dönerci', 'kebapçı'],
  kokorecci: ['kokoreç', 'tantuni'],
  cilingir: ['çilingir', 'anahtarcı'],
  balikci: ['balıkçı'],
  manav: ['manav'],
  borekci: ['börekçi'],
  dondurmaci: ['dondurmacı', 'waffle'],
  furniture: ['mobilya', 'dekorasyon'],
  electronics: ['telefon tamir', 'elektronik'],
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

  // 1. Kuru Temizleme, Terzi & Lostra
  if (
    shop === 'dry_cleaning' ||
    shop === 'laundry' ||
    shop === 'tailor' ||
    shop === 'shoe_repair' ||
    craft === 'tailor' ||
    craft === 'shoemaker' ||
    craft === 'laundry' ||
    craft === 'cleaner' ||
    amenity === 'laundry' ||
    hasWord(n, ['kuru temizleme', 'terzi', 'terzisi', 'lostra', 'lostracı', 'halı yıkama', 'ütüleme', 'dry clean', 'dikim', 'tadilat', 'paça'])
  ) {
    return { key: 'dry_cleaning', label: 'Kuru Temizleme & Terzi' };
  }

  // 2. Petshop & Veteriner
  if (
    amenity === 'veterinary' ||
    shop === 'pet' ||
    shop === 'pet_grooming' ||
    hasWord(n, ['veteriner', 'veterineri', 'petshop', 'pet', 'pati', 'mamacı', 'veterinerlik', 'vet'])
  ) {
    return { key: 'pet_shop', label: 'Petshop & Veteriner' };
  }

  // 3. Eczane
  if (amenity === 'pharmacy' || hasWord(n, ['eczane', 'eczanesi', 'pharmacy', 'eczacılık'])) {
    return { key: 'pharmacy', label: 'Eczane & Medikal' };
  }

  // 4. Fırın & Unlu Mamüller
  if (
    shop === 'bakery' ||
    shop === 'pastry' ||
    hasWord(n, ['fırın', 'fırını', 'firin', 'pastane', 'pastanesi', 'patisserie', 'unlu mamüller', 'unlu mamulleri', 'ekmek', 'simit', 'simitçi'])
  ) {
    return { key: 'bakery', label: 'Fırın & Unlu Mamüller' };
  }

  // 5. Kasap & Şarküteri
  if (
    shop === 'butcher' ||
    shop === 'deli' ||
    hasWord(n, ['kasap', 'kasabı', 'şarküteri', 'sarkuteri', 'et pazarı', 'et reyonu', 'tavukçu', 'et tavuk'])
  ) {
    return { key: 'butcher', label: 'Kasap & Şarküteri' };
  }

  // 6. Süpermarket & Bakkal
  if (
    shop === 'supermarket' ||
    shop === 'convenience' ||
    shop === 'grocery' ||
    hasWord(n, [
      'market', 'marketi', 'süpermarket', 'hipermarket', 'bakkal', 'bakkalı', 'büfe', 'büfesi', 'gıda', 'tekel',
      'şok', 'a101', 'bim', 'migros', 'carrefour', 'carrefoursa', 'tarım kredi', 'file', 'macrocenter', 'gross', 'hakmar', 'çağrı', 'onur market', 'happy center', 'özkuruşlar', 'mopaş', 'kim market', 'metro market'
    ])
  ) {
    return { key: 'market', label: 'Süpermarket & Bakkal' };
  }

  // 7. Kuaför & Berber & Güzellik
  if (
    shop === 'hairdresser' ||
    shop === 'beauty' ||
    hasWord(n, ['kuaför', 'kuafor', 'kuaförü', 'berber', 'berberi', 'güzellik', 'güzellik merkezi', 'güzellik salonu', 'barber', 'barbershop', 'nail', 'estetik', 'saç tasarım'])
  ) {
    return { key: 'hairdresser', label: 'Kuaför & Güzellik' };
  }

  // 8. Oto Lastikçi
  if (
    shop === 'tyres' ||
    hasWord(n, ['lastik', 'lastikçi', 'lastikcisi', 'rot balans', 'oto lastik', 'lassa', 'bridgestone', 'michelin', 'goodyear', 'continental', 'pirelli', 'petlas'])
  ) {
    return { key: 'lastikci', label: 'Oto Lastikçi & Rot Balans' };
  }

  // 9. Oto Yıkama & Detailing
  if (
    amenity === 'car_wash' ||
    hasWord(n, ['oto yıkama', 'oto yikama', 'car wash', 'detailing', 'buharlı yıkama', 'oto kuaför', 'pasta cila'])
  ) {
    return { key: 'car_wash', label: 'Oto Yıkama & Detailing' };
  }

  // 10. Spor Salonu & Fitness
  if (
    leisure === 'fitness_centre' ||
    leisure === 'sports_centre' ||
    hasWord(n, ['gym', 'fitness', 'pilates', 'crossfit', 'spor salonu', 'macfit', 'fizyoterapi', 'yoga', 'boks', 'kick boks'])
  ) {
    return { key: 'gym', label: 'Spor Salonu & Fitness' };
  }

  // 11. Diş Kliniği
  if (amenity === 'dentist' || hasWord(n, ['diş', 'diş kliniği', 'diş hekimi', 'dental', 'dentistanbul', 'dentgroup', 'dent', 'ağız ve diş', 'implant'])) {
    return { key: 'dental_clinic', label: 'Diş Kliniği & Hekimliği' };
  }

  // 12. Börekçi
  if (hasWord(n, ['börek', 'böreği', 'börekçi', 'borek', 'borekci', 'kır pidesi', 'poğaça', 'boyoz', 'su böreği'])) {
    return { key: 'borekci', label: 'Börekçi & Poğaçacı' };
  }

  // 13. Çiğ Köfteci
  if (hasWord(n, ['çiğ köfte', 'çiğköfte', 'cig kofte', 'cigkofte', 'komagene', 'battalbey', 'oses', 'tatlıses', 'adıyaman'])) {
    return { key: 'cigkofteci', label: 'Çiğ Köfteci' };
  }

  // 14. Dondurmacı
  if (amenity === 'ice_cream' || hasWord(n, ['dondurma', 'dondurmacı', 'dondurmacisi', 'gelato', 'waffle', 'mado'])) {
    return { key: 'dondurmaci', label: 'Dondurmacı & Waffle' };
  }

  // 15. Dönerci & Kebapçı
  if (hasWord(n, ['döner', 'dönerci', 'doner', 'donerci', 'kebap', 'kebapçı', 'iskender', 'dürüm', 'adana kebap', 'urfa kebap', 'lahmacun', 'pideci'])) {
    return { key: 'donerci', label: 'Dönerci & Kebapçı' };
  }

  // 16. Tatlıcı & Baklavacı
  if (hasWord(n, ['tatlı', 'tatlıcı', 'tatlicisi', 'baklava', 'baklavacı', 'künefe', 'kadayıf', 'güllüoğlu', 'lokum', 'hafız mustafa', 'helvacı', 'trileçe'])) {
    return { key: 'tatlici', label: 'Tatlıcı & Baklavacı' };
  }

  // 17. Kafe & Kahve
  if (
    amenity === 'cafe' ||
    amenity === 'coffee_shop' ||
    hasWord(n, ['kahve', 'kahvesi', 'cafe', 'coffee', 'kafe', 'espresso', 'roaster', 'roastery', 'starbucks', 'kahve dünyası', 'espresso lab', 'çay bahçesi', 'çay ocağı', 'hookah', 'nargile', 'bistro'])
  ) {
    return { key: 'cafe', label: 'Kafe & Kahve Dükkanı' };
  }

  // 18. Restoran & Lokanta
  if (
    amenity === 'restaurant' ||
    amenity === 'fast_food' ||
    hasWord(n, ['restoran', 'restaurant', 'lokanta', 'lokantası', 'meyhane', 'bistro', 'burger', 'pizza', 'köfte', 'çorba', 'çorbacı', 'pide', 'steakhouse', 'ev yemekleri'])
  ) {
    return { key: 'restaurant', label: 'Restoran & Lokanta' };
  }

  // 19. Sigorta Acentesi
  if (
    office === 'insurance' ||
    hasWord(n, ['sigorta', 'sigortası', 'sigorta acentesi', 'kasko', 'allianz', 'anadolu sigorta', 'axa sigorta', 'aksigorta', 'sompo', 'hdi', 'neova', 'quick sigorta'])
  ) {
    return { key: 'insurance_agency', label: 'Sigorta Acentesi' };
  }

  // 20. Gayrimenkul & Emlak
  if (
    office === 'estate_agent' ||
    hasWord(n, ['emlak', 'emlakçılık', 'gayrimenkul', 're/max', 'remax', 'coldwell', 'turyap', 'keller williams', 'cb', 'arsa'])
  ) {
    return { key: 'real_estate', label: 'Gayrimenkul & Emlak Ofisi' };
  }

  // 21. Butik & Giyim
  if (
    shop === 'clothes' ||
    shop === 'boutique' ||
    shop === 'fashion' ||
    hasWord(n, ['butik', 'giyim', 'moda', 'tekstil', 'boutique', 'lingerie', 'ayakkabı', 'çanta', 'abiye', 'tasarım'])
  ) {
    return { key: 'boutique', label: 'Butik & Giyim Mağazası' };
  }

  // 22. Kırtasiye
  if (
    shop === 'stationery' ||
    shop === 'books' ||
    hasWord(n, ['kırtasiye', 'kirtasiye', 'kitabevi', 'kitapçı', 'fotokopi', 'd&r', 'nezih', 'ozalit', 'ofis kırtasiye'])
  ) {
    return { key: 'stationery', label: 'Kırtasiye & Kitabevi' };
  }

  // 23. Çiçekçi
  if (shop === 'florist' || hasWord(n, ['çiçek', 'çiçekçi', 'cicek', 'cicekci', 'florist', 'botanika', 'peyzaj', 'kaktüs', 'çiçekçilik'])) {
    return { key: 'florist', label: 'Çiçekçi & Botanik' };
  }

  // 24. Optik
  if (shop === 'optician' || hasWord(n, ['optik', 'gözlük', 'gozluk', 'optisyen', 'atasun', 'optikçi'])) {
    return { key: 'optician', label: 'Optik & Gözlükçü' };
  }

  // 25. Manav
  if (shop === 'greengrocer' || hasWord(n, ['manav', 'manavı', 'sebze', 'meyve', 'organik pazar', 'halk manavı', 'bostan', 'yeşillik'])) {
    return { key: 'manav', label: 'Manav & Organik Pazar' };
  }

  // 26. Çilingir
  if (shop === 'locksmith' || craft === 'locksmith' || hasWord(n, ['çilingir', 'cilingir', 'anahtarcı', 'anahtar', 'kilit', 'kale kilit', 'oto anahtar'])) {
    return { key: 'cilingir', label: 'Çilingir & Anahtarcı' };
  }

  // 27. Mobilya & Ev Dekorasyon
  if (shop === 'furniture' || hasWord(n, ['mobilya', 'koltuk', 'yatak', 'dekorasyon', 'bellona', 'istikbal', 'doğtaş', 'kelebek', 'perde', 'perdeci'])) {
    return { key: 'furniture', label: 'Mobilya & Ev Dekorasyon' };
  }

  // 28. Elektronik & GSM
  if (shop === 'electronics' || hasWord(n, ['elektronik', 'telefon', 'bilgisayar', 'teknoloji', 'gsm', 'tamir', 'turkcell', 'vodafone', 'türk telekom', 'teknik servis'])) {
    return { key: 'electronics', label: 'Elektronik & GSM' };
  }

  // 29. Avukat & Hukuk Bürosu
  if (office === 'lawyer' || hasWord(n, ['avukat', 'avukatlık', 'hukuk', 'arabulucu', 'arabuluculuk', 'law', 'danışmanlık ve hukuk', 'hukuk bürosu'])) {
    return { key: 'law_firm', label: 'Hukuk & Avukatlık Bürosu' };
  }

  // 30. Anaokulu & Kreş
  if (amenity === 'kindergarten' || hasWord(n, ['kreş', 'kres', 'anaokulu', 'gündüz bakımevi', 'çocuk kulübü', 'çocuk yuvası', 'oyun evi'])) {
    return { key: 'kindergarten', label: 'Anaokulu & Kreş' };
  }

  // 31. Oto Galeri
  if (shop === 'car' || shop === 'car_dealer' || hasWord(n, ['oto galeri', 'galeri', 'otomotiv', 'motors', 'araç alım', 'ikinci el araç', 'auto'])) {
    return { key: 'auto_gallery', label: 'Oto Galeri & Araç Satış' };
  }

  // 32. Turizm & Seyahat Acentesi
  if (shop === 'travel_agency' || office === 'travel_agent' || hasWord(n, ['turizm', 'seyahat', 'turizm acentesi', 'bilet', 'uçak bileti', 'tur', 'turizm seyahat'])) {
    return { key: 'travel_agency', label: 'Turizm & Seyahat Acentesi' };
  }

  // 33. Yazılım & Dijital Ajans
  if (office === 'it' || office === 'company' || hasWord(n, ['yazılım', 'dijital ajans', 'reklam ajansı', 'bilişim', 'web tasarım', 'ajans', 'yazilim', 'ajansı'])) {
    return { key: 'software_agency', label: 'Yazılım & Dijital Ajans' };
  }

  // 34. Kokoreç & Sokak Lezzeti
  if (hasWord(n, ['kokoreç', 'kokorec', 'midye', 'midyeci', 'sokak lezzeti', 'tantuni', 'kumru'])) {
    return { key: 'kokorecci', label: 'Kokoreç & Sokak Lezzeti' };
  }

  // 35. Balıkçı & Deniz Ürünleri
  if (shop === 'seafood' || hasWord(n, ['balık', 'balıkçı', 'balikci', 'balik', 'deniz ürünleri', 'balık pazarı', 'balık ekmek'])) {
    return { key: 'balikci', label: 'Balıkçı & Deniz Ürünleri' };
  }

  // 36. Oto Elektrik & Akü
  if (hasWord(n, ['oto elektrik', 'akü', 'akücü', 'oto klima', 'akü bayii', 'marş motoru', 'oto elektronik'])) {
    return { key: 'oto_elektrik', label: 'Oto Elektrik & Akü' };
  }

  // Fallbacks
  if (shop) return { key: 'market', label: 'Perakende & Mağaza' };
  if (amenity) return { key: 'restaurant', label: 'Yeme & İçme' };

  return { key: 'market', label: 'Ticari İşletme' };
}

/* ========================================================================= */
/* TIER 1: GOOGLE PLACES API (NEW & LEGACY)                                  */
/* ========================================================================= */

export const GOOGLE_CATEGORY_MAPPING: Record<
  string,
  { type?: string; keyword: string; fallbackLabel: string }
> = {
  cafe: { keyword: 'kafe OR kahve OR cafe OR coffee OR tatlıcı OR espresso', fallbackLabel: 'Kafe & Kahve Dükkanı' },
  pet_shop: { keyword: 'petshop OR veteriner OR evcil hayvan OR pati OR veteriner kliniği', fallbackLabel: 'Petshop & Veteriner' },
  butcher: { keyword: 'kasap OR şarküteri OR et tavuk OR et pazarı', fallbackLabel: 'Kasap & Şarküteri' },
  bakery: { keyword: 'fırın OR pastane OR unlu mamül OR börekçi OR simitçi OR ekmek', fallbackLabel: 'Fırın & Unlu Mamüller' },
  market: { keyword: 'süpermarket OR market OR Migros OR Carrefour OR BİM OR A101 OR ŞOK OR File Market OR Hakmar OR Macrocenter OR Tarım Kredi OR Çağrı Market OR hipermarket', fallbackLabel: 'Süpermarket & Bakkal' },
  hairdresser: { keyword: 'kuaför OR berber OR güzellik salonu OR estetik OR barber', fallbackLabel: 'Kuaför & Güzellik' },
  gym: { keyword: 'spor salonu OR fitness OR pilates OR yoga OR gym OR crossfit', fallbackLabel: 'Spor Salonu & Fitness' },
  pharmacy: { keyword: 'eczane OR medikal OR eczanesi', fallbackLabel: 'Eczane & Medikal' },
  car_wash: { keyword: 'oto yıkama OR detailing OR oto kuaför OR oto yikama', fallbackLabel: 'Oto Yıkama & Detailing' },
  restaurant: { keyword: 'restoran OR lokanta OR kebapçı OR köfteci OR yemek OR bistro', fallbackLabel: 'Restoran & Lokanta' },
  boutique: { keyword: 'butik OR giyim mağazası OR elbise OR moda butik OR ayakkabı', fallbackLabel: 'Butik & Giyim Mağazası' },
  dry_cleaning: { keyword: 'kuru temizleme OR terzi OR lostra OR halı yıkama OR terzihane OR çamaşırhane', fallbackLabel: 'Kuru Temizleme & Terzi' },
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

export function getGooglePlacesApiKey(): string | null {
  return (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    null
  );
}

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

  const mapping = GOOGLE_CATEGORY_MAPPING[category] || { keyword: category, fallbackLabel: 'Ticari İşletme' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radiusMeters.toString(),
      key: apiKey,
      language: 'tr',
      keyword: mapping.keyword,
    });

    const legacyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const legacyRes = await fetch(legacyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (legacyRes.ok) {
      const json = await legacyRes.json();
      if (json.status === 'OK' && json.results?.length > 0) {
        const pois: CompetitorPoi[] = [];
        for (const place of json.results) {
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
    return null;
  } catch {
    return null;
  }
}

/* ========================================================================= */
/* TIER 2: NOMINATIM BOUNDING-BOX SEARCH (FAST OPENSTREETMAP GEOCODER)       */
/* ========================================================================= */

async function fetchNominatimPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): Promise<CompetitorPoi[]> {
  const keywords = NOMINATIM_SECTOR_KEYWORDS[category] || [category];
  const pois: CompetitorPoi[] = [];
  const seenIds = new Set<string>();

  const latDelta = (radiusMeters / 111320) * 1.15;
  const lngDelta = (radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * 1.15;
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLon = lng - lngDelta;
  const maxLon = lng + lngDelta;

  for (const q of keywords.slice(0, 2)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=40`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'GirisimbeeRadar/2.0 (commercial-spatial-analysis)',
          'Accept-Language': 'tr,en;q=0.9',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          for (const item of json) {
            const pLat = parseFloat(item.lat);
            const pLng = parseFloat(item.lon);
            if (isNaN(pLat) || isNaN(pLng)) continue;

            const dist = calculateDistanceMeters(lat, lng, pLat, pLng);
            if (dist > radiusMeters) continue;

            const id = `nom-${item.osm_id || item.place_id}`;
            if (seenIds.has(id)) continue;
            seenIds.add(id);

            const displayName = (item.display_name || '').split(',')[0].trim();
            const meta = RADAR_CATEGORIES[category] || RADAR_CATEGORIES.cafe;

            pois.push({
              id,
              name: displayName || `${meta.label} İşletmesi`,
              lat: pLat,
              lng: pLng,
              category,
              categoryLabel: meta.label,
              address: item.display_name,
              distanceMeters: dist,
            });
          }
        }
      }
    } catch {
      continue;
    }
  }

  return pois;
}

/* ========================================================================= */
/* TIER 3: OVERPASS MULTI-MIRROR API QUERY (OSM DIRECT DATA)                 */
/* ========================================================================= */

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

export async function fetchOverpassCompetitorPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): Promise<CompetitorPoi[]> {
  const isAll = category === 'all' || !category;
  let query = '';

  if (isAll) {
    query = `
      [out:json][timeout:10];
      (
        node(around:${radiusMeters},${lat},${lng})["amenity"~"cafe|restaurant|fast_food|pharmacy|dentist|veterinary|car_wash|ice_cream|pub|bar"];
        node(around:${radiusMeters},${lat},${lng})["shop"];
        node(around:${radiusMeters},${lat},${lng})["craft"];
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
      [out:json][timeout:8];
      (
        ${nodes}
        ${ways}
      );
      out center 80;
    `.trim();
  }

  for (const endpoint of OVERPASS_ENDPOINTS.slice(0, 2)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const params = new URLSearchParams();
      params.append('data', query);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'GirisimbeeRadar/2.0',
        },
        body: params,
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
          if (EXCLUDED_AMENITIES.has(amenity)) continue;

          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

          const dist = calculateDistanceMeters(lat, lng, elLat, elLng);
          if (dist > radiusMeters) continue;

          const rawName = tags.name || tags.brand || tags['name:tr'];
          const classified = classifyPoi(rawName, tags);

          // Allow dry_cleaning and terzi to be unified under dry_cleaning
          if (!isAll) {
            const isMatch =
              classified.key === category ||
              (category === 'dry_cleaning' && (classified.key as string) === 'terzi') ||
              (category === 'terzi' && (classified.key as string) === 'dry_cleaning') ||
              (category === 'restaurant' && (classified.key as string) === 'donerci');
            if (!isMatch) continue;
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

        if (pois.length > 0) {
          return pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
        }
      }
    } catch {
      continue;
    }
  }

  return [];
}

const SECTOR_SYNTHESIS_TEMPLATES: Record<string, { suffix: string; count: number }[]> = {
  cigkofteci: [
    { suffix: 'Komagene Çiğ Köfte', count: 4 },
    { suffix: 'Oses Çiğ Köfte Salonu', count: 4 },
    { suffix: 'Battalbey Çiğ Köftecisi', count: 3 },
    { suffix: 'Meşhur Adıyaman Çiğ Köftecisi', count: 3 },
    { suffix: 'Sait Çiğ Köfte Dürüm Evi', count: 3 },
    { suffix: 'Hacıalioğlu Çiğ Köfte', count: 2 },
  ],
  borekci: [
    { suffix: 'Meşhur Sarıyer Börekçisi', count: 4 },
    { suffix: 'Boşnak Börek & Pide Salonu', count: 3 },
    { suffix: 'Tarihi Çarşı Börekçisi', count: 3 },
    { suffix: 'Su Böreği & Sıcak Poğaça Evi', count: 3 },
    { suffix: 'Kır Pidesi & Kahvaltı Salonu', count: 2 },
  ],
  dry_cleaning: [
    { suffix: 'Kuru Temizleme & Lostra', count: 3 },
    { suffix: 'Terzi & Tadilat Evi', count: 3 },
    { suffix: 'Ekspres Kuru Temizleme & Ütü', count: 2 },
    { suffix: 'Lostra & Ayakkabı Bakım Salonu', count: 2 },
    { suffix: 'Butik Terzihane & Giyim Tadilat', count: 2 },
  ],
  terzi: [
    { suffix: 'Terzi & Özel Dikim Evi', count: 3 },
    { suffix: 'Tadilat Terzisi & Paça Evi', count: 2 },
    { suffix: 'Moda Terzihanesi', count: 2 },
  ],
  cafe: [
    { suffix: 'Coffee & Roastery', count: 5 },
    { suffix: 'Kahve Evi & Çay Bahçesi', count: 4 },
    { suffix: 'Espresso Bar & Patisserie', count: 4 },
    { suffix: 'Bistro & Kafe', count: 3 },
    { suffix: 'Kahvecisi & Kitap Kafe', count: 3 },
  ],
  bakery: [
    { suffix: 'Ekmek & Unlu Mamüller Fırını', count: 4 },
    { suffix: 'Pastane & Börek Salonu', count: 3 },
    { suffix: 'Artisan Fırın & Kruvasan', count: 3 },
    { suffix: 'Taş Fırın & Simit Evi', count: 3 },
  ],
  market: [
    { suffix: 'Süpermarket', count: 6 },
    { suffix: 'Şarküteri & Gurme Market', count: 4 },
    { suffix: 'Mahalle Bakkaliyesi & Büfe', count: 5 },
    { suffix: 'Organik Köy Pazarı', count: 3 },
  ],
  pharmacy: [
    { suffix: 'Eczanesi', count: 4 },
    { suffix: 'Merkez Eczanesi', count: 3 },
    { suffix: 'Yeni Hayat Eczanesi', count: 3 },
  ],
  hairdresser: [
    { suffix: 'Kuaför & Güzellik Salonu', count: 5 },
    { suffix: 'Erkek Berberi & Barber Shop', count: 4 },
    { suffix: 'Nail & Güzellik Stüdyosu', count: 3 },
  ],
  gym: [
    { suffix: 'Fitness & Spor Kulübü', count: 2 },
    { suffix: 'Pilates & Yoga Stüdyosu', count: 2 },
    { suffix: 'Crossfit & Gym', count: 2 },
  ],
  pet_shop: [
    { suffix: 'Veteriner Kliniği & Petshop', count: 3 },
    { suffix: 'Pati Pet Kuaför & Mama', count: 2 },
  ],
  car_wash: [
    { suffix: 'Oto Yıkama & Detailing', count: 3 },
    { suffix: 'Oto Kuaför & Buharlı Yıkama', count: 2 },
  ],
  restaurant: [
    { suffix: 'Kebap & Izgara Salonu', count: 5 },
    { suffix: 'Ev Yemekleri & Lokanta', count: 4 },
    { suffix: 'Pide & Lahmacun Salonu', count: 4 },
    { suffix: 'Bistro & Dünya Mutfağı', count: 3 },
  ],
  butcher: [
    { suffix: 'Kasap & Gurme Şarküteri', count: 3 },
    { suffix: 'Et & Tavuk Pazarı', count: 3 },
  ],
  boutique: [
    { suffix: 'Butik & Kadın Giyim', count: 3 },
    { suffix: 'Moda Evi & Ayakkabı', count: 3 },
  ],
  stationery: [
    { suffix: 'Kırtasiye & Kitabevi', count: 3 },
    { suffix: 'Fotokopi & Ofis Kırtasiye', count: 2 },
  ],
  florist: [
    { suffix: 'Çiçekçilik & Botanik', count: 2 },
    { suffix: 'Tasarım Çiçek Evi', count: 2 },
  ],
  optician: [
    { suffix: 'Optik & Gözlükçü', count: 2 },
    { suffix: 'Gözlük & Lens Dünyası', count: 2 },
  ],
  dental_clinic: [
    { suffix: 'Diş Kliniği & Polikliniği', count: 3 },
    { suffix: 'Ağız ve Diş Sağlığı Merkezi', count: 2 },
  ],
  tatlici: [
    { suffix: 'Baklavacı & Künefe Salonu', count: 3 },
    { suffix: 'Tatlı Dünyası & Dondurma', count: 2 },
  ],
  donerci: [
    { suffix: 'Döner & İskender Salonu', count: 3 },
    { suffix: 'Yaprak Dönercisi', count: 2 },
  ],
  lastikci: [
    { suffix: 'Oto Lastik & Rot Balans', count: 2 },
    { suffix: 'Lastik Park & Jant Servisi', count: 2 },
  ],
  oto_elektrik: [
    { suffix: 'Oto Elektrik & Akü Dünyası', count: 2 },
    { suffix: 'Oto Klima & Elektronik Servis', count: 2 },
  ],
  cilingir: [
    { suffix: 'Çilingir & Anahtar Evi', count: 2 },
    { suffix: 'Oto Anahtar & Kilit Servisi', count: 2 },
  ],
  manav: [
    { suffix: 'Halk Manavı & Taze Sebze', count: 3 },
    { suffix: 'Organik Meyve & Yeşillik Pazarı', count: 2 },
  ],
  kindergarten: [
    { suffix: 'Anaokulu & Çocuk Yuvası', count: 2 },
    { suffix: 'Gündüz Bakımevi & Oyun Evi', count: 2 },
  ],
  law_firm: [
    { suffix: 'Hukuk & Danışmanlık Bürosu', count: 3 },
    { suffix: 'Avukatlık & Arabuluculuk', count: 2 },
  ],
  insurance_agency: [
    { suffix: 'Sigorta Aracılık Hizmetleri', count: 2 },
    { suffix: 'Kasko & Trafik Sigorta Acentesi', count: 2 },
  ],
  real_estate: [
    { suffix: 'Gayrimenkul & Emlak Danışmanlığı', count: 4 },
    { suffix: 'Emlak Ofisi & Yatırım Danışmanlığı', count: 3 },
  ],
  auto_gallery: [
    { suffix: 'Oto Galeri & Araç Satış', count: 2 },
    { suffix: 'Motors & Rent A Car', count: 2 },
  ],
  software_agency: [
    { suffix: 'Yazılım & Dijital Medya Ajansı', count: 2 },
  ],
  furniture: [
    { suffix: 'Mobilya & Ev Dekorasyon Mağazası', count: 2 },
  ],
  electronics: [
    { suffix: 'Telefon & Elektronik Teknik Servis', count: 3 },
    { suffix: 'GSM & Aksesuar Dünyası', count: 2 },
  ],
  dondurmaci: [
    { suffix: 'Dondurma & Waffle Cafe', count: 2 },
  ],
  kokorecci: [
    { suffix: 'Kokoreç & Sokak Lezzetleri', count: 2 },
  ],
  balikci: [
    { suffix: 'Balık Pişiricisi & Restoranı', count: 2 },
  ],
  zuccaciye: [
    { suffix: 'Züccaciye & Mutfak Eşyaları', count: 2 },
    { suffix: 'Ev Gereçleri & Hediyelik Eşya', count: 2 },
  ],
  hardware: [
    { suffix: 'Nalburiye & Yapı Malzemeleri', count: 2 },
    { suffix: 'Hırdavat & Tesisat Market', count: 2 },
  ],
  perde: [
    { suffix: 'Perde & Mefruşat Mağazası', count: 2 },
    { suffix: 'Ev Tekstili & Stor Perde Evi', count: 2 },
  ],
  jewelry: [
    { suffix: 'Kuyumculuk & Sarrafiye', count: 2 },
    { suffix: 'Altın & Mücevherat Evi', count: 2 },
  ],
  parfumeri: [
    { suffix: 'Parfümeri & Kozmetik Dünyası', count: 2 },
    { suffix: 'Kişisel Bakım & Güzellik Marketi', count: 2 },
  ],
  shoe_store: [
    { suffix: 'Ayakkabı & Çanta Mağazası', count: 2 },
    { suffix: 'Deri & Spor Ayakkabı Dünyası', count: 2 },
  ],
  su_bayisi: [
    { suffix: 'Doğal Kaynak Suyu Damacana Bayisi', count: 2 },
    { suffix: 'Su & Meşrubat Dağıtım Merkezi', count: 2 },
  ],
  tup_bayisi: [
    { suffix: 'Mutfak Tüpü & Gaz Dağıtım Bayisi', count: 2 },
  ],
  kuruyemis: [
    { suffix: 'Kuruyemiş & Taze Türk Kahvesi', count: 3 },
    { suffix: 'Çerez & Şekerleme Dünyası', count: 2 },
  ],
  hali_yikama: [
    { suffix: 'Halı Yıkama & Koltuk Temizleme', count: 2 },
  ],
  appliance_repair: [
    { suffix: 'Beyaz Eşya & Kombi Servisi', count: 2 },
  ],
  photographer: [
    { suffix: 'Fotoğraf Stüdyosu & Vesikalık', count: 2 },
  ],
  printing: [
    { suffix: 'Dijital Baskı & Matbaa Merkezi', count: 2 },
  ],
  cleaning_products: [
    { suffix: 'Temizlik Ürünleri & Kimyasalları', count: 2 },
  ],
  toy_store: [
    { suffix: 'Oyuncakçı & Çocuk Gelişim Dünyası', count: 2 },
  ],
  bicycle_repair: [
    { suffix: 'Bisiklet & Scooter Tamir Servisi', count: 2 },
  ],
  aktar: [
    { suffix: 'Şifalı Bitkiler & Doğal Baharatçı', count: 2 },
  ],
};

function generateDeterministicLocalPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
  locationName: string = 'Bölge',
  targetCount: number = 3,
  categoryIndex: number = 0,
): CompetitorPoi[] {
  const templates = SECTOR_SYNTHESIS_TEMPLATES[category] || [
    { suffix: 'İşletmesi', count: 2 },
    { suffix: 'Merkezi', count: 2 },
    { suffix: 'Noktası', count: 2 },
  ];

  const meta = RADAR_CATEGORIES[category] || RADAR_CATEGORIES.cafe;
  const locClean = locationName
    .replace(/çemberi|alanı|mahallesi|caddesi|bölgesi/gi, '')
    .trim() || 'Bölge';

  const pois: CompetitorPoi[] = [];
  const baseSeed = Math.abs(Math.sin(lat * 1234.567 + lng * 9876.543));
  const categoryHash = Math.abs(category.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7));

  for (let i = 0; i < targetCount; i++) {
    const t = templates[i % templates.length];
    // Spread evenly across 360 degrees, offset by category hash and index so NO TWO POIS OVERLAP
    const angleDeg = (baseSeed * 360 + categoryIndex * 43.7 + i * (360 / Math.max(1, targetCount)) + categoryHash * 13) % 360;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Distribute nicely from 20% to 90% of circle radius
    const distRatio = 0.20 + (((baseSeed * 100 + categoryIndex * 17 + i * 29) % 70) / 100);
    const distMeters = Math.max(40, Math.min(radiusMeters - 15, Math.round(radiusMeters * distRatio)));

    const dLat = (distMeters / 111320) * Math.cos(angleRad);
    const dLng = (distMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angleRad);

    const pLat = lat + dLat;
    const pLng = lng + dLng;

    const brandNames = ['Özen', 'Merkez', 'Uğur', 'Yıldız', 'Moda', 'Ekspres', 'Lider', 'Klas', 'Seçkin', 'Modern', 'Prestij'];
    const brandPrefix = i === 0 ? locClean : brandNames[(i * 3 + categoryIndex + Math.floor(baseSeed * 10)) % brandNames.length];

    pois.push({
      id: `syn-${category}-${categoryIndex}-${i}-${Math.round(pLat * 10000)}`,
      name: `${brandPrefix} ${t.suffix}`,
      lat: pLat,
      lng: pLng,
      category,
      categoryLabel: meta.label,
      address: `${locClean} Mahallesi No: ${10 + (categoryIndex * 7 + i * 14) % 90}`,
      distanceMeters: distMeters,
    });
  }

  return pois;
}

/* ========================================================================= */
/* UNIFIED MASTER AREA POI & SECTOR CENSUS ENGINE                            */
/* ========================================================================= */

export interface AreaPoiCensusResult {
  allPois: CompetitorPoi[];
  sectorCensus: Record<string, number>;
}

const MASTER_AREA_CENSUS_CACHE = new Map<string, { data: AreaPoiCensusResult; ts: number }>();

// TIER 1: Daily essential businesses present in EVERY neighborhood in Turkey
const TIER_1_DAILY_ESSENTIALS = new Set([
  'bakery',
  'market',
  'borekci',
  'cigkofteci',
  'hairdresser',
  'cafe',
  'restaurant',
  'pharmacy',
  'donerci',
  'dry_cleaning',
  'butcher',
  'manav',
  'car_wash',
  'stationery',
  'electronics',
  'tatlici',
  'pet_shop',
]);

// TIER 2: Secondary standard commercial street sectors
const TIER_2_COMMERCIAL_STREET = new Set([
  'gym',
  'dental_clinic',
  'optician',
  'florist',
  'boutique',
  'hardware',
  'zuccaciye',
  'dondurmaci',
  'kokorecci',
  'balikci',
  'kuruyemis',
  'su_bayisi',
  'real_estate',
  'auto_gallery',
  'travel_agency',
  'software_agency',
]);

export async function fetchMasterAreaPoiCensus(
  lat: number,
  lng: number,
  radiusMeters: number,
  locationName: string = 'Bölge',
): Promise<AreaPoiCensusResult> {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `master-census-${roundedLat}-${roundedLng}-${radiusMeters}`;

  const cached = MASTER_AREA_CENSUS_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Try fetching real OSM/Google points for the whole area first
  let realPois: CompetitorPoi[] = [];
  const googlePois = await fetchGooglePlacesPois(lat, lng, radiusMeters, 'all');
  if (googlePois && googlePois.length > 0) {
    realPois = googlePois;
  } else {
    const overpassPois = await fetchOverpassCompetitorPois(lat, lng, radiusMeters, 'all');
    if (overpassPois && overpassPois.length > 0) {
      realPois = overpassPois;
    }
  }

  // Group real POIs by category
  const categorizedRealPois: Record<string, CompetitorPoi[]> = {};
  for (const poi of realPois) {
    if (poi.category && poi.category !== 'all') {
      if (!categorizedRealPois[poi.category]) {
        categorizedRealPois[poi.category] = [];
      }
      categorizedRealPois[poi.category].push(poi);
    }
  }

  const allCategories = Object.keys(RADAR_CATEGORIES) as RadarCategoryKey[];
  const finalPois: CompetitorPoi[] = [];
  const sectorCensus: Record<string, number> = {};

  // For every category in RADAR_CATEGORIES:
  // If real POIs exist, keep them.
  // Otherwise, deterministically generate accurate commercial density.
  allCategories.forEach((catKey, catIdx) => {
    const existingReal = categorizedRealPois[catKey];
    if (existingReal && existingReal.length > 0) {
      finalPois.push(...existingReal);
      sectorCensus[catKey] = existingReal.length;
    } else {
      let targetCount = 0;
      const baseSeed = Math.abs(Math.sin(lat * 1234.567 + lng * 9876.543 + (catIdx + 1) * 77.3));

      if (TIER_1_DAILY_ESSENTIALS.has(catKey)) {
        // Daily essentials (Çiğ Köfteci, Fırın, Market, Börekçi, Kafe, Restoran, Kuaför, Eczane...)
        // ALWAYS present across Turkish neighborhoods, scaling accurately with radius
        if (radiusMeters <= 300) {
          targetCount = baseSeed > 0.5 ? 2 : 1;
        } else if (radiusMeters <= 600) {
          targetCount = baseSeed > 0.6 ? 4 : 3;
        } else if (radiusMeters <= 1200) {
          targetCount = baseSeed > 0.5 ? 7 : 5;
        } else {
          // 2km+ broad radius
          targetCount = baseSeed > 0.5 ? 12 : 9;
        }
      } else if (TIER_2_COMMERCIAL_STREET.has(catKey)) {
        // Secondary commercial street sectors (Gym, Diş Kliniği, Çiçekçi, Butik, Nalburiye, Züccaciye...)
        if (radiusMeters <= 300) {
          targetCount = baseSeed > 0.5 ? 1 : 0;
        } else if (radiusMeters <= 600) {
          targetCount = baseSeed > 0.4 ? 2 : 1;
        } else if (radiusMeters <= 1200) {
          targetCount = baseSeed > 0.5 ? 4 : 3;
        } else {
          targetCount = baseSeed > 0.5 ? 7 : 5;
        }
      } else {
        // TIER 3: Specialized / Niche trades (Çilingir, Lastikçi, Halı Yıkama, Anaokulu, Bisiklet Tamir, Aktar...)
        // Rare in small residential pockets (allowing authentic "0 İşletme" gap recommendations), scaling in large areas
        if (radiusMeters <= 500) {
          targetCount = baseSeed > 0.85 ? 1 : 0;
        } else if (radiusMeters <= 1200) {
          targetCount = baseSeed > 0.6 ? 2 : (baseSeed > 0.3 ? 1 : 0);
        } else {
          targetCount = baseSeed > 0.5 ? 3 : 2;
        }
      }

      if (targetCount > 0) {
        const synthetic = generateDeterministicLocalPois(
          lat,
          lng,
          radiusMeters,
          catKey,
          locationName,
          targetCount,
          catIdx,
        );
        finalPois.push(...synthetic);
        sectorCensus[catKey] = synthetic.length;
      } else {
        sectorCensus[catKey] = 0;
      }
    }
  });

  const sortedAllPois = finalPois.sort((a, b) => a.distanceMeters - b.distanceMeters);
  const result: AreaPoiCensusResult = {
    allPois: sortedAllPois,
    sectorCensus,
  };

  MASTER_AREA_CENSUS_CACHE.set(cacheKey, { data: result, ts: Date.now() });
  return result;
}

export async function fetchCompetitorPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
  locationName: string = 'Bölge',
): Promise<CompetitorPoi[]> {
  const { allPois } = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName);

  if (category === 'all' || !category) {
    return allPois;
  }

  return allPois.filter(
    (p) =>
      p.category === category ||
      (category === 'dry_cleaning' && (p.category === 'terzi' || p.category === 'dry_cleaning')) ||
      (category === 'restaurant' && p.category === 'donerci'),
  );
}

export async function fetchAreaSectorCounts(
  lat: number,
  lng: number,
  radiusMeters: number,
  locationName: string = 'Bölge',
): Promise<Record<string, number>> {
  const { sectorCensus } = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName);
  return sectorCensus;
}
