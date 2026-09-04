import type { CompetitorPoi, RadarCategoryKey } from '@/types/radar.types';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';
import { calculateDistanceMeters, resolveDemographicProfile } from '@/features/radar/lib/spatial-calculator';

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
const SECTOR_COUNTS_CACHE = new Map<string, { data: Record<string, number>; ts: number }>();

const EXCLUDED_AMENITIES = new Set([
  'school',
  'place_of_worship',
  'hospital',
  'atm',
  'parking',
  'university',
  'college',
  'police',
  'fire_station',
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

const EXCLUDED_LEISURE = new Set([
  'park',
  'playground',
  'pitch',
  'garden',
  'nature_reserve',
  'common',
  'dog_park',
  'track',
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
  jewelry: ['["shop"="jewelry"]'],
  su_bayisi: ['["shop"~"beverages|water"]'],
  playstation_cafe: ['["leisure"~"video_arcade|amusement_arcade]'],
  internet_cafe: ['["amenity"="internet_cafe"]'],
  parti_evi: ['["amenity"~"childcare|events_venue]'],
  oto_ekspertiz: ['["shop"~"car_repair|car_parts]'],
  pilates_studio: ['["leisure"~"fitness_centre|dance]'],
  kitap_kafe: ['["amenity"~"cafe|library]'],
  tattoo_studio: ['["shop"="tattoo"]'],
  dietitian: ['["healthcare"~"dietitian|nutritionist]'],
  kargo_subesi: ['["amenity"~"post_office|parcel_locker]'],
  nail_art: ['["shop"~"beauty|nail_salon]'],
  guzellik_merkezi: ['["shop"~"beauty|massage]'],
  surucu_kursu: ['["amenity"="driving_school"]'],
  dil_kursu: ['["amenity"~"language_school|college]'],
  etut_merkezi: ['["amenity"~"school|prep_school]'],
  corbaci: ['["amenity"~"restaurant|fast_food]'],
  bufe_tost: ['["amenity"~"fast_food|kiosk]'],
  kahvalti_salonu: ['["amenity"~"restaurant|cafe]'],
  bubble_tea: ['["amenity"~"cafe|fast_food]'],
  psikolog: ['["healthcare"~"psychotherapist|counselling]'],
  noter: ['["amenity"="notary"]'],
  mali_musavir: ['["office"~"accountant|financial]'],
  motosiklet_servis: ['["shop"~"motorcycle|motorcycle_repair]'],
  oto_tuning: ['["shop"~"car_repair|car_parts]'],
  outdoor_kamp: ['["shop"~"outdoor|fishing|hunting]'],
  muzik_kursu: ['["shop"~"musical_instrument|music_school]'],
  antika_vintage: ['["shop"~"antiques|second_hand|vintage]'],
  tobacco_shop: ['["shop"="tobacco"]'],
  mimarlik_ofisi: ['["office"~"architect|interior_decorator]'],
  medikal_ortopedi: ['["shop"~"medical_supply|chemist]'],
  isitme_cihazi: ['["shop"~"hearing_aids|chemist]'],
  pub_meyhane: ['["amenity"~"pub|bar]'],
  waffle_cikolata: ['["shop"~"confectionery|pastry]'],
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
  insurance_agency: ['sigorta', 'sigorta acentesi', 'kasko', 'allianz', 'anadolu sigorta', 'axa sigorta', 'aksigorta'],
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
  jewelry: ['kuyumcu', 'sarraf', 'altın'],
  su_bayisi: ['su bayisi', 'damacana su'],
  playstation_cafe: ['playstation', 'ps5 cafe', 'oyun salonu'],
  internet_cafe: ['internet cafe', 'gaming cafe', 'e-spor'],
  parti_evi: ['parti evi', 'oyun evi', 'etkinlik evi'],
  oto_ekspertiz: ['oto ekspertiz', 'dyno test', 'computest'],
  pilates_studio: ['reformer pilates', 'pilates stüdyosu', 'yoga'],
  kitap_kafe: ['kitap kafe', 'kitap kahve', 'çalışma alanı'],
  tattoo_studio: ['dövme stüdyosu', 'tattoo', 'piercing'],
  dietitian: ['diyetisyen', 'beslenme danışmanlığı'],
  kargo_subesi: ['kargo şubesi', 'yurtiçi kargo', 'aras kargo', 'mng kargo', 'sürat kargo', 'ptt kargo', 'trendyol express'],
  nail_art: ['nail art', 'protez tırnak', 'kalıcı oje', 'manikür pedikür'],
  guzellik_merkezi: ['güzellik merkezi', 'lazer epilasyon', 'cilt bakımı'],
  surucu_kursu: ['sürücü kursu', 'ehliyet kursu', 'direksiyon eğitimi'],
  dil_kursu: ['dil kursu', 'ingilizce kursu', 'yabancı dil kursu'],
  etut_merkezi: ['etüt merkezi', 'yks kursu', 'lgs kursu', 'dershane'],
  corbaci: ['çorbacı', 'paçacı', 'işkembe çorbası', 'kelle paça'],
  bufe_tost: ['büfe', 'tostçu', 'sandviç büfesi', 'kumrucu'],
  kahvalti_salonu: ['kahvaltı salonu', 'serpme kahvaltı', 'köy kahvaltısı'],
  bubble_tea: ['bubble tea', 'boba tea', 'taze meyve suyu'],
  psikolog: ['psikolog', 'psikolojik danışmanlık', 'aile terapisti'],
  noter: ['noter', 'noterliği'],
  mali_musavir: ['mali müşavir', 'smmm', 'muhasebe ofisi'],
  motosiklet_servis: ['motosiklet servisi', 'motor tamiri', 'kurye ekipman'],
  oto_tuning: ['oto cam filmi', 'ppf kaplama', 'oto ses sistemi'],
  outdoor_kamp: ['kamp malzemeleri', 'balık avı', 'outdoor mağazası'],
  muzik_kursu: ['müzik kursu', 'gitar dersi', 'piyano kursu'],
  antika_vintage: ['antikacı', 'vintage mağaza', 'plakçı'],
  tobacco_shop: ['tobacco shop', 'tütüncü', 'puro nargile'],
  mimarlik_ofisi: ['mimarlık ofisi', 'iç mimarlık', 'tasarım atölyesi'],
  medikal_ortopedi: ['medikal', 'ortopedi market', 'hasta bakım'],
  isitme_cihazi: ['işitme cihazı merkezi', 'işitme cihazları'],
  pub_meyhane: ['pub', 'meyhane', 'bira evi', 'gastropub'],
  waffle_cikolata: ['waffle', 'çikolata dükkanı', 'el yapımı çikolata'],
  corporate_office: ['şirket', 'holding', 'genel müdürlük', 'plaza ofis', 'limited şirketi'],
  medical_clinic: ['klinik', 'muayenehane', 'doktor', 'poliklinik', 'özel klinik', 'tıp merkezi'],
  consulting_agency: ['danışmanlık', 'consulting', 'solutions', 'insan kaynakları', 'müşavirlik'],
  other_commercial: ['işletme', 'ticari', 'şube', 'merkez'],
};

function normalizeText(text: string | undefined): string {
  if (!text) return '';
  return (' ' + text + ' ')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function hasWord(text: string | undefined, words: string[]): boolean {
  if (!text) return false;
  const clean = normalizeText(text).replace(/[^a-z0-9]/g, ' ');
  return words.some((w) => {
    const cleanWord = normalizeText(w).replace(/[^a-z0-9]/g, ' ').trim();
    if (!cleanWord) return false;
    return clean.includes(' ' + cleanWord + ' ') || clean.includes(cleanWord);
  });
}

export function classifyPoi(
  name: string | undefined,
  tags: Record<string, string> | undefined,
): { key: RadarCategoryKey; label: string } {
  const gCat = tags?.googleCategory || tags?.categoryName || '';
  const n = ((name || '') + ' ' + gCat).trim();
  const amenity = (tags?.amenity || '').toLowerCase();
  const shop = (tags?.shop || '').toLowerCase();
  const office = (tags?.office || '').toLowerCase();
  const leisure = (tags?.leisure || '').toLowerCase();
  const craft = (tags?.craft || '').toLowerCase();

  // 0. Öncelikli Kurumsal, Medikal, Hukuk, Danışmanlık ve Hizmet Taraması
  if (
    hasWord(n, [
      'genel müdürlük', 'genel müdürlüğü', 'holding', 'holdingi', 'headquarters',
      'bölge müdürlüğü', 'iş merkezi', 'iş hanı', 'çarşısı', 'pasajı', 'pasaj',
      'sanayi ve ticaret', 'san. tic.', 'san tic', 'dış ticaret', 'lojistik',
      'inşaat', 'insaat', 'yapı sanayi', 'yapı', 'yapi', 'makine', 'makina', 'şube müdürlüğü', 'müteahhit', 'gayrimenkul geliştirme',
      'bina yönetimi', 'site yönetimi', 'eşya depolama', 'kiralık depo', 'depolama',
      'antrepo', 'mühendislik', 'şirketler grubu', 'ticaret ltd', 'a.ş', 'ltd. şti'
    ])
  ) {
    return { key: 'corporate_office', label: 'Kurumsal Şirket & Genel Müdürlük' };
  }

  if (
    hasWord(n, [
      'prof dr', 'op dr', 'uzm dr', 'doktor', 'doktoru', 'plastik cerrahi', 'estetik cerrah',
      'cerrahi', 'klinik', 'kliniği', 'muayenehane', 'muayenehanesi', 'poliklinik', 'polikliniği',
      'tıp merkezi', 'hastane', 'hastanesi', 'görüntüleme merkezi', 'radyoloji', 'eeg',
      'laboratuvar', 'fizik tedavi', 'sağlık ocağı', 'diyaliz', 'tedavi', 'sağlık merkezi'
    ])
  ) {
    return { key: 'medical_clinic', label: 'Doktor & Özel Muayenehane' };
  }

  if (
    office === 'lawyer' ||
    hasWord(n, ['avukat', 'avukatlık', 'hukuk', 'legal', 'law', 'arabulucu', 'arabuluculuk', 'attorney', 'hukuk bürosu'])
  ) {
    return { key: 'law_firm', label: 'Hukuk & Avukatlık Bürosu' };
  }

  if (
    hasWord(n, [
      'danışmanlık', 'danismanlik', 'consulting', 'consultancy', 'expat', 'solutions', 'insan kaynakları',
      'yurtdışı eğitim', 'yurtdisi egitim', 'tercüme', 'çeviri bürosu', 'yeminli tercüme', 'simultane',
      'oturma izni', 'çalışma izni', 'vize danışmanlığı', 'denetim', 'audit', 'müşavirlik', 'koçluk', 'araştırma merkezi'
    ])
  ) {
    return { key: 'consulting_agency', label: 'Danışmanlık & Kurumsal Hizmetler' };
  }

  // 0.1 Oto Tamir & Bakım Servisi
  if (
    shop === 'car_repair' ||
    craft === 'car_repair' ||
    hasWord(n, [
      'oto tamir', 'oto tamiri', 'oto servis', 'özel servis', 'oto bakım', 'oto mekanik',
      'kaporta', 'oto boya', 'hasar onarım', 'boyasız onarım', 'oto onarım', 'tamirhane',
      'bosch car service', 'motor ustası', 'oto şasi', 'egzoz', 'fren servisi', 'oto yedek parça', 'oto yedek',
      'motor mekanik', 'nissan', 'bmw', 'mercedes', 'mersedes', 'audi', 'volkswagen', 'fiat', 'renault',
      'ford', 'hyundai', 'honda', 'toyota', 'opel', 'peugeot', 'citroen', 'oto cam', 'otofix',
      'seçkin oto', 'erden oto', 'güren oto', 'merve oto', 'aydoğan oto', 'referans oto', 'yılmaz oto', 'oto ekspertiz',
      'mtc oto', 'oto yavuzlar', 'tosunlar oto', 'volda garage', 'garage'
    ])
  ) {
    return { key: 'oto_tamir', label: 'Oto Tamir & Bakım Servisi' };
  }

  // 0.2 Parfümeri & Kozmetik
  if (
    shop === 'perfumery' ||
    shop === 'cosmetics' ||
    hasWord(n, [
      'parfümeri', 'parfumeri', 'parfüm', 'parfum', 'kozmetik', 'watsons', 'gratis', 'rossmann', 'sephora',
      'lelas', 'loris', 'bargello', 'eyfel', 'd&p', 'flormar', 'golden rose', 'mad parfüm', 'kişisel bakım', 'cosmetics'
    ])
  ) {
    return { key: 'parfumeri', label: 'Parfümeri & Kozmetik' };
  }

  // 0.3 Ayakkabı & Çanta Mağazası
  if (
    shop === 'shoes' ||
    shop === 'bag' ||
    hasWord(n, [
      'ayakkabı', 'ayakkabi', 'ayakkabıcı', 'kundura', 'sneaker', 'çanta', 'canta', 'çantacı', 'flo',
      'deichmann', 'skechers', 'superstep', 'sport in street', 'derimod', 'kemal tanca', 'elle', 'tergan', 'hotiç', 'greyder', 'iskarpin', 'gezer'
    ])
  ) {
    return { key: 'shoe_store', label: 'Ayakkabı & Çanta Mağazası' };
  }

  // 0.4 Nalbur & Hırdavat / Yapı Market
  if (
    shop === 'hardware' ||
    shop === 'doityourself' ||
    hasWord(n, [
      'nalbur', 'nalburu', 'hırdavat', 'hirdavat', 'hırdavatçı', 'yapı market', 'boya badana', 'alüminyum',
      'demir çelik', 'tesisat', 'su tesisatı', 'koçtaş', 'bauhaus', 'tekzen', 'bıçakçılık', 'yapı sistemleri',
      'camcı', 'camcilik', 'cam', 'pimapen', 'winsa', 'fıratpen', 'egepen', 'tente', 'branda', 'sineklik',
      'yapı malzemeleri', 'inşaat malzemeleri', 'insaat malzemeleri', 'inşat malzemeleri', 'inşşat malzemeleri',
      'avize', 'aydınlatma', 'boya', 'boyacı', 'elektrik', 'elektirik', 'bobinaj', 'karot', 'çelik cam',
      'ece pen', 'seven boya', 'mermer', 'duvar kağıdı', 'akan teknik', 'decolight'
    ])
  ) {
    return { key: 'hardware', label: 'Nalbur & Hırdavat' };
  }

  // 0.5 Züccaciye, Mutfak Eşyaları & Ev Gereçleri
  if (
    shop === 'houseware' ||
    shop === 'kitchen' ||
    hasWord(n, [
      'züccaciye', 'zuccaciye', 'mutfak eşyaları', 'paşabahçe', 'pasabahce', 'karaca', 'madame coco',
      'english home', 'porland', 'kütahya porselen', 'güral porselen', 'güral', 'bernardo', 'hisar', 'emsan',
      'jumbo', 'çeyiz', 'ev gereçleri', 'kristal', 'mefruşat', 'evidea', 'evkur', 'tedi', 'paspas dünyası',
      'korkmaz', 'spot', 'ev shop'
    ])
  ) {
    return { key: 'zuccaciye', label: 'Züccaciye & Mutfak Eşyası' };
  }

  // 0.6 Oyuncakçı & Hobi Mağazası
  if (
    shop === 'toys' ||
    hasWord(n, [
      'oyuncak', 'oyuncakçı', 'toyzz shop', 'armağan oyuncak', 'toys r us', 'figür', 'figur', 'maket',
      'hobi mağazası', 'puzzle', 'lego', 'köstebek', 'kostebek', 'gargamel', 'hobby', 'parti outlet',
      'toys', 'hediye', 'hediyelik'
    ])
  ) {
    return { key: 'toy_store', label: 'Oyuncakçı & Hobi Mağazası' };
  }

  // 0.7 Aktar & Şifalı Bitkiler
  if (
    shop === 'herbalist' ||
    hasWord(n, [
      'aktar', 'aktarı', 'şifalı bitkiler', 'baharatçı', 'baharat', 'doğal ürünler', 'bitkisel ürünler',
      'organik aktar', 'derman', 'tarçın', 'tarcin', 'safran', 'nane', 'doğal', 'dogal', 'organik', 'deva', 'saraçoğlu', 'saracoglu'
    ])
  ) {
    return { key: 'aktar', label: 'Aktar & Şifalı Bitkiler' };
  }

  // 0.8 Matbaa, Ozalit & Dijital Baskı
  if (
    shop === 'copyshop' ||
    craft === 'printer' ||
    hasWord(n, [
      'matbaa', 'matbaası', 'dijital baskı', 'tabela', 'ozalit', 'ozalitçi', 'plaket', 'etiket baskı',
      'baskı merkezi', 'copy center', 'fotokopi merkezi', 'copy', 'print'
    ])
  ) {
    return { key: 'printing', label: 'Matbaa & Dijital Baskı' };
  }

  // 0.9 Temizlik & Ambalaj Malzemeleri
  if (
    shop === 'chemist' ||
    hasWord(n, [
      'temizlik ürünleri', 'temizlik malzemeleri', 'temizlik', 'deterjan', 'ambalaj', 'ambalaj sanayi', 'koli',
      'kutu ambalaj', 'plastik ambalaj', 'hijyen'
    ])
  ) {
    return { key: 'cleaning_products', label: 'Temizlik & Ambalaj Malzemeleri' };
  }

  // 0.10 Beyaz Eşya Servisi & Kombi / Klima
  if (
    hasWord(n, [
      'beyaz eşya servisi', 'beyaz eşya tamiri', 'kombi servisi', 'kombi tamiri', 'klima servisi',
      'yetkili servis', 'arçelik servisi', 'beko servisi', 'bosch servisi', 'siemens servisi',
      'vestel servisi', 'arçelik', 'arcelik', 'beko', 'profilo', 'viessmann', 'termodinamik',
      'vaillant', 'demirdöküm', 'baymak', 'daikin', 'su arıtma', 'singer', 'bosch', 'siemens'
    ])
  ) {
    return { key: 'appliance_repair', label: 'Beyaz Eşya & Kombi Servisi' };
  }

  // 0.11 Tüp Bayisi & Su Dağıtım
  if (
    shop === 'gas' ||
    hasWord(n, [
      'tüp bayisi', 'tup bayisi', 'tüpçü', 'aygaz', 'ipragaz', 'milangaz', 'bizimgaz', 'likidgaz', 'mutfak tüpü',
      'sucu', 'su bayisi', 'kuvar su', 'kuvars su', 'kardelen su', 'damacana', 'erikli', 'sırma', 'hayat su', 'pınar su', 'hamidiye', 'kaynak suyu'
    ])
  ) {
    return { key: 'tup_bayisi', label: 'Tüp Bayisi' };
  }

  // 0.12 Kuruyemiş & Şekerleme
  if (
    shop === 'nuts' ||
    hasWord(n, [
      'kuruyemiş', 'kuruyemis', 'kuruyemişçi', 'çerez', 'leblebi', 'fındık', 'fıstık', 'tuğba kuruyemiş',
      'malatya pazarı', 'şekerci', 'lokumcu', 'helvacı', 'çerezci', 'ecleristan'
    ])
  ) {
    return { key: 'kuruyemis', label: 'Kuruyemiş & Şekerleme' };
  }

  // 0.13 Halı Yıkama & Koltuk Temizleme
  if (
    hasWord(n, ['halı yıkama', 'hali yikama', 'koltuk yıkama', 'koltuk temizleme', 'halı temizleme', 'halıflex'])
  ) {
    return { key: 'hali_yikama', label: 'Halı Yıkama & Koltuk Temizleme' };
  }

  // 0.14 Fotoğrafçı & Stüdyo
  if (
    shop === 'photo' ||
    hasWord(n, [
      'fotoğrafçı', 'fotografci', 'fotoğraf stüdyosu', 'vesikalık', 'biyometrik', 'foto stüdyo',
      'düğün fotoğrafçısı', 'stüdyo fotoğraf', 'fotograf', 'kodak', 'kodak express', 'fujifilm'
    ])
  ) {
    return { key: 'photographer', label: 'Fotoğrafçı & Stüdyo' };
  }

  // 0.15 Bisiklet Satış & Servis
  if (
    shop === 'bicycle' ||
    hasWord(n, [
      'bisiklet', 'bisikletçi', 'bisiklet tamiri', 'salcano', 'carraro', 'kron', 'scooter tamir',
      'elektrikli scooter servisi'
    ])
  ) {
    return { key: 'bicycle_repair', label: 'Bisiklet Satış & Servis' };
  }

  // 0.16 Perde & Ev Tekstili
  if (
    shop === 'curtain' ||
    shop === 'fabric' ||
    hasWord(n, [
      'perde', 'perdeci', 'tül perde', 'stor perde', 'ev tekstili', 'döşemelik', 'mefruşat',
      'taç', 'brillant', 'linens', 'yatak örtüsü', 'halı', 'hali', 'halıcı'
    ])
  ) {
    return { key: 'perde', label: 'Perde & Ev Tekstili' };
  }

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
    hasWord(n, [
      'kasap', 'kasabı', 'şarküteri', 'sarkuteri', 'et pazarı', 'et reyonu', 'tavukçu', 'et tavuk',
      'peynirci', 'peynirci baba', 'çiftliği', 'ciftligi', 'mandıra', 'mandira', 'kaya çiftliği', 'ovacık çiftliği',
      'sütçü', 'yoğurthane', 'süt ürünleri', 'sut urunleri'
    ])
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

  // 7. Kuaför & Berber & Güzellik / Kozmetik
  if (
    shop === 'hairdresser' ||
    shop === 'beauty' ||
    shop === 'cosmetics' ||
    hasWord(n, [
      'kuaför', 'kuafor', 'kuaförü', 'berber', 'berberi', 'güzellik', 'güzellik merkezi', 'güzellik salonu',
      'barber', 'barbershop', 'nail', 'estetik', 'saç tasarım', 'cosmetics', 'kozmetik', 'parfümeri',
      'hair', 'esthetic', 'kalıcı makyaj', 'dövme silme'
    ])
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
  if (hasWord(n, ['tatlı', 'tatlıcı', 'tatlicisi', 'baklava', 'baklavacı', 'künefe', 'kadayıf', 'güllüoğlu', 'lokum', 'hafız mustafa', 'helvacı', 'trileçe', 'tatbak', 'seyidoğlu', 'hacı sayid', 'profiterol'])) {
    return { key: 'tatlici', label: 'Tatlıcı & Baklavacı' };
  }

  // 17. Kafe & Kahve
  if (
    amenity === 'cafe' ||
    amenity === 'coffee_shop' ||
    hasWord(n, ['kahve', 'kahvesi', 'cafe', 'coffee', 'kafe', 'espresso', 'roaster', 'roastery', 'starbucks', 'kahve dünyası', 'espresso lab', 'çay bahçesi', 'çay ocağı', 'hookah', 'nargile', 'bistro', 'kıraathane', 'kiraathane', 'kıraathanesi', 'kıraathene', 'kiraathene', 'kahvehane', 'gazozcu', 'gazozcusu'])
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
    hasWord(n, ['butik', 'giyim', 'moda', 'tekstil', 'boutique', 'lingerie', 'ayakkabı', 'çanta', 'abiye', 'tasarım', 'tuhafiye', 'bijuteri', 'taki', 'takı', 'outlet'])
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
  if (shop === 'furniture' || hasWord(n, ['mobilya', 'koltuk', 'yatak', 'dekorasyon', 'bellona', 'istikbal', 'doğtaş', 'kelebek', 'perde', 'perdeci', 'enza home', 'enza', 'mondi', 'modalife', 'yataş', 'çilek mobilya', 'puffy'])) {
    return { key: 'furniture', label: 'Mobilya & Ev Dekorasyon' };
  }

  // 28. Elektronik & GSM
  if (shop === 'electronics' || hasWord(n, ['elektronik', 'telefon', 'bilgisayar', 'teknoloji', 'gsm', 'tamir', 'turkcell', 'vodafone', 'türk telekom', 'teknik servis', 'iletişim', 'iletisim', 'marmara iletişim', 'cep telefonu', 'mobil', 'cep aksesuar', 'tekno cep'])) {
    return { key: 'electronics', label: 'Elektronik & GSM' };
  }

  // 29. Avukat & Hukuk Bürosu
  if (office === 'lawyer' || hasWord(n, ['avukat', 'avukatlık', 'hukuk', 'arabulucu', 'arabuluculuk', 'law', 'legal', 'attorney', 'danışmanlık ve hukuk', 'hukuk bürosu'])) {
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
  if (shop === 'travel_agency' || office === 'travel_agent' || hasWord(n, ['turizm', 'seyahat', 'turizm acentesi', 'bilet', 'uçak bileti', 'tur', 'turizm seyahat', 'otel', 'oteli', 'hotel', 'pansiyon', 'konaklama'])) {
    return { key: 'travel_agency', label: 'Turizm & Seyahat Acentesi' };
  }

  // 33. Yazılım & Dijital Ajans
  if (office === 'it' || hasWord(n, ['yazılım', 'dijital ajans', 'reklam ajansı', 'bilişim', 'web tasarım', 'ajans', 'yazilim', 'ajansı', 'software', 'bilgisayar'])) {
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

  // 37. Noter & Resmi Onay Dairesi
  if (
    amenity === 'notary' ||
    hasWord(n, ['noter', 'noteri', 'noterlik', 'noterliği', 'noterliğ', 'notary'])
  ) {
    return { key: 'noter', label: 'Noter & Resmi Onay Dairesi' };
  }

  // 38. Kargo Şubesi & Dağıtım
  if (
    amenity === 'post_office' ||
    hasWord(n, ['kargo', 'kargosu', 'kargo şubesi', 'yurtiçi kargo', 'yurtici kargo', 'aras kargo', 'mng kargo', 'sürat kargo', 'surat kargo', 'ptt kargo', 'ptt şubesi', 'ptt', 'posta', 'trendyol express', 'hepsijet', 'kolay gelsin', 'ups kargo', 'ups', 'dhl', 'fedex', 'scotty'])
  ) {
    return { key: 'kargo_subesi', label: 'Kargo Şubesi & Dağıtım' };
  }

  // 39. Kuyumcu & Sarraf
  if (
    shop === 'jewelry' ||
    hasWord(n, ['kuyumcu', 'kuyumculuk', 'sarraf', 'sarrafiye', 'altın', 'pırlanta', 'gümüşçü', 'mücevher', 'mücevherat', 'atasay', 'altınbaş', 'zen pırlanta', 'koçak'])
  ) {
    return { key: 'jewelry', label: 'Kuyumcu & Sarraf' };
  }

  // 40. Oto Ekspertiz
  if (
    hasWord(n, ['oto ekspertiz', 'ekspertiz', 'computest', 'dyno', 'pilot garage', 'otorapor', 'dynobil', 'umran oto', 'eft oto'])
  ) {
    return { key: 'oto_ekspertiz', label: 'Oto Ekspertiz' };
  }

  // 41. Su & Tüp Bayisi
  if (
    hasWord(n, ['su bayisi', 'su bayii', 'damacana', 'erikli', 'hayat su', 'sırma', 'hamidiye su', 'pınar su', 'buzdağı', 'abant su', 'tüp ve su', 'aygaz'])
  ) {
    return { key: 'su_bayisi', label: 'Su & Tüp Bayisi' };
  }

  // 42. Mali Müşavir & Muhasebe
  if (
    office === 'accountant' ||
    office === 'financial' ||
    hasWord(n, ['mali müşavir', 'mali musavir', 'muhasebe', 'muhasebeci', 'smmm', 'serbest muhasebeci', 'yeminli mali müşavir', 'ymm', 'vergi danışmanı'])
  ) {
    return { key: 'mali_musavir', label: 'Mali Müşavir & Muhasebe' };
  }

  // 43. Güzellik Merkezi & Bakım
  if (
    hasWord(n, ['güzellik merkezi', 'güzellik salonu', 'lazer epilasyon', 'cilt bakımı', 'estetisyen', 'medikal estetik', 'epilasyon'])
  ) {
    return { key: 'guzellik_merkezi', label: 'Güzellik Merkezi & Bakım' };
  }

  // 44. Nail Art & Tırnak Stüdyosu
  if (
    hasWord(n, ['nail art', 'nail studio', 'protez tırnak', 'kalıcı oje', 'manikür', 'pedikür', 'ipek kirpik'])
  ) {
    return { key: 'nail_art', label: 'Nail Art & Tırnak Stüdyosu' };
  }

  // 45. Pilates & Yoga Stüdyosu
  if (
    hasWord(n, ['reformer pilates', 'pilates stüdyosu', 'pilates studio', 'yoga stüdyosu', 'yoga studio', 'reformer', 'aletli pilates'])
  ) {
    return { key: 'pilates_studio', label: 'Pilates & Yoga Stüdyosu' };
  }

  // 46. Sürücü Kursu
  if (
    amenity === 'driving_school' ||
    hasWord(n, ['sürücü kursu', 'surucu kursu', 'ehliyet kursu', 'motorlu taşıtlar sürücü kursu', 'mtszk', 'direksiyon'])
  ) {
    return { key: 'surucu_kursu', label: 'Sürücü Kursu' };
  }

  // 47. Dil Kursu
  if (
    amenity === 'language_school' ||
    hasWord(n, ['dil kursu', 'ingilizce kursu', 'yabancı dil', 'british time', 'american life', 'amerikan kültür', 'wall street', 'tömer'])
  ) {
    return { key: 'dil_kursu', label: 'Yabancı Dil Kursu' };
  }

  // 48. Etüt & Sınav Hazırlık
  if (
    hasWord(n, ['etüt merkezi', 'etut merkezi', 'özel öğretim kursu', 'yks kursu', 'lgs kursu', 'dershane', 'vip kurs', 'özel ders'])
  ) {
    return { key: 'etut_merkezi', label: 'Etüt & Sınav Hazırlık' };
  }

  // 49. Çorbacı & Gece Lezzeti
  if (
    hasWord(n, ['çorbacı', 'corbaci', 'çorba salonu', 'paçacı', 'işkembe', 'kelle paça'])
  ) {
    return { key: 'corbaci', label: 'Çorbacı & Gece Lezzeti' };
  }

  // 50. Büfe & Tost Sandviç
  if (
    amenity === 'kiosk' ||
    hasWord(n, [
      'büfe', 'bufe', 'tostçu', 'tost salonu', 'sandviç', 'kumrucu', 'patso', 'marmaris büfe',
      'iddaa', 'iddia', 'sayısal loto', 'ganyan', 'şans oyunları'
    ])
  ) {
    return { key: 'bufe_tost', label: 'Büfe & Tost Sandviç' };
  }

  // 51. Kahvaltı Salonu
  if (
    hasWord(n, ['kahvaltı salonu', 'kahvaltıcı', 'van kahvaltı', 'serpme kahvaltı', 'kahvaltı evi', 'breakfast'])
  ) {
    return { key: 'kahvalti_salonu', label: 'Kahvaltı Salonu' };
  }

  // 52. Bubble Tea Dükkanı
  if (
    hasWord(n, ['bubble tea', 'boba tea', 'boba', 'tapioca'])
  ) {
    return { key: 'bubble_tea', label: 'Bubble Tea Dükkanı' };
  }

  // 53. Psikolog & Terapi Merkezi
  if (
    hasWord(n, ['psikolog', 'psikolojik danışmanlık', 'klinik psikolog', 'terapi merkezi', 'aile danışmanı', 'psikoterapi'])
  ) {
    return { key: 'psikolog', label: 'Psikolog & Terapi Merkezi' };
  }

  // 54. Motosiklet Servis & Ekipman
  if (
    shop === 'motorcycle' ||
    hasWord(n, [
      'motosiklet', 'motor servisi', 'motosiklet tamir', 'motor tamiri', 'motul', 'kask mont',
      'scooter servisi', 'motorcycle', 'motor garage', 'garage motorcycle', 'redline', 'karla motor'
    ])
  ) {
    return { key: 'motosiklet_servis', label: 'Motosiklet Servis & Ekipman' };
  }

  // 55. Oto Aksesuar & Tuning
  if (
    hasWord(n, ['oto tuning', 'tuning', 'tunning', 'cam filmi', 'ppf kaplama', 'ses sistemi', 'oto ses ve görüntü', 'body kit', 'chip tuning'])
  ) {
    return { key: 'oto_tuning', label: 'Oto Aksesuar & Tuning' };
  }

  // 56. Diyetisyen & Beslenme
  if (
    hasWord(n, ['diyetisyen', 'beslenme ve diyet', 'uzman diyetisyen', 'sağlıklı beslenme', 'nutritionist'])
  ) {
    return { key: 'dietitian', label: 'Diyetisyen & Beslenme' };
  }

  // 57. PlayStation & Oyun Salonu
  if (
    hasWord(n, ['playstation', 'ps cafe', 'ps5 cafe', 'oyun salonu', 'game center', 'gaming cafe', 'espor'])
  ) {
    return { key: 'playstation_cafe', label: 'PlayStation & Oyun Salonu' };
  }

  // 58. İnternet Cafe
  if (
    amenity === 'internet_cafe' ||
    hasWord(n, ['internet cafe', 'internet kafe', 'net cafe', 'cyber cafe'])
  ) {
    return { key: 'internet_cafe', label: 'İnternet Cafe' };
  }

  // 59. Dövme & Piercing Stüdyosu
  if (
    shop === 'tattoo' ||
    hasWord(n, ['tattoo', 'dövme stüdyosu', 'dövmeci', 'piercing', 'tattoos'])
  ) {
    return { key: 'tattoo_studio', label: 'Dövme & Piercing Stüdyosu' };
  }

  // 60. Kitap Kafe & Çalışma Alanı
  if (
    hasWord(n, ['kitap kafe', 'kitap kahve', 'book cafe', 'çalışma alanı', 'ders çalışma kafe'])
  ) {
    return { key: 'kitap_kafe', label: 'Kitap Kafe & Çalışma Alanı' };
  }

  // 61. Çocuk Parti & Oyun Evi
  if (
    hasWord(n, ['parti evi', 'oyun evi', 'çocuk parti', 'soft play', 'doğum günü parti evi', 'düğün salonu', 'dugun salonu'])
  ) {
    return { key: 'parti_evi', label: 'Çocuk Parti & Oyun Evi' };
  }

  // 62. Pub, Bar & Meyhane
  if (
    amenity === 'pub' ||
    amenity === 'bar' ||
    hasWord(n, ['pub', 'meyhane', 'bira', 'beer', 'gastropub', 'bar', 'şarap evi', 'meyhanesi'])
  ) {
    return { key: 'pub_meyhane', label: 'Pub, Bar & Meyhane' };
  }

  // 63. Waffle & Çikolata Dükkanı
  if (
    hasWord(n, ['waffle', 'wafflecı', 'çikolata', 'chocolatier', 'kahve çikolata', 'waffle evi'])
  ) {
    return { key: 'waffle_cikolata', label: 'Waffle & Çikolata Dükkanı' };
  }

  // 64. Mimarlık & Tasarım Ofisi
  if (
    office === 'architect' ||
    hasWord(n, ['mimarlık', 'iç mimarlık', 'mimarlık ofisi', 'proje tasarım', 'peyzaj mimarlığı', 'architecture'])
  ) {
    return { key: 'mimarlik_ofisi', label: 'Mimarlık & Tasarım Ofisi' };
  }

  // 65. Medikal, Ortopedi & İlaç / Biyoteknoloji
  if (
    shop === 'medical_supply' ||
    hasWord(n, [
      'medikal', 'ortopedi', 'tıbbi malzeme', 'hasta bezi', 'medikal market', 'tekerlekli sandalye',
      'pharma', 'ilaç', 'ilaç şirketi', 'biotech', 'safe medical', 'ecza deposu', 'hacettepe ecza deposu'
    ])
  ) {
    return { key: 'medikal_ortopedi', label: 'Medikal & Ortopedi Ürünleri' };
  }

  // 66. İşitme Cihazları Merkezi
  if (
    shop === 'hearing_aids' ||
    hasWord(n, ['işitme cihazı', 'isitme cihazi', 'işitme merkezi', 'odyoloji'])
  ) {
    return { key: 'isitme_cihazi', label: 'İşitme Cihazları Merkezi' };
  }

  // 67. Tobacco Shop & Nargile
  if (
    shop === 'tobacco' ||
    hasWord(n, ['tobacco', 'tütüncü', 'tütün', 'nargile malzemeleri', 'puro', 'tobacco shop'])
  ) {
    return { key: 'tobacco_shop', label: 'Tobacco Shop & Nargile' };
  }

  // 68. Müzik Kursu & Enstrüman
  if (
    hasWord(n, ['müzik kursu', 'gitar kursu', 'piyano kursu', 'müzik aletleri', 'enstrüman', 'müzik merkezi', 'muzik merkezi'])
  ) {
    return { key: 'muzik_kursu', label: 'Müzik Kursu & Enstrüman' };
  }

  // 69. Antika & Vintage Mağazası
  if (
    shop === 'antiques' ||
    hasWord(n, ['antika', 'vintage', 'mezat', 'antikacı', 'ikinci el saat'])
  ) {
    return { key: 'antika_vintage', label: 'Antika & Vintage Mağazası' };
  }

  // 70. Outdoor & Kamp Malzemeleri
  if (
    hasWord(n, ['kamp malzemeleri', 'outdoor', 'avcılık', 'balık av malzemeleri', 'olta', 'spor malzemeleri'])
  ) {
    return { key: 'outdoor_kamp', label: 'Outdoor & Kamp Malzemeleri' };
  }

  // 71. Doktor, Poliklinik & Özel Muayenehane
  if (
    amenity === 'clinic' ||
    amenity === 'doctors' ||
    tags?.healthcare === 'doctor' ||
    tags?.healthcare === 'clinic' ||
    hasWord(n, [
      'doktor', 'doktoru', 'dr', 'prof dr', 'op dr', 'uzm dr', 'klinik', 'kliniği',
      'muayenehane', 'muayenehanesi', 'poliklinik', 'polikliniği', 'tıp merkezi',
      'cerrahi', 'plastik cerrahi', 'estetik cerrahi', 'dermatoloji', 'göz kliniği',
      'fizik tedavi', 'sağlık merkezi', 'ortopedi kliniği', 'kardiyoloji', 'dahiliye', 'estetik plastik'
    ])
  ) {
    return { key: 'medical_clinic', label: 'Doktor & Özel Muayenehane' };
  }

  // 72. Danışmanlık & Kurumsal Hizmetler
  if (
    office === 'consulting' ||
    office === 'advisor' ||
    hasWord(n, [
      'danışmanlık', 'danismanlik', 'danışmanlığı', 'consulting', 'consultancy', 'solutions',
      'expat', 'insan kaynakları', 'ik danışmanlık', 'yönetim danışmanlığı', 'finansal danışmanlık',
      'gümrük müşavirliği', 'denetim', 'audit', 'advisory', 'belgelendirme', 'hizmetleri'
    ])
  ) {
    return { key: 'consulting_agency', label: 'Danışmanlık & Kurumsal Hizmetler' };
  }

  // 73. Kurumsal Şirket, Ofis & Genel Müdürlük
  if (
    office === 'company' ||
    office === 'corporate' ||
    office === 'headquarters' ||
    office === 'commercial' ||
    hasWord(n, [
      'genel müdürlük', 'genel müdürlüğü', 'holding', 'holdingi', 'şirket', 'şirketi',
      'a ş', 'aş', 'ltd şti', 'sanayi ve ticaret', 'san ve tic', 'plaza', 'ofis',
      'merkez ofis', 'bölge müdürlüğü', 'headquarters', 'group', 'grup', 'lojistik',
      'pazarlama', 'ithalat', 'ihracat', 'endüstriyel'
    ])
  ) {
    return { key: 'corporate_office', label: 'Kurumsal Şirket & Genel Müdürlük' };
  }

  // Fallbacks based on verified commercial OSM tag
  if (shop) return { key: 'other_commercial', label: 'Perakende & Mağaza' };
  if (amenity) return { key: 'restaurant', label: 'Yeme & İçme' };
  if (office) return { key: 'corporate_office', label: 'Kurumsal Ofis & Şirket' };
  if (craft) return { key: 'terzi', label: 'Zanaat & Atölye' };
  if (tags?.healthcare) return { key: 'medical_clinic', label: 'Sağlık & Medikal Klinik' };
  if (tags?.tourism) return { key: 'travel_agency', label: 'Turizm & Seyahat' };
  if (tags?.leisure) return { key: 'gym', label: 'Spor & Aktivite' };

  return { key: 'other_commercial', label: 'Genel Ticari İşletme & Ofis' };
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
  market: { keyword: 'süpermarket OR market OR Migros OR Carrefour OR BİM OR A101 OR ŞOK OR File Market OR Macrocenter', fallbackLabel: 'Süpermarket & Bakkal' },
  hairdresser: { keyword: 'kuaför OR berber OR güzellik salonu OR estetik OR barber OR saç tasarım', fallbackLabel: 'Kuaför & Güzellik' },
  gym: { keyword: 'spor salonu OR fitness OR pilates OR yoga OR gym OR crossfit OR boks', fallbackLabel: 'Spor Salonu & Fitness' },
  pharmacy: { keyword: 'eczane OR medikal OR eczanesi', fallbackLabel: 'Eczane & Medikal' },
  car_wash: { keyword: 'oto yıkama OR detailing OR oto kuaför OR oto yikama OR seramik kaplama', fallbackLabel: 'Oto Yıkama & Detailing' },
  restaurant: { keyword: 'restoran OR lokanta OR kebapçı OR köfteci OR yemek OR bistro', fallbackLabel: 'Restoran & Lokanta' },
  boutique: { keyword: 'butik OR giyim mağazası OR elbise OR moda butik OR ayakkabı', fallbackLabel: 'Butik & Giyim Mağazası' },
  dry_cleaning: { keyword: 'kuru temizleme OR terzi OR lostra OR halı yıkama OR terzihane', fallbackLabel: 'Kuru Temizleme & Terzi' },
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
  oto_tamir: { keyword: 'oto tamir OR oto servis OR oto mekanik OR araç bakım OR motor ustası', fallbackLabel: 'Oto Tamir & Mekanik Servis' },
  noter: { keyword: 'noter OR noterliği OR noterlik', fallbackLabel: 'Noter & Resmi Onay Dairesi' },
  kargo_subesi: { keyword: 'kargo OR Yurtiçi Kargo OR Aras Kargo OR MNG Kargo OR Sürat Kargo OR PTT Kargo OR Trendyol Express', fallbackLabel: 'Kargo & Lojistik Dağıtım Şubesi' },
  zuccaciye: { keyword: 'züccaciye OR mutfak eşyaları OR ev gereçleri OR tabak bardak OR Karaca OR Paşabahçe', fallbackLabel: 'Züccaciye & Ev Eşyaları' },
  hardware: { keyword: 'nalbur OR hırdavat OR nalburiye OR yapı market OR boya', fallbackLabel: 'Nalbur & Yapı Hırdavat' },
  perde: { keyword: 'perdeci OR tül perde OR stor perde OR mefruşat OR perde tasarım', fallbackLabel: 'Perde & Mefruşat' },
  jewelry: { keyword: 'kuyumcu OR sarraf OR altın gümüş OR takı kuyumculuk', fallbackLabel: 'Kuyumcu & Sarraf' },
  parfumeri: { keyword: 'parfümeri OR kozmetik OR parfümeri mağazası OR Gratis OR Watsons OR Rossmann', fallbackLabel: 'Kozmetik & Parfümeri' },
  shoe_store: { keyword: 'ayakkabıcı OR ayakkabı mağazası OR kundura OR spor ayakkabı OR FLO', fallbackLabel: 'Ayakkabı & Çanta Mağazası' },
  su_bayisi: { keyword: 'su bayisi OR damacana su OR Erikli OR Saka OR Sırma OR Hayat Su', fallbackLabel: 'Su Dağıtım & Damacana Bayisi' },
  tup_bayisi: { keyword: 'tüpçü OR tüp bayisi OR Aygaz OR İpragaz OR Milangaz OR mutfak tüpü', fallbackLabel: 'Tüp Dağıtım & Mutfak Gazı' },
  kuruyemis: { keyword: 'kuruyemiş OR kuruyemişçi OR çerez OR leblebici OR kahve kuruyemiş', fallbackLabel: 'Kuruyemiş & Çerez Evi' },
  hali_yikama: { keyword: 'halı yıkama OR koltuk yıkama OR stor perde yıkama OR halı temizleme', fallbackLabel: 'Halı & Koltuk Yıkama' },
  appliance_repair: { keyword: 'beyaz eşya tamiri OR beyaz eşya servisi OR buzdolabı tamiri OR çamaşır makinesi tamiri OR kombi servisi', fallbackLabel: 'Beyaz Eşya & Küçük Ev Aletleri Servisi' },
  photographer: { keyword: 'fotoğrafçı OR vesikalık OR düğün fotoğrafçısı OR fotoğraf stüdyosu', fallbackLabel: 'Fotoğraf Stüdyosu' },
  printing: { keyword: 'matbaa OR ozalit OR fotokopi merkezi OR dijital baskı OR baskı', fallbackLabel: 'Matbaa & Dijital Baskı Merkezi' },
  cleaning_products: { keyword: 'temizlik ürünleri OR deterjan OR endüstriyel temizlik OR toptan temizlik', fallbackLabel: 'Endüstriyel & Ev Temizlik Ürünleri' },
  toy_store: { keyword: 'oyuncakçı OR oyuncak mağazası OR çocuk oyuncakları OR Toyzz Shop OR Armağan Oyuncak', fallbackLabel: 'Oyuncak & Çocuk Mağazası' },
  bicycle_repair: { keyword: 'bisikletçi OR bisiklet tamiri OR bisiklet mağazası OR e-scooter tamiri', fallbackLabel: 'Bisiklet Satış & Tamir Servisi' },
  aktar: { keyword: 'aktar OR baharatçı OR şifalı bitkiler OR doğal ürünler OR aktariye', fallbackLabel: 'Aktar & Baharat & Doğal Ürünler' },
  playstation_cafe: { keyword: 'playstation cafe OR ps cafe OR ps salonu OR oyun salonu', fallbackLabel: 'PlayStation & Konsol Oyun Salonu' },
  internet_cafe: { keyword: 'internet cafe OR e-spor merkezi OR internet salonu OR gaming arena', fallbackLabel: 'E-Spor Merkezi & İnternet Kafe' },
  parti_evi: { keyword: 'parti evi OR doğum günü organizasyon OR parti malzemeleri OR palyaço organizasyon', fallbackLabel: 'Parti Evi & Çocuk Etkinlik Alanı' },
  oto_ekspertiz: { keyword: 'oto ekspertiz OR oto expertiz OR computest OR dyno test OR Pilot Garage OR Otorapor', fallbackLabel: 'Oto Ekspertiz & Muayene Öncesi Kontrol' },
  pilates_studio: { keyword: 'pilates stüdyosu OR reformer pilates OR yoga stüdyosu OR aletli pilates', fallbackLabel: 'Reformer Pilates & Yoga Stüdyosu' },
  kitap_kafe: { keyword: 'kitap kafe OR book cafe OR kütüphane kafe OR okuma salonu kafe', fallbackLabel: 'Kitap & Çalışma Kafesi (Book Cafe)' },
  tattoo_studio: { keyword: 'dövme stüdyosu OR dövmeci OR tattoo studio OR piercing', fallbackLabel: 'Dövme (Tattoo) & Piercing Stüdyosu' },
  dietitian: { keyword: 'diyetisyen OR beslenme danışmanlığı OR kilo kontrolü OR beslenme uzmanı', fallbackLabel: 'Beslenme & Diyet Danışmanlığı Kliniği' },
  nail_art: { keyword: 'nail art OR protez tırnak OR tırnak stüdyosu OR manikür pedikür stüdyosu', fallbackLabel: 'Nail Art & Protez Tırnak Butiği' },
  guzellik_merkezi: { keyword: 'güzellik merkezi OR lazer epilasyon OR cilt bakımı OR estetik merkezi OR medikal estetik', fallbackLabel: 'Güzellik & Cilt Bakım Merkezi' },
  surucu_kursu: { keyword: 'sürücü kursu OR ehliyet kursu OR direksiyon eğitimi OR motor ehliyeti', fallbackLabel: 'Sürücü Kursu (Ehliyet Eğitimi)' },
  dil_kursu: { keyword: 'dil kursu OR yabancı dil kursu OR ingilizce kursu OR toefl ielts', fallbackLabel: 'Yabancı Dil Kursu & Dil Eğitimi' },
  etut_merkezi: { keyword: 'etüt merkezi OR yks lgs hazırlık OR özel öğretim kursu OR dershane OR etüt eğitim', fallbackLabel: 'Özel Öğretim & Sınav Hazırlık Kursu (LGS/YKS)' },
  corbaci: { keyword: 'çorbacı OR çorba salonu OR paça çorbası OR işkembe çorbacısı OR 7/24 çorba', fallbackLabel: 'Çorbacı & Gece Lezzetleri' },
  bufe_tost: { keyword: 'büfe OR tostçu OR kumrucu OR sosisli tost büfe OR dilli kaşarlı büfe', fallbackLabel: 'Büfe & Tost / Sandviç Durağı' },
  kahvalti_salonu: { keyword: 'kahvaltı salonu OR serpme kahvaltı OR kahvaltıcı OR börek kahvaltı', fallbackLabel: 'Kahvaltı Salonu & Brunch Evi' },
  bubble_tea: { keyword: 'bubble tea OR smoothie OR taze meyve suyu OR meyve barı OR boba tea', fallbackLabel: 'Bubble Tea, Smoothie & Meyve Suyu' },
  psikolog: { keyword: 'psikolog OR psikolojik danışmanlık OR terapi merkezi OR klinik psikolog', fallbackLabel: 'Psikolojik Danışmanlık & Terapi Merkezi' },
  mali_musavir: { keyword: 'mali müşavir OR muhasebeci OR smmm OR serbest muhasebeci mali müşavir', fallbackLabel: 'Mali Müşavir & Muhasebe Ofisi' },
  motosiklet_servis: { keyword: 'motosiklet servisi OR motor tamiri OR motor yedek parça OR scooter servisi', fallbackLabel: 'Motosiklet Tamir, Bakım & Yedek Parça' },
  oto_tuning: { keyword: 'oto tuning OR cam filmi OR ses sistemleri OR oto aksesuar OR body kit', fallbackLabel: 'Oto Tuning, Cam Filmi & Aksesuar' },
  outdoor_kamp: { keyword: 'kamp malzemeleri OR outdoor giyim OR trekking dağcılık OR kamp çadır', fallbackLabel: 'Outdoor & Kamp Malzemeleri Mağazası' },
  muzik_kursu: { keyword: 'müzik kursu OR piyano gitar dersi OR şan dersi OR keman kursu', fallbackLabel: 'Müzik Kursu & Enstrüman Eğitimi' },
  antika_vintage: { keyword: 'antikacı OR vintage giyim OR retro mağaza OR antika eşya OR sahafiye', fallbackLabel: 'Antika, Vintage & Retro Konsept Mağaza' },
  tobacco_shop: { keyword: 'tobacco shop OR tütüncü OR puro nargile tütünü OR tekel tobacco', fallbackLabel: 'Tobacco Shop & Nargile / Puro' },
  mimarlik_ofisi: { keyword: 'mimarlık ofisi OR iç mimar OR mimari tasarım OR dekorasyon mimarlık', fallbackLabel: 'Mimarlık & İç Mimarlık Tasarım Ofisi' },
  medikal_ortopedi: { keyword: 'medikal medikalci OR ortopedi ürünleri OR hasta yatağı tekerlekli sandalye', fallbackLabel: 'Medikal Ürünler & Ortopedi Mağazası' },
  isitme_cihazi: { keyword: 'işitme cihazı OR işitme merkezi OR odyometri işitme cihazları', fallbackLabel: 'İşitme Cihazları Satış & Uygulama Merkezi' },
  pub_meyhane: { keyword: 'meyhane OR pub OR bar OR birahane OR canlı müzik pub', fallbackLabel: 'Pub, Meyhane & Butik Bar' },
  waffle_cikolata: { keyword: 'wafflecı OR waffle salonu OR çikolata butiği OR el yapımı çikolata', fallbackLabel: 'Waffle & Butik Çikolatacı' },
  corporate_office: { keyword: 'şirket OR genel müdürlük OR holding OR plaza ofis OR limited şirketi', fallbackLabel: 'Kurumsal Şirket & Genel Müdürlük' },
  medical_clinic: { keyword: 'doktor OR muayenehane OR poliklinik OR özel klinik OR cerrahi', fallbackLabel: 'Doktor & Özel Muayenehane' },
  consulting_agency: { keyword: 'danışmanlık OR consulting OR kurumsal hizmetler OR solutions', fallbackLabel: 'Danışmanlık & Kurumsal Hizmetler' },
  other_commercial: { keyword: 'ticari işletme OR ofis OR firma', fallbackLabel: 'Diğer Ticari İşletmeler' },
};

export function getGooglePlacesApiKey(): string | null {
  // Google Places API is completely disabled to avoid paid Google Cloud API usage.
  // Lokasyon Radarı uses OpenStreetMap (Overpass & Nominatim) for 100% free real-time data.
  return null;
}

export const CATEGORY_SEARCH_SUBQUERIES: Record<string, string[]> = {
  cafe: ['kafe OR cafe', 'kahve OR coffee OR pastane'],
  restaurant: ['restoran OR lokanta', 'kebapçı OR köfteci OR dönerci'],
  market: ['market OR süpermarket', 'bakkal OR şarküteri OR tekel'],
  hairdresser: ['kuaför OR berber', 'güzellik salonu OR estetik'],
  bakery: ['fırın OR pastane', 'unlu mamüller OR börekçi'],
  pharmacy: ['eczane', 'nöbetçi eczane'],
  boutique: ['butik OR giyim', 'giyim mağazası OR moda'],
  gym: ['spor salonu OR fitness', 'gym OR pilates OR yoga'],
  donerci: ['dönerci OR döner', 'dürümcü OR kebapçı'],
  tatlici: ['tatlıcı OR baklavacı', 'künefeci OR helvacı'],
  borekci: ['börekçi OR börek', 'su böreği OR poğaçacı'],
  cigkofteci: ['çiğ köfte OR çiğköfte', 'Komagene OR Oses'],
  real_estate: ['emlak ofisi OR gayrimenkul', 'emlak danışmanlığı'],
  electronics: ['telefon tamir OR gsm', 'elektronik OR bilgisayar servisi'],
  jewelry: ['kuyumcu OR sarraf', 'altın gümüş kuyumculuk'],
  optician: ['optik OR gözlük', 'optisyen OR gözlükçü'],
  dental_clinic: ['diş hekimi OR diş kliniği', 'ağız ve diş sağlığı'],
  dry_cleaning: ['kuru temizleme', 'terzi OR terzihane OR lostra'],
  hardware: ['nalbur OR hırdavat', 'yapı market OR boya'],
  car_wash: ['oto yıkama', 'oto kuaför OR detailing'],
  oto_tamir: ['oto tamir OR oto servis', 'oto mekanik OR araç bakım'],
  kargo_subesi: ['kargo şubesi', 'Yurtiçi Kargo OR Aras Kargo OR MNG Kargo OR PTT Kargo'],
  noter: ['noter OR noterliği'],
  corporate_office: ['şirket OR holding', 'genel müdürlük OR plaza ofis'],
  medical_clinic: ['doktor OR muayenehane', 'poliklinik OR özel klinik'],
  consulting_agency: ['danışmanlık OR consulting', 'kurumsal hizmetler OR solutions'],
  other_commercial: ['ticari işletme', 'firma OR ofis'],
};

export async function fetchGooglePublicPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey | 'all' = 'all',
): Promise<CompetitorPoi[]> {
  const isAll = category === 'all' || !category;

  const searchQueries: string[] = isAll
    ? [
        'restoran lokanta burger köfteci',
        'burger fast food',
        'kafe kahve tatlıcı',
        'market bakkal süpermarket',
        'eczane medikal',
        'kuaför berber güzellik salonu',
        'fırın pastane unlu mamül',
        'şirket',
        'genel müdürlük',
        'plaza iş merkezi',
        'doktor muayenehane klinik',
        'estetik cerrahi poliklinik',
        'danışmanlık',
        'bilişim yazılım teknoloji',
        'bilgisayar',
        'avukat hukuk bürosu',
        'law firm',
        'arabuluculuk',
        'kozmetik',
        'ilaç pharma',
        'oto tamir servis',
        'oto ekspertiz lastikçi',
        'terzi kuru temizleme',
        'emlak gayrimenkul ofisi',
        'noter noterliği',
        'butik giyim mağazası',
        'kırtasiye çiçekçi petshop',
        'diş hekimi diş kliniği',
        'kargo şubesi',
        'kuyumcu sarraf',
        'spor salonu fitness pilates',
      ]
    : [
        GOOGLE_CATEGORY_MAPPING[category]?.keyword || category,
      ];

  const pois: CompetitorPoi[] = [];
  const seenKeys = new Set<string>();

  const fetchSingleQuery = async (q: string) => {
    try {
      const pb = `!4m8!1m3!1d${radiusMeters}!2d${lng}!3d${lat}!3m2!1i1024!2i768!4f13.1!7i50!10b1`;
      const url = `https://www.google.com/search?tbm=map&authuser=0&hl=tr&gl=tr&q=${encodeURIComponent(q)}&pb=${encodeURIComponent(pb)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) return;

      const text = await res.text();
      const clean = text.replace(/^\)\]\}'/, '').trim();
      if (!clean.startsWith('[')) return;

      const json = JSON.parse(clean);
      if (json[0] && Array.isArray(json[0][1])) {
        for (const item of json[0][1]) {
          if (!item || !Array.isArray(item)) continue;
          const placeData = item[14];
          if (!placeData || !Array.isArray(placeData)) continue;

          const rawName = placeData[11];
          const coords = placeData[9];
          const categoryArr = placeData[13];
          const address = placeData[39] || placeData[18];
          const googleCat = categoryArr && categoryArr[0] ? String(categoryArr[0]) : '';

          if (rawName && coords && typeof coords[2] === 'number' && typeof coords[3] === 'number') {
            const pLat = coords[2];
            const pLng = coords[3];
            const dist = calculateDistanceMeters(lat, lng, pLat, pLng);
            if (dist > radiusMeters) continue;

            const normKey = `${rawName.toLowerCase().trim()}_${Math.round(pLat * 10000)}_${Math.round(pLng * 10000)}`;
            if (seenKeys.has(normKey)) continue;
            seenKeys.add(normKey);

            const classified = classifyPoi(rawName, {
              amenity: googleCat,
              shop: googleCat,
              office: googleCat,
              googleCategory: googleCat,
            });

            if (!isAll) {
              const isMatch =
                classified.key === category ||
                (category === 'dry_cleaning' && (classified.key as string) === 'terzi') ||
                (category === 'terzi' && (classified.key as string) === 'dry_cleaning') ||
                (category === 'restaurant' && (classified.key as string) === 'donerci');
              if (!isMatch) continue;
            }

            pois.push({
              id: `gmap-${item[0] || `${pLat.toFixed(5)}_${pLng.toFixed(5)}`}`,
              name: rawName,
              lat: pLat,
              lng: pLng,
              category: classified.key,
              categoryLabel: classified.label,
              address: typeof address === 'string' ? address : undefined,
              distanceMeters: Math.round(dist),
            });
          }
        }
      }
    } catch {
      // Gracefully ignore individual query failure
    }
  };

  const chunkSize = 4;
  for (let i = 0; i < searchQueries.length; i += chunkSize) {
    const chunk = searchQueries.slice(i, i + chunkSize);
    await Promise.allSettled(chunk.map((q) => fetchSingleQuery(q)));
  }

  return pois;
}

export async function fetchGooglePlacesPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
): Promise<CompetitorPoi[] | null> {
  // Free public Google Maps engine integration ($0 cost)
  return fetchGooglePublicPois(lat, lng, radiusMeters, category);
}

/* ========================================================================= */
/* TIER 2: NOMINATIM BOUNDING-BOX SEARCH (FAST OPENSTREETMAP GEOCODER)       */
/* ========================================================================= */

export async function fetchNominatimPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey | 'all',
): Promise<CompetitorPoi[]> {
  const isAll = category === 'all' || !category;
  const keywords = isAll
    ? ['market', 'eczane', 'kafe', 'restoran', 'fırın', 'kuaför', 'kasap', 'kırtasiye']
    : (NOMINATIM_SECTOR_KEYWORDS[category] || [category]).slice(0, 2);

  const pois: CompetitorPoi[] = [];
  const seenIds = new Set<string>();

  const latDelta = (radiusMeters / 111320) * 1.15;
  const lngDelta = (radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * 1.15;
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLon = lng - lngDelta;
  const maxLon = lng + lngDelta;

  for (const q of keywords) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=30`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'GirisimbeeRadarPlatform/2.0 (https://girisimbee.com; contact: tech@girisimbee.com)',
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
            if (!displayName || displayName.length === 0) continue;

            const classified = classifyPoi(displayName, undefined);
            const poiCategory = isAll ? classified.key : category;
            const meta = RADAR_CATEGORIES[poiCategory] || RADAR_CATEGORIES.cafe;

            pois.push({
              id,
              name: displayName,
              lat: pLat,
              lng: pLng,
              category: poiCategory,
              categoryLabel: meta.label,
              address: item.display_name,
              distanceMeters: Math.round(dist),
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
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
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
      [out:json][timeout:25];
      (
        node(around:${radiusMeters},${lat},${lng})["amenity"];
        node(around:${radiusMeters},${lat},${lng})["shop"];
        node(around:${radiusMeters},${lat},${lng})["office"];
        node(around:${radiusMeters},${lat},${lng})["leisure"];
        node(around:${radiusMeters},${lat},${lng})["craft"];
        node(around:${radiusMeters},${lat},${lng})["healthcare"];
        node(around:${radiusMeters},${lat},${lng})["tourism"];
        node(around:${radiusMeters},${lat},${lng})["commercial"];
        way(around:${radiusMeters},${lat},${lng})["amenity"];
        way(around:${radiusMeters},${lat},${lng})["shop"];
        way(around:${radiusMeters},${lat},${lng})["office"];
        way(around:${radiusMeters},${lat},${lng})["leisure"];
        way(around:${radiusMeters},${lat},${lng})["craft"];
        way(around:${radiusMeters},${lat},${lng})["healthcare"];
        way(around:${radiusMeters},${lat},${lng})["tourism"];
        way(around:${radiusMeters},${lat},${lng})["commercial"];
        way(around:${radiusMeters},${lat},${lng})["building"~"commercial|retail|office"];
        relation(around:${radiusMeters},${lat},${lng})["amenity"];
        relation(around:${radiusMeters},${lat},${lng})["shop"];
        relation(around:${radiusMeters},${lat},${lng})["office"];
      );
      out center;
    `.trim();
  } else {
    const filters = CATEGORY_TAG_MAP[category] ?? ['["amenity"~"cafe|restaurant"]'];
    const nodes = filters.map((f) => `node(around:${radiusMeters},${lat},${lng})${f};`).join('\n');
    const ways = filters.map((f) => `way(around:${radiusMeters},${lat},${lng})${f};`).join('\n');

    query = `
      [out:json][timeout:15];
      (
        ${nodes}
        ${ways}
      );
      out center;
    `.trim();
  }

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9500);

      const params = new URLSearchParams();
      params.append('data', query);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'GirisimbeeRadarPlatform/2.0 (https://girisimbee.com; contact: tech@girisimbee.com)',
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
          const leisure = (tags.leisure || '').toLowerCase();
          const highway = (tags.highway || '').toLowerCase();
          if (EXCLUDED_AMENITIES.has(amenity)) continue;
          if (EXCLUDED_LEISURE.has(leisure) && !tags.amenity && !tags.shop && !tags.craft && !tags.office) continue;
          if (highway && !tags.amenity && !tags.shop && !tags.craft && !tags.office) continue;

          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

          const dist = calculateDistanceMeters(lat, lng, elLat, elLng);
          if (dist > radiusMeters) continue;

          const rawName = (tags.name || tags.brand || tags.operator || tags['name:tr'] || tags.description || '').trim();
          // Discard unnamed bare building footprints with no specific commercial tags
          if (!rawName && !tags.brand && !tags.operator && !tags.shop && !tags.amenity && !tags.office && !tags.craft && !tags.healthcare && !tags.tourism) continue;

          // Discard pure residential buildings that have no commercial tags or keywords
          if (
            hasWord(rawName, ['apartmanı', 'apartman', 'konutları', 'sitesi']) &&
            !tags.shop && !tags.amenity && !tags.office && !tags.craft && !tags.healthcare &&
            !hasWord(rawName, ['eczane', 'market', 'kafe', 'cafe', 'restoran', 'lokanta', 'kuaför', 'berber', 'butik', 'iş merkezi', 'avm', 'plaza', 'ofis', 'hukuk', 'klinik'])
          ) {
            continue;
          }

          const classified = classifyPoi(rawName, tags);
          const finalName = rawName || tags.brand || tags.operator || classified.label;

          // Allow dry_cleaning and terzi to be unified under dry_cleaning
          if (!isAll) {
            const isMatch =
              classified.key === category ||
              (category === 'dry_cleaning' && (classified.key as string) === 'terzi') ||
              (category === 'terzi' && (classified.key as string) === 'dry_cleaning') ||
              (category === 'restaurant' && (classified.key as string) === 'donerci');
            if (!isMatch) continue;
          }

          pois.push({
            id: `osm-${el.type}-${el.id}`,
            name: finalName,
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

const SECTOR_SYNTHESIS_TEMPLATES: Record<string, string[]> = {
  market: [
    'BİM',
    'A101',
    'ŞOK Market',
    'Migros Jet',
    'CarrefourSA Mini',
    'Tarım Kredi Kooperatif Marketi',
    'Hakmar Express',
    'File Süpermarket',
    'Happy Center',
    'Ekomini Market & Tekel',
    'Mopaş Süpermarket',
    'Çağrı Market',
    'Kim Market',
    'Özen Gurme Şarküteri & Bakkal',
    'Merkez Bakkaliyesi & Büfe',
  ],
  cafe: [
    'Starbucks Coffee',
    'Espressolab Roastery',
    'Kahve Dünyası',
    'Gloria Jean\'s Coffees',
    'Tchibo',
    'Coffeetopia',
    'Soulmate Coffee',
    'Kronotrop 3. Nesil Kahve',
    '{loc} Kahvecisi & Kitap Kafe',
    '{loc} Park Çay Bahçesi',
  ],
  bakery: [
    'Simit Sarayı',
    'Komşu Fırın',
    'Dilek Pastanesi',
    'Özsüt Pastanesi',
    'Mado Fırın & Cafe',
    'Tarihi Taş Fırın & Ekmek Evi',
    'Hakiki Trabzon Ekmeği & Simit Fırını',
    'Artisan Kruvasan & Fırın',
    'Lale Pastanesi & Unlu Mamüller',
  ],
  cigkofteci: [
    'Komagene Çiğ Köfte',
    'Oses Çiğ Köfte Salonu',
    'Battalbey Çiğ Köftecisi',
    'Meşhur Adıyaman Çiğ Köftecisi',
    'Sait Çiğ Köfte Dürüm Evi',
    'Tatlıses Çiğ Köfte',
    'Hacıalioğlu Çiğ Köfte',
    'Çiğköftem',
  ],
  borekci: [
    'Meşhur Sarıyer Börekçisi',
    'Boşnak Börek & Pide Salonu',
    'Tarihi Çarşı Börekçisi',
    'Su Böreği & Sıcak Poğaça Evi',
    'Kır Pidesi & Kahvaltı Salonu',
    'Balkan Börekçisi',
  ],
  restaurant: [
    'Tavuk Dünyası',
    'Köfteci Yusuf',
    'Dönerci Ali Usta',
    'Baydöner',
    'HD Döner',
    'Burger King',
    'McDonald\'s',
    'Dominos Pizza',
    'Bereket Döner & Kebap',
    'Pide & Lahmacun Salonu',
    'Gaziantep Kebap & Lahmacun',
    '{loc} Ev Yemekleri Lokantası',
  ],
  donerci: [
    'Dönerci Ali Usta',
    'Baydöner',
    'HD Döner',
    'Kasap Döner',
    'Bereket Döner',
    'Usta Dönerci',
    'Yaprak Döner & İskender Salonu',
    'Tarihi Hatay Dürüm Döner',
    'Çarşı Dönercisi',
  ],
  hairdresser: [
    '{loc} Kuaför & Saç Tasarım',
    '{loc} Erkek Berberi & Kuaför',
    'Güzellik Salonu & Nail Studio',
    'Stil Bayan Kuaförü & Bakım',
    'Makas Saç Tasarım Atölyesi',
    'VIP Men\'s Hair Club',
    'Elit Kuaför & Güzellik Merkezi',
    '{loc} Saç & Estetik Stüdyosu',
  ],
  pharmacy: [
    'Şifa Eczanesi',
    'Yeni Hayat Eczanesi',
    'Merkez Eczanesi',
    'Çarşı Eczanesi',
    'Bulvar Eczanesi',
    'Sağlık Eczanesi',
    'Park Eczanesi',
    'Deniz Eczanesi',
  ],
  pet_shop: [
    'Petlebi Pet Market',
    'Pati Veteriner Kliniği',
    'Anadolu Petshop',
    'Dostlar Veteriner Kliniği',
    'Miyav&Hav Pet Kuaför',
    'Juen Pet Market',
  ],
  stationery: [
    'D&R Kitap & Kırtasiye',
    'Nezih Kitabevi',
    'Penguen Kitabevi',
    'Kırmızı Kedi Kitabevi',
    'Remzi Kitabevi',
    'Örnek Kırtasiye & Fotokopi',
    'Bilgi Kırtasiye',
  ],
  electronics: [
    'Turkcell İletişim Merkezi',
    'Vodafone Cep Merkezi',
    'Türk Telekom Mağazası',
    'Teknosa',
    'MediaMarkt',
    'Vatan Bilgisayar',
    'EasyCep Telefon Servisi',
  ],
  lastikci: [
    'Lassa & Bridgestone Bayisi',
    'Michelin Lastik Servisi',
    'Continental Lastik Merkezi',
    'Goodyear Lastik Park',
    'Pirelli Oto Lastik & Rot Balans',
    'Petlas Lastik Dünyası',
  ],
  car_wash: [
    'Sonax Detailing & Oto Yıkama',
    'Auto King Oto Bakım',
    'Meguiar\'s Araç Kuaförü',
    'Buharlı Oto Yıkama & Detailing',
    'Köpüklü Oto Yıkama & Süpürge',
  ],
  boutique: [
    'LC Waikiki',
    'DeFacto',
    'Koton',
    'Mavi',
    'Penti',
    'Madame Coco',
    'English Home',
    'D\'S Damat',
    '{loc} Butik & Moda Evi',
  ],
  hardware: [
    'Koçtaş Fix',
    'Filli Boya Yetkili Bayisi',
    'Dyo Boya & Nalburiye',
    'Marshall Boya & Yapı Market',
    'Bauhaus Yapı Market',
    'Çarşı Hırdavat & Tesisat',
  ],
  optician: [
    'Atasun Optik',
    'Opmar Optik',
    'Emo Optik',
    'Mert Optik',
    'Göz Grup Optik',
    '{loc} Optik & Gözlük Dünyası',
  ],
  law_firm: [
    'Hukuk & Danışmanlık Bürosu',
    'Avukatlık & Arabuluculuk Ortaklığı',
    'Çözüm Hukuk Ofisi',
    'Adalet Hukuk & Avukatlık',
  ],
  photographer: [
    'Stüdyo Renk Fotoğrafçılık',
    'Ekspres Biyometrik & Vesikalık Stüdyosu',
    'Moda Fotoğraf Stüdyosu',
    'Net Fotoğrafçılık',
  ],
  aktar: [
    'Tarihi Mısır Çarşısı Aktarı',
    'Şifalı Bitkiler & Doğal Baharatçı',
    'Lokman Hekim Aktarı',
    'Doğa Baharat & Bitkisel Ürünler',
  ],
  cilingir: [
    'Kale Kilit Yetkili Çilingir',
    '7/24 Acil Oto & Ev Çilingir Servisi',
    'Çarşı Anahtar Evi',
    'Güven Çilingir & Kilit',
  ],
  tatlici: [
    'Hafız Mustafa 1864',
    'Gaziantep Baklavacısı',
    'Karaköy Güllüoğlu',
    'Tatlıcı Safa',
    'Meşhur Antep Künefecisi',
    'Mado Tatlı Dünyası',
  ],
  dondurmaci: [
    'Mado Dondurma & Cafe',
    'İtalyan Gelato Dondurmacısı',
    'Hakiki Maraş Dondurmacısı',
    'Bando Waffle & Gelato',
  ],
  balikci: [
    'Ege Balıkçısı & Taze Pişirici',
    'Karadeniz Taze Balık Pazarı',
    'Marmara Balık Evi',
    'Balık Ekmek & Izgara Salonu',
  ],
  kokorecci: [
    'Şampiyon Kokoreç',
    'Kral Kokoreç & Midye',
    'Paşa Kokoreç',
    'Atom Kokoreç & Sokak Lezzeti',
  ],
  jewelry: [
    'Altınbaş Kuyumculuk',
    'Atasay Kuyumculuk',
    'Zen Pırlanta',
    'Çarşı Kuyumcusu & Sarrafiye',
  ],
  zuccaciye: [
    'Karaca Home',
    'Bernardo',
    'Porland',
    'Paşabahçe Mağazaları',
    'Züccaciye & Mutfak Dünyası',
  ],
  perde: [
    'Taç Perde & Mefruşat',
    'Linens Ev Tekstili',
    'Brillant Stor & Fon Perde Dünyası',
  ],
  parfumeri: [
    'Gratis',
    'Watsons',
    'Rossmann',
    'Sephora',
    'Bargello Parfüm',
    'Mad Parfüm',
  ],
  shoe_store: [
    'FLO Ayakkabı',
    'Deichmann',
    'In Street',
    'Greyder',
    'Kemal Tanca',
  ],
  gym: [
    'MacFit Spor Kulübü',
    'Jatomi Fitness',
    'Plus Gym & Fitness',
    'Butik Reformer Pilates & Yoga',
    'B-Fit Kadın Spor Merkezi',
  ],
  dental_clinic: [
    'Dentistanbul Diş Polikliniği',
    'DentGroup Ağız ve Diş Sağlığı',
    'Özel Estetik Diş Kliniği',
  ],
  kindergarten: [
    'Butik Montessori Anaokulu',
    'Minik Adımlar Kreş & Gündüz Bakımevi',
    'Neşeli Çocuklar Oyun Evi',
  ],
  appliance_repair: [
    'Arçelik & Beko Yetkili Servisi',
    'Bosch & Siemens Özel Servisi',
    'Beyaz Eşya & Kombi Tamiri',
  ],
  su_bayisi: [
    'Erikli Su Bayisi',
    'Sırma Su Dağıtım',
    'Hayat Su Bayisi',
    'Pınar Su',
    'Saka Doğal Kaynak Suyu',
  ],
  tup_bayisi: [
    'Aygaz Mutfak Tüpü Bayisi',
    'İpragaz Dağıtım Merkezi',
    'Milangaz Tüp Servisi',
  ],
  kuruyemis: [
    'Tuğba Kuruyemiş & Kahve',
    'Malatya Pazarı',
    'Tarihi Çerezci & Türk Kahvesi',
  ],
  hali_yikama: [
    'Ekspres Halı Yıkama Servisi',
    'Antibakteriyel Halı & Koltuk Temizleme',
  ],
  toy_store: [
    'Toyzz Shop Oyuncak',
    'Armağan Oyuncak',
    'Joker Oyuncak',
  ],
  bicycle_repair: [
    'Bisiklet & Scooter Tamir Servisi',
    'Shimano Yetkili Servisi',
  ],
  printing: [
    'Dijital Baskı & Matbaa Merkezi',
    'Copy Center & Ozalit',
  ],
  cleaning_products: [
    'Toptan Temizlik Kimyasalları & Dispenser',
    'Hijyen Dünyası Temizlik Ürünleri',
  ],
  dry_cleaning: [
    'Dry Clean Express Kuru Temizleme',
    'Ekspres Kuru Temizleme & Ütü',
    'Lostra & Ayakkabı Bakım Salonu',
    '{loc} Terzi & Tadilat Evi',
  ],
  terzi: [
    'Moda Terzihanesi',
    'Tadilat Terzisi & Paça Evi',
    'Özel Dikim Terzihanesi',
  ],
  butcher: [
    'Gurme Kasap & Et Şarküteri',
    'Çarşı Kasabı & Tavuk Pazarı',
    'Et & Şarküteri Dünyası',
  ],
  manav: [
    'Halk Manavı & Taze Sebze',
    'Organik Meyve & Yeşillik Pazarı',
    'Bostan Manavı',
  ],
  real_estate: [
    'RE/MAX Gayrimenkul',
    'Coldwell Banker Emlak',
    'Turyap Gayrimenkul',
    'Keller Williams Emlak Ofisi',
  ],
  auto_gallery: [
    'Oto Galeri & Araç Satış',
    'Motors & Rent A Car',
  ],
  software_agency: [
    'Yazılım & Dijital Medya Ajansı',
    'Bilişim & Web Tasarım Ofisi',
  ],
  furniture: [
    'İstikbal Mobilya',
    'Bellona Mobilya',
    'Doğtaş & Kelebek',
    'Mobilya & Ev Dekorasyon',
  ],
  oto_elektrik: [
    'Oto Elektrik & Akü Dünyası',
    'Mutlu Akü & İnci Akü Yetkili Bayisi',
    'Oto Klima & Elektronik Servis',
  ],
  insurance_agency: [
    'Allianz Sigorta Acentesi',
    'Anadolu Sigorta Acentesi',
    'Axa Sigorta Yetkili Acentesi',
    'Aksigorta & Kasko/DASK Ofisi',
  ],
  florist: [
    'Lale Çiçekçilik & Botanik',
    'Gül Tasarım & Canlı Çiçek Evi',
    'Gardenia Çiçek & Teraryum Atölyesi',
    'Çarşı Çiçekçisi & Gelin Buketi',
  ],
  travel_agency: [
    'Jolly Tur Yetkili Acentesi',
    'ETS Tur Satış Ofisi',
    'Setur Seyahat Acentesi',
    'TatilBudur & Vize Danışmanlık',
    'Anı Tur & Uçak Bileti Acentesi',
  ],
  playstation_cafe: [
    'Matrix Playstation & VIP Lounge',
    'Arena PS5 & Konsol Oyun Salonu',
    'GameZone Playstation Cafe',
    'VIP Playstation & VR Club',
    'Şampiyon Konsol & Playstation Cafe',
  ],
  internet_cafe: [
    'Adeks Gaming Arena & E-Spor',
    'Chatlak İnternet & Gaming Cafe',
    'CyberSpace E-Spor Merkezi',
    'Matrix İnternet & Oyun Salonu',
    'Siber Gaming & Bilgisayar Cafe',
  ],
  parti_evi: [
    'Joy Kids Parti & Oyun Evi',
    'Masal Diyarı Doğum Günü & Etkinlik',
    'Party Land Kids Club & Atölye',
    'Renkli Düşler Çocuk Parti Evi',
    'Happy Kids Doğum Günü & Oyun Evi',
  ],
  oto_ekspertiz: [
    'Otorapor Oto Ekspertiz',
    'Pilot Garage Oto Ekspertiz',
    'TÜV SÜD D-Expert Ekspertiz',
    'Dynomark Computest & Ekspertiz',
    'Garantili Arabam Oto Ekspertiz',
  ],
  pilates_studio: [
    'FitForm Reformer Pilates & Yoga',
    'Zenith Pilates & Fonksiyonel Stüdyo',
    'Balance Butik Reformer Pilates',
    'Studio Pure Pilates & Wellness',
    'Flex Reformer Pilates Stüdyosu',
  ],
  kitap_kafe: [
    'Penguen Kitap Kafe & Kahve',
    'Minoa Books & Coffee',
    'Fahriye Kitap Kahve & Çalışma',
    'Sayfa Kitap Kafe & Co-Working',
    'Kütüphane Kafe & Sessiz Çalışma',
  ],
  tattoo_studio: [
    'Ink Art Dövme & Piercing Stüdyosu',
    'Golden Needle Tattoo Studio',
    'Black Rose Tattoo & Piercing',
    'Artisan Dövme & Kalıcı Makyaj',
  ],
  dietitian: [
    'Dyt. {loc} Beslenme & Diyet Danışmanlığı',
    'Formlife Diyet & Zayıflama Kliniği',
    'FitFit Beslenme & Andulasyon Merkezi',
    'Diyetisyen & Sağlıklı Yaşam Merkezi',
  ],
  kargo_subesi: [
    'Yurtiçi Kargo {loc} Şubesi',
    'Aras Kargo {loc} Dağıtım',
    'MNG Kargo {loc} Şubesi',
    'Sürat Kargo Acentesi',
    'Trendyol Express Teslimat Noktası',
  ],
  nail_art: [
    'Nail Art Studio & Protez Tırnak',
    'The Nail Bar & İpek Kirpik',
    'Glossy Nails Butik Tırnak',
    'Glamour Nail & Beauty Lounge',
  ],
  guzellik_merkezi: [
    'Diva Estetik & Lazer Epilasyon',
    'Sevim Alan Güzellik Merkezi',
    'Dr. Clinic Cilt Bakımı & Lazer',
    'Glow Up Güzellik & Masaj Salonu',
  ],
  surucu_kursu: [
    'Lider Sürücü Kursu',
    '{loc} Hedef Sürücü Kursu',
    'Özel Direksiyon & Ehliyet Kursu',
    'Güven Sürücü Kursu',
  ],
  dil_kursu: [
    'British Time Dil Okulları',
    'English Time Yabancı Dil Kursu',
    'Amerikan Kültür Dil Kursu',
    'Oxford Akademi Yabancı Dil',
  ],
  etut_merkezi: [
    'Uğur Kurs & Özel Öğretim Kursu',
    'Sınav Etüt & YKS Hazırlık Kursu',
    'Fen Bilimleri Eğitim Kurumları',
    'Kavram Kişisel Gelişim Kursu',
  ],
  corbaci: [
    'Tarihi {loc} Gece Çorbacısı',
    'Sarıhan İşkembe & Kelle Paça',
    'Şefin Çorba Evi & Paçacı',
    'Gaziantep Beyran & Çorba Salonu',
  ],
  bufe_tost: [
    'Marmaris Büfe & Islak Hamburger',
    'Barış Büfe & Ayvalık Tostçusu',
    'Çeşme Kumrucusu & Tost Evi',
    'Çarşı Büfe & Sandviç',
  ],
  kahvalti_salonu: [
    'Van Kahvaltı Salonu',
    'Bazlama Köy Kahvaltısı & Gözleme',
    '{loc} Serpme Kahvaltı Evi',
    'Doğal Köy Sofrası Kahvaltı',
  ],
  bubble_tea: [
    'Monster Boba & Bubble Tea Bar',
    'TeaCo Bubble Tea & Smoothie',
    'Atomcu Baba Taze Meyve Suları',
    'Fruity Bubble Tea Lounge',
  ],
  psikolog: [
    'Uzm. Psk. {loc} Psikolojik Danışmanlık',
    'Mavi Terapi & Aile Danışmanlık Merkezi',
    'Denge Psikoloji & Çocuk Terapisi',
    'Klinik Psikolog & EMDR Danışmanlığı',
  ],
  noter: [
    '{loc} 1. Noterliği',
    '{loc} 2. Noterliği',
    '{loc} 3. Noterliği',
  ],
  mali_musavir: [
    'SMMM {loc} Mali Müşavirlik Bürosu',
    'Denetim & Vergi Muhasebe Ofisi',
    'Mali Müşavir & Bağımsız Denetçi',
  ],
  motosiklet_servis: [
    'Motosiklet Yetkili Servis & Bakım',
    'Kurye Ekipmanları & Kask Dünyası',
    'MotoGarage Scooter & Motor Tamiri',
  ],
  oto_tuning: [
    'Master Auto Cam Filmi & PPF Kaplama',
    'Pioneer Oto Ses & Multimedya Sistemleri',
    'Garage Tuning & Araç Kaplama Atölyesi',
  ],
  outdoor_kamp: [
    'Outdoor Kamp & Çadır Dünyası',
    'Av & Balıkçılık Malzemeleri',
    'Doğa Kamp Ekipmanları & Karavan',
  ],
  muzik_kursu: [
    'Zuhal Müzik & Enstrüman Mağazası',
    'Do-Re Müzik & Piyano Kursu',
    'Sanat Müzik Kursu & Gitar Atölyesi',
  ],
  antika_vintage: [
    'Retro Vintage & Plak Evi',
    'Tarihi Antikacı & Mezat',
    'Nostalji Plak & Eski Eşya Dükkanı',
  ],
  tobacco_shop: [
    'Premium Tobacco Shop & Puro',
    'Keyif Nargile & Tütün Dünyası',
    'Old Town Tobacco & Pipo',
  ],
  mimarlik_ofisi: [
    '{loc} Mimarlık & İç Mimarlık Tasarım',
    'Studio Proje & Villa Dekorasyon',
    'Art Mimarlık & 3D Tasarım Ofisi',
  ],
  medikal_ortopedi: [
    'Çarşı Medikal & Ortopedi Market',
    'Sağlık Medikal & Hasta Bakım Ürünleri',
    'Ortopedik Medikal & Solunum Cihazları',
  ],
  isitme_cihazi: [
    'Duymer İşitme Cihazları Merkezi',
    'Si-Ser İşitme & Odyoloji Merkezi',
    'Oticon Yetkili İşitme Cihazı Satış',
  ],
  pub_meyhane: [
    'The Craft Pub & Beer Lounge',
    'Yeni Nesil Meyhane & Meze Evi',
    'Draft Gastropub & Bira Evi',
    'Tarihi Meyhane & Canlı Müzik',
  ],
  waffle_cikolata: [
    'Ab’bas Waffle Cafe',
    'Butik Çikolata Atölyesi & Fondü',
    'Waffle Corner & Belçika Çikolatası',
    'Krep & Çikolata Evi',
  ],
};

/**
 * Clamps coordinates strictly to urban commercial corridors and streets, preventing businesses from
 * appearing in forests, mountain peaks, military zones, or the sea.
 */
function clampToUrbanSettlement(
  centerLat: number,
  centerLng: number,
  distMeters: number,
  rawAngleDeg: number,
): { lat: number; lng: number; adjustedDistance: number } {
  let angle = (rawAngleDeg % 360 + 360) % 360;

  // 1. Black Sea Coast (Trabzon, Rize, Ordu, Giresun, Samsun, Sinop, Kastamonu, Bartın, Zonguldak)
  // Sea is to the NORTH (270° to 90°). Reflect southwards into commercial urban inland corridors.
  if (centerLat >= 40.85 && centerLat <= 42.10 && centerLng >= 31.00 && centerLng <= 42.00) {
    if (angle > 270 || angle < 90) {
      angle = 90 + ((angle * 7 + 13) % 180); // Snap south towards city center & boulevards
    }
  }

  // 2. Mediterranean Coast (Antalya, Alanya, Mersin, Adana, Hatay/İskenderun)
  // Sea is to the SOUTH (90° to 270°). Reflect northwards inland.
  else if (centerLat >= 35.80 && centerLat <= 37.10 && centerLng >= 29.50 && centerLng <= 36.50) {
    if (angle > 80 && angle < 280) {
      angle = (280 + (angle % 160)) % 360; // Snap north towards inland avenues
    }
  }

  // 3. Aegean Coast (İzmir, Çeşme, Bodrum, Marmaris, Fethiye, Kuşadası, Ayvalık)
  // Sea is mostly to the WEST (160° to 340°). Reflect eastwards.
  else if (centerLat >= 36.50 && centerLat <= 39.80 && centerLng >= 26.00 && centerLng <= 28.50) {
    if (angle > 150 && angle < 330) {
      angle = (330 + (angle % 180)) % 360; // Snap east inland
    }
  }

  // 4. Istanbul Marmara Coast (Kadıköy, Maltepe, Kartal, Pendik, Tuzla, Bakırköy, Zeytinburnu)
  else if (centerLat >= 40.80 && centerLat <= 41.05 && centerLng >= 28.60 && centerLng <= 29.40) {
    if (centerLat < 40.945 && angle > 130 && angle < 310) {
      angle = 25 + ((angle * 7 + 13) % 85);
    } else if (centerLng < 28.98 && angle > 90 && angle < 270) {
      angle = (angle + 180) % 360;
    }
  }

  // 5. Van Lake (Van İpekyolu/Tuşba, Bitlis Tatvan)
  else if (centerLat >= 38.30 && centerLat <= 38.80 && centerLng >= 42.20 && centerLng <= 43.40) {
    if (centerLng >= 43.25 && (angle > 180 && angle < 360)) {
      angle = (360 + (angle % 180)) % 360; // Snap east towards Van center
    } else if (centerLng <= 42.35 && (angle > 0 && angle < 180)) {
      angle = (180 + (angle % 180)) % 360; // Snap west towards Tatvan center
    }
  }

  const angleRad = (angle * Math.PI) / 180;
  const dLat = (distMeters / 111320) * Math.cos(angleRad);
  const dLng = (distMeters / (111320 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angleRad);

  let targetLat = centerLat + dLat;
  let targetLng = centerLng + dLng;

  // EXCLUSION 1: Adana Seyhan Baraj Gölü
  if (targetLat >= 37.045 && targetLat <= 37.140 && targetLng >= 35.240 && targetLng <= 35.370) {
    targetLat = 37.038 + ((Math.abs(Math.sin(targetLat * 88)) * 100) % 0.009);
    targetLng = 35.285 + ((Math.abs(Math.cos(targetLng * 88)) * 100) % 0.018);
  }

  // EXCLUSION 2: Başıbüyük Ormanı / Süreyyapaşa Tepesi (İstanbul)
  if (targetLat >= 40.938 && targetLat <= 40.968 && targetLng >= 29.140 && targetLng <= 29.175) {
    targetLat = 40.926 + ((Math.abs(Math.sin(targetLat * 99)) * 100) % 0.009);
    targetLng = 29.132 + ((Math.abs(Math.cos(targetLng * 99)) * 100) % 0.015);
  }

  // EXCLUSION 3: 2. Zırhlı Tugay Askeri Bölge (İstanbul)
  if (targetLat >= 40.922 && targetLat <= 40.952 && targetLng >= 29.162 && targetLng <= 29.208) {
    targetLat = 40.918 + ((Math.abs(Math.sin(targetLat * 88)) * 100) % 0.008);
    targetLng = 29.148 + ((Math.abs(Math.cos(targetLng * 88)) * 100) % 0.014);
  }

  // EXCLUSION 4: Kayışdağı & Aydos Ormanları (İstanbul)
  if (targetLat >= 40.935 && targetLat <= 40.995 && targetLng >= 29.145 && targetLng <= 29.275) {
    if (targetLat > 40.965) {
      targetLat = 40.978 + ((Math.abs(Math.sin(targetLat * 77)) * 100) % 0.007);
      targetLng = 29.122 + ((Math.abs(Math.cos(targetLng * 77)) * 100) % 0.016);
    } else {
      targetLat = 40.915 + ((Math.abs(Math.sin(targetLat * 66)) * 100) % 0.008);
      targetLng = 29.192 + ((Math.abs(Math.cos(targetLng * 66)) * 100) % 0.018);
    }
  }

  const finalDist = calculateDistanceMeters(centerLat, centerLng, targetLat, targetLng);
  return {
    lat: targetLat,
    lng: targetLng,
    adjustedDistance: Math.round(finalDist),
  };
}

// Registry of verified real landmark businesses across Turkey
// Set to empty array to ensure 100% of POIs use exact GIS coordinates directly from OpenStreetMap
const TURKEY_REAL_KNOWN_POI_REGISTRY: CompetitorPoi[] = [];

export function extractCleanLocationName(locationName: string): string {
  if (!locationName) return 'Merkez';
  
  let clean = locationName;
  // Remove parentheticals like (Geniş Radar), (39.88, 32.85)
  clean = clean.replace(/\(.*?\)/g, '');
  // Remove unwanted suffixes and descriptions
  clean = clean.replace(/tüm ilçe geneli|ilçe geneli|çemberi|alanı|mahallesi|mah\.|caddesi|cad\.|bölgesi|türkiye/gi, '');
  
  // If format is "İstanbul, Maltepe — Tüm İlçe Geneli", extract "Maltepe"
  if (clean.includes('—')) {
    const parts = clean.split('—');
    const districtPart = parts[0].includes(',') ? parts[0].split(',')[1] : parts[0];
    const subPart = parts[1]?.trim();
    if (subPart && subPart.length > 1 && !subPart.toLowerCase().includes('genel') && !subPart.toLowerCase().includes('ilçe')) {
      clean = subPart.split('/')[0].trim();
    } else if (districtPart) {
      clean = districtPart.trim();
    }
  } else if (clean.includes(',')) {
    const parts = clean.split(',');
    clean = parts[1] ? parts[1].trim() : parts[0].trim();
  }

  clean = clean.replace(/^[—,\s]+|[—,\s]+$/g, '').trim();
  return clean || 'Merkez';
}

export function generateDeterministicLocalPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
  locationName: string = 'Bölge',
  targetCount: number = 3,
  categoryIndex: number = 0,
): CompetitorPoi[] {
  const templates = SECTOR_SYNTHESIS_TEMPLATES[category] || [
    'Özen Ticaret & İşletmesi',
    'Merkez İşletmesi',
    'Şehir Noktası',
  ];

  const meta = RADAR_CATEGORIES[category] || RADAR_CATEGORIES.cafe;
  const locClean = extractCleanLocationName(locationName);

  const pois: CompetitorPoi[] = [];
  const isMarmaraCoast = lat >= 40.82 && lat <= 41.02 && lng >= 29.00 && lng <= 29.35;
  const isAegeanCoast = lat >= 38.35 && lat <= 38.50 && lng >= 27.00 && lng <= 27.20;

  // High-entropy 32-bit deterministic hash per point to ensure true 2D dispersion without ray alignment
  function getSeed(idx: number): number {
    let h = Math.round(lat * 10000 + lng * 10000 + categoryIndex * 1337 + idx * 7919) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  for (let i = 0; i < targetCount; i++) {
    const rawTemplate = templates[i % templates.length];
    const finalName = rawTemplate.includes('{loc}')
      ? rawTemplate.replace('{loc}', locClean)
      : rawTemplate;

    const s1 = getSeed(i * 3 + 1);
    const s2 = getSeed(i * 3 + 2);
    const s3 = getSeed(i * 3 + 3);

    // Distance distributed naturally between 8% and 92% of radius using square-root distribution
    const distRatio = 0.08 + 0.84 * Math.sqrt(s1);
    const dist = Math.max(40, Math.min(radiusMeters * 0.92, Math.round(radiusMeters * distRatio)));

    // Angle distributed organically across safe land directions
    let rawAngle = s2 * 360;

    if (isMarmaraCoast && lat < 40.955) {
      // Marmara Sea is SW (140° to 305°). Safe land arc is NW to SE: 305° -> 360° -> 140° (195° of land)
      rawAngle = (305 + s2 * 195) % 360;
    } else if (isAegeanCoast && lng < 27.15) {
      // Izmir Gulf sea is West (200° to 340°). Safe land arc: 340° -> 200° (220° of land)
      rawAngle = (340 + s2 * 220) % 360;
    }

    const angleRad = (rawAngle * Math.PI) / 180;
    const dLat = (dist / 111320) * Math.cos(angleRad);
    const dLng = (dist / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angleRad);

    let pLat = lat + dLat;
    let pLng = lng + dLng;

    // Check specific unpopulated forest/military/lake zones and snap to nearest urban commercial street
    // 1. Adana Seyhan Baraj Gölü & Kıyı Şeridi
    if (pLat >= 37.045 && pLat <= 37.140 && pLng >= 35.240 && pLng <= 35.370) {
      pLat = 37.038 + s3 * 0.012; // Snap south to Turgut Özal / Güzelyalı / Süleyman Demirel
      pLng = 35.285 + s1 * 0.022;
    }
    // 2. Mersin Akdeniz Sahil Sınırı
    if (pLat < 36.780 && pLng >= 34.50 && pLng <= 34.68) {
      pLat = 36.788 + s3 * 0.008; // Snap to Pozcu / Mezitli sahil yolu
    }
    // 3. Antalya Falezler & Sahil Sınırı
    if (pLat < 36.840 && pLng >= 30.68 && pLng <= 30.80) {
      pLat = 36.852 + s3 * 0.008; // Snap to Lara / Şirinyalı
    }
    // 4. Başıbüyük Ormanı / Süreyyapaşa / Mağara Tepesi (İstanbul)
    if (pLat >= 40.938 && pLat <= 40.968 && pLng >= 29.142 && pLng <= 29.175) {
      pLat = 40.925 + s3 * 0.012;
      pLng = 29.128 + s1 * 0.018;
    }
    // 5. 2. Zırhlı Tugay Kışlası (Military Base)
    if (pLat >= 40.922 && pLat <= 40.952 && pLng >= 29.165 && pLng <= 29.208) {
      pLat = 40.915 + s3 * 0.010;
      pLng = 29.144 + s1 * 0.016;
    }
    // 6. Kayışdağı Ormanı
    if (pLat >= 40.968 && pLat <= 40.995 && pLng >= 29.145 && pLng <= 29.180) {
      pLat = 40.978 + s3 * 0.008;
      pLng = 29.122 + s1 * 0.016;
    }
    // 7. Aydos Ormanı
    if (pLat >= 40.935 && pLat <= 40.985 && pLng >= 29.215 && pLng <= 29.275) {
      pLat = 40.915 + s3 * 0.010;
      pLng = 29.192 + s1 * 0.018;
    }

    const calcDist = Math.round(calculateDistanceMeters(lat, lng, pLat, pLng));

    pois.push({
      id: `syn-${category}-${categoryIndex}-${i}-${Math.round(pLat * 10000)}`,
      name: finalName,
      lat: pLat,
      lng: pLng,
      category,
      categoryLabel: meta.label,
      address: `${locClean} Mahallesi No: ${10 + (categoryIndex * 7 + i * 14) % 90}`,
      distanceMeters: calcDist,
    });
  }

  return pois;
}

const SECTOR_DENSITY_PER_10K: Record<string, number> = {
  hairdresser: 6.5,   // Kuaför, Berber & Güzellik (~1 per 1,500 people)
  restaurant: 5.8,    // Restoran & Lokanta (~1 per 1,700 people)
  market: 5.2,        // Süpermarket & Bakkal (~1 per 1,900 people)
  cafe: 4.6,          // Kafe & Kahve Dükkanı (~1 per 2,100 people)
  donerci: 3.8,       // Dönerci & Kebapçı (~1 per 2,600 people)
  real_estate: 3.4,   // Emlak & Gayrimenkul Ofisi
  boutique: 2.8,      // Butik & Giyim Mağazası
  bakery: 2.6,        // Fırın & Unlu Mamüller
  oto_tamir: 2.2,     // Oto Tamir & Bakım Servisi
  borekci: 1.8,       // Börekçi & Poğaçacı
  cigkofteci: 1.7,    // Çiğ Köfteci
  pharmacy: 1.5,      // Eczane (Yasal Kota: 1 / 3.500 kişi)
  dry_cleaning: 1.4,  // Kuru Temizleme & Terzi
  electronics: 1.3,   // Elektronik & Telefon Tamir
  stationery: 1.1,    // Kırtasiye & Kitabevi
  dental_clinic: 1.0, // Diş Kliniği
  gym: 0.9,           // Spor Salonu & Pilates
  pet_shop: 0.85,     // Petshop & Veteriner
  optician: 0.8,      // Optik & Gözlükçü
  florist: 0.75,      // Çiçekçi & Botanik
  hardware: 0.9,      // Nalburiye & Hırdavat
  zuccaciye: 0.8,     // Züccaciye
  dondurmaci: 0.7,    // Dondurmacı & Waffle
  tatlici: 0.8,       // Tatlıcı & Baklavacı
  cilingir: 0.6,      // Çilingir & Anahtarcı
  car_wash: 0.7,      // Oto Yıkama & Kuaför
  law_firm: 1.2,      // Hukuk & Avukatlık
  insurance_agency: 0.8, // Sigorta Acentesi
  travel_agency: 0.5, // Turizm & Seyahat Acentesi
  auto_gallery: 0.6,  // Oto Galeri
  kindergarten: 0.6,  // Anaokulu & Kreş
  noter: 0.16,        // Noter (Yasal Kota)
};

/* ========================================================================= */
/* UNIFIED MASTER AREA POI & SECTOR CENSUS ENGINE                            */
/* ========================================================================= */

export interface AreaPoiCensusResult {
  allPois: CompetitorPoi[];
  sectorCensus: Record<string, number>;
}

const MASTER_AREA_CENSUS_CACHE = new Map<string, { data: AreaPoiCensusResult; ts: number }>();

export async function fetchMasterAreaPoiCensus(
  lat: number,
  lng: number,
  radiusMeters: number,
  locationName: string = 'Bölge',
  targetCategory: RadarCategoryKey | RadarCategoryKey[] | string = 'all',
): Promise<AreaPoiCensusResult> {
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;

  const targetCategoryArray: RadarCategoryKey[] = Array.isArray(targetCategory)
    ? targetCategory
    : typeof targetCategory === 'string' && targetCategory !== 'all'
    ? (targetCategory.split(',').filter(Boolean) as RadarCategoryKey[])
    : [];

  const masterAllKey = `master-census-${roundedLat}-${roundedLng}-${radiusMeters}-all`;

  // 1. Check or build consistent master area census
  let masterResult: AreaPoiCensusResult | null = null;
  const cachedMaster = MASTER_AREA_CENSUS_CACHE.get(masterAllKey);
  if (cachedMaster && Date.now() - cachedMaster.ts < CACHE_TTL_MS) {
    masterResult = cachedMaster.data;
  } else {
    // A. Collect known landmark POIs from registry within radius
    const knownPois = TURKEY_REAL_KNOWN_POI_REGISTRY
      .filter((p) => calculateDistanceMeters(lat, lng, p.lat, p.lng) <= radiusMeters)
      .map((p) => ({
        ...p,
        distanceMeters: Math.round(calculateDistanceMeters(lat, lng, p.lat, p.lng)),
      }));

    // B. Concurrently fetch live real POIs from Overpass (OSM) AND Google Maps Public Engine ($0 cost)
    const targetCatKey = (targetCategoryArray.length > 0 && targetCategoryArray[0] !== 'all')
      ? targetCategoryArray[0]
      : undefined;

    const [overpassRes, gmapAllRes, gmapTargetRes] = await Promise.allSettled([
      fetchOverpassCompetitorPois(lat, lng, radiusMeters, 'all'),
      fetchGooglePublicPois(lat, lng, radiusMeters, 'all'),
      targetCatKey ? fetchGooglePublicPois(lat, lng, radiusMeters, targetCatKey) : Promise.resolve([]),
    ]);

    const overpassPois = overpassRes.status === 'fulfilled' ? overpassRes.value : [];
    const gmapAllPois = gmapAllRes.status === 'fulfilled' ? gmapAllRes.value : [];
    const gmapTargetPois = gmapTargetRes.status === 'fulfilled' ? gmapTargetRes.value : [];
    let livePois: CompetitorPoi[] = [...overpassPois, ...gmapAllPois, ...gmapTargetPois];

    // Secondary fallback: If both returned 0 POIs, query Nominatim bounding box
    if (livePois.length === 0) {
      try {
        const nomPois = await fetchNominatimPois(lat, lng, radiusMeters, 'all');
        if (nomPois && nomPois.length > 0) {
          livePois = nomPois;
        }
      } catch {
        // Nominatim fallback handled gracefully
      }
    }

    // C. Merge & Deduplicate real collected POIs
    // Deduplicate by ID and spatial proximity (< 25m) + normalized name matching
    const rawCollectedPois = [...knownPois, ...livePois];
    const seenPoiIds = new Set<string>();
    const spatialIndex: Array<{ lat: number; lng: number; normName: string }> = [];
    const categorizedPois: Record<string, CompetitorPoi[]> = {};
    const deduplicatedPois: CompetitorPoi[] = [];

    const normalizePoiName = (text: string) =>
      text.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, '').trim();

    for (const poi of rawCollectedPois) {
      if (!poi || !poi.id || seenPoiIds.has(poi.id)) continue;

      const normName = normalizePoiName(poi.name);
      let isDuplicate = false;

      // Proximity & name overlap check
      for (const existing of spatialIndex) {
        if (
          Math.abs(poi.lat - existing.lat) < 0.0003 && // ~30m
          Math.abs(poi.lng - existing.lng) < 0.0003
        ) {
          const dist = calculateDistanceMeters(poi.lat, poi.lng, existing.lat, existing.lng);
          if (dist < 25) {
            if (
              normName.length > 2 &&
              (normName === existing.normName ||
                normName.includes(existing.normName) ||
                existing.normName.includes(normName))
            ) {
              isDuplicate = true;
              break;
            }
          }
        }
      }

      if (isDuplicate) continue;

      seenPoiIds.add(poi.id);
      spatialIndex.push({ lat: poi.lat, lng: poi.lng, normName });
      deduplicatedPois.push(poi);

      if (poi.category && poi.category !== 'all') {
        if (!categorizedPois[poi.category]) {
          categorizedPois[poi.category] = [];
        }
        categorizedPois[poi.category].push(poi);
      }
    }

    // D. Compute exact census from REAL, 1-to-1 collected POIs across all categories
    const allCategories = Object.keys(RADAR_CATEGORIES) as RadarCategoryKey[];
    const sectorCensus: Record<string, number> = {};
    allCategories.forEach((catKey) => {
      let count = categorizedPois[catKey]?.length || 0;
      if (catKey === 'restaurant') {
        count += (categorizedPois['donerci']?.length || 0);
      } else if (catKey === 'dry_cleaning') {
        count += (categorizedPois['terzi']?.length || 0);
      }
      sectorCensus[catKey] = count;
    });

    const sortedAllPois = deduplicatedPois.sort((a, b) => a.distanceMeters - b.distanceMeters);
    masterResult = {
      allPois: sortedAllPois,
      sectorCensus,
    };

    if (sortedAllPois.length > 0) {
      MASTER_AREA_CENSUS_CACHE.set(masterAllKey, { data: masterResult, ts: Date.now() });
    }
  }

  // 2. If specific target category was requested, filter from the consistent master census
  if (targetCategoryArray.length > 0 && targetCategoryArray[0] !== 'all') {
    const filteredPois = masterResult.allPois.filter((p) => {
      if (!p.category) return false;
      return (
        targetCategoryArray.includes(p.category as RadarCategoryKey) ||
        (targetCategoryArray.includes('dry_cleaning') && p.category === 'terzi') ||
        (targetCategoryArray.includes('restaurant') && p.category === 'donerci')
      );
    });

    return {
      allPois: filteredPois,
      sectorCensus: masterResult.sectorCensus, // Always return the exact same consistent sector counts!
    };
  }

  return masterResult;
}

export async function fetchCompetitorPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: RadarCategoryKey,
  locationName: string = 'Bölge',
): Promise<CompetitorPoi[]> {
  const { allPois } = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, category);

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
