/**
 * Smart field intent detection and option ranking based on listing title / keywords.
 * Enables auto-matching and prioritizing options in dropdowns (e.g., typing "Çilingir Hizmeti"
 * prioritizes and auto-matches "Çilingir ve Kilit" in the category/branch picker).
 */

import { HIZMET_CATEGORY_OPTIONS } from '@/features/listings/config/listing-field-options';

/** Keyword & synonym mappings for known field types */
const HIZMET_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Çilingir ve Kilit': [
    'çilingir',
    'cilingir',
    'kilit',
    'anahtar',
    'anahtarcı',
    'kapı açma',
    'kapi acma',
    'oto kilit',
    'kale kilit',
    'göbek değişimi',
    'gobek degisimi',
    'kilit değişimi',
    'kasa açma',
    'çelik kapı',
    'celik kapi',
    'oto kapı',
    'barel',
    'kilitçi',
  ],
  'Elektrik ve Tesisat': [
    'elektrik',
    'tesisat',
    'su tesisat',
    'su kaçağı',
    'su kacagi',
    'klozet',
    'musluk',
    'batarya',
    'petek',
    'pimaş',
    'pimas',
    'tıkanıklık',
    'tikaniklik',
    'gider açma',
    'gider acma',
    'sigorta',
    'kablo',
    'avize',
    'led',
    'priz',
    'şofben',
    'sofben',
    'kaçak su',
    'sıhhi tesisat',
    'sihhi tesisat',
    'elektrikçi',
    'elektrikci',
    'su tesisatçısı',
    'sucu',
    'kombici',
  ],
  'Ev ve Ofis Temizliği': [
    'temizlik',
    'temizliği',
    'temizligi',
    'ev temizliği',
    'ofis temizliği',
    'gündelikçi',
    'gundelikci',
    'yardımcı bayan',
    'inşaat sonrası',
    'insaat sonrasi',
    'boş ev',
    'bos ev',
    'cam silme',
    'dezenfeksiyon',
    'villa temizliği',
    'temizlikçi',
    'temizlikci',
  ],
  'Nakliye ve Taşımacılık': [
    'nakliye',
    'nakliyat',
    'taşımacılık',
    'tasimacilik',
    'taşıma',
    'tasima',
    'evden eve',
    'kamyonet',
    'parça eşya',
    'parca esya',
    'ofis taşıma',
    'asansörlü nakliyat',
    'nakliyeci',
    'şehirler arası',
    'sehirler arasi',
    'koli taşıma',
    'yük taşıma',
  ],
  'Boya, Badana ve Tadilat': [
    'boya',
    'badana',
    'tadilat',
    'dekorasyon',
    'alçı',
    'alci',
    'sıva',
    'siva',
    'kartonpiyer',
    'boyacı',
    'boyaci',
    'duvar kağıdı',
    'fayans',
    'seramik',
    'kalebodur',
    'mantolama',
    'izolasyon',
    'parke',
    'laminant',
    'asma tavan',
    'tadilati',
  ],
  'Halı ve Koltuk Yıkama': [
    'halı yıkama',
    'hali yikama',
    'koltuk yıkama',
    'koltuk yikama',
    'yatak yıkama',
    'buharlı yıkama',
    'halı',
    'hali',
    'koltuk',
    'yıkamacı',
    'yikamaci',
    'stor perde',
    'perde yıkama',
  ],
  'Oto Yıkama ve Detailing': [
    'oto yıkama',
    'oto yikama',
    'detailing',
    'pasta cila',
    'seramik kaplama',
    'araç temizliği',
    'arac temizligi',
    'oto kuaför',
    'oto kuafor',
    'iç dış yıkama',
    'ic dis yikama',
    'boya koruma',
    'cam filmi',
    'araba yıkama',
  ],
  'Beyaz Eşya ve Kombi Servisi': [
    'kombi',
    'klima',
    'beyaz eşya',
    'beyaz esya',
    'çamaşır makinesi',
    'camasir makinesi',
    'bulaşık makinesi',
    'bulasik makinesi',
    'buzdolabı',
    'buzdolabi',
    'kombi servisi',
    'klima montajı',
    'klima bakımı',
    'petek temizleme',
    'petek servisi',
    'fırın tamiri',
    'firin tamiri',
    'tamirci',
    'servis',
  ],
  'Marangoz ve Mobilya Montajı': [
    'marangoz',
    'mobilya',
    'montaj',
    'mobilya montajı',
    'mobilya montaji',
    'dolap',
    'gardırop',
    'gardirop',
    'ikea montaj',
    'mutfak dolabı',
    'ahşap',
    'ahsap',
    'kapı montajı',
    'kapi montaji',
    'marangozcu',
  ],
};

const BUSINESS_TYPE_KEYWORDS: Record<string, string[]> = {
  'Kafe / Restoran': [
    'kafe', 'cafe', 'restoran', 'restaurant', 'lokanta', 'kahve', 'kahveci', 'pastane',
    'fırın', 'firin', 'tatlıcı', 'çiğ köfte', 'cig kofte', 'döner', 'doner', 'büfe', 'bufe',
    'fast food', 'pizzacı', 'pizzaci', 'pub', 'bistro', 'meyhane', 'ocakbaşı', 'ocakbasi',
  ],
  'Market / Bakkal': [
    'market', 'bakkal', 'süpermarket', 'supermarket', 'şarküteri', 'sarkuteri', 'tekel',
    'kuruyemiş', 'kuruyemis', 'manav', 'aktar', 'büfe', 'mini market',
  ],
  'Giyim / Butik': [
    'giyim', 'butik', 'mağaza', 'magaza', 'ayakkabı', 'ayakkabi', 'çanta', 'canta',
    'tekstil', 'bijuteri', 'kozmetik', 'iç giyim', 'ic giyim', 'abiye',
  ],
  'Kuaför / Güzellik Salonu': [
    'kuaför', 'kuafor', 'güzellik', 'guzellik', 'berber', 'tırnak', 'tirnak', 'estetik',
    'solaryum', 'makyaj', 'spa', 'masaj', 'lazer', 'cilt bakımı',
  ],
  'Oto Servis / Yıkama': [
    'oto yıkama', 'oto yikama', 'oto servis', 'lastikçi', 'lastikci', 'oto kuaför',
    'tamirhane', 'kaporta', 'oto galeri', 'ekspertiz',
  ],
  'E-Ticaret / Dijital': [
    'e-ticaret', 'eticaret', 'pazaryeri', 'trendyol', 'amazon', 'hepsiburada',
    'online satış', 'yazılım', 'yazilim', 'web sitesi', 'dijital ajans',
  ],
  'Hizmet / Atölye': [
    'atölye', 'atolye', 'imalathane', 'terzi', 'kuru temizleme', 'matbaa',
    'reklamcı', 'reklamci', 'servis', 'kırtasiye', 'kirtasiye',
  ],
};

const SECTOR_KEYWORDS: Record<string, string[]> = {
  'Yeme - İçme / Kafe / Restoran': [
    'kafe', 'cafe', 'restoran', 'restaurant', 'lokanta', 'kahve', 'fırın', 'pastane',
    'gıda', 'gida', 'yiyecek', 'içecek', 'icecek', 'fast food',
  ],
  'Perakende ve Mağazacılık': [
    'market', 'bakkal', 'mağaza', 'magaza', 'butik', 'giyim', 'ayakkabı', 'şarküteri',
    'perakende', 'satış', 'satis', 'avm',
  ],
  'Hizmet ve Ustalık': [
    'usta', 'ustalık', 'tamirat', 'tamir', 'tesisat', 'temizlik', 'nakliye', 'çilingir',
    'boya', 'servis', 'bakım', 'hizmet',
  ],
  'Güzellik, Sağlık ve Bakım': [
    'kuaför', 'kuafor', 'berber', 'güzellik', 'estetik', 'sağlık', 'saglik', 'spa', 'masaj',
  ],
  'Otomotiv ve Taşımacılık': [
    'oto', 'araba', 'araç', 'arac', 'nakliye', 'taşımacılık', 'servis', 'lastik', 'yıkama',
  ],
  'Bilişim ve Yazılım': [
    'yazılım', 'yazilim', 'bilişim', 'bilisim', 'web', 'mobil', 'yapay zeka', 'ai', 'teknoloji',
    'e-ticaret', 'eticaret',
  ],
};

/** Normalize text: Turkish lowercase + ASCII fold for robust fuzzy comparison */
export function normalizeForIntentMatching(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Calculate match score between input text and an option */
export function calculateMatchScore(
  inputText: string,
  option: string,
  customKeywords?: string[],
): number {
  if (!inputText.trim() || !option.trim()) return 0;

  const normInput = normalizeForIntentMatching(inputText);
  const normOption = normalizeForIntentMatching(option);

  if (!normInput || !normOption) return 0;

  let score = 0;

  // 1. Direct contains match in option text
  if (normInput.includes(normOption)) {
    score += 120;
  } else if (normOption.includes(normInput)) {
    score += 100;
  }

  // 2. Word-level overlap with option text
  const inputWords = normInput.split(' ').filter((w) => w.length >= 3);
  const optionWords = normOption.split(' ').filter((w) => w.length >= 3);

  for (const iw of inputWords) {
    for (const ow of optionWords) {
      if (iw === ow) {
        score += 40;
      } else if (ow.includes(iw) || iw.includes(ow)) {
        score += 20;
      }
    }
  }

  // 3. Synonym & domain keywords match
  if (customKeywords && customKeywords.length > 0) {
    for (const kw of customKeywords) {
      const normKw = normalizeForIntentMatching(kw);
      if (!normKw) continue;

      if (normInput.includes(normKw)) {
        // Multi-word phrase matches get higher score
        score += normKw.includes(' ') ? 80 : 50;
      } else {
        // Word token overlap with keyword
        const kwWords = normKw.split(' ').filter((w) => w.length >= 3);
        for (const iw of inputWords) {
          if (kwWords.includes(iw)) {
            score += 35;
          }
        }
      }
    }
  }

  return score;
}

/** Get keyword dictionary for a specific field key */
function getKeywordsDictionaryForField(fieldKey: string): Record<string, string[]> | null {
  if (fieldKey === 'serviceCategory') return HIZMET_CATEGORY_KEYWORDS;
  if (fieldKey === 'businessType' || fieldKey === 'preferredBusinessTypes') return BUSINESS_TYPE_KEYWORDS;
  if (fieldKey === 'sector' || fieldKey === 'sectors' || fieldKey === 'primarySector' || fieldKey === 'preferredSectors') {
    return SECTOR_KEYWORDS;
  }
  return null;
}

export interface SmartRankResult {
  rankedOptions: string[];
  bestMatch: string | null;
  matchScore: number;
  isMatch: (option: string) => boolean;
}

/**
 * Rank options based on input title / text.
 * Moves best matching options to the top of the array.
 */
export function rankOptionsBySmartIntent(
  options: readonly string[] | string[],
  inputText?: string | null,
  fieldKey?: string,
): SmartRankResult {
  const list = [...options];
  if (!inputText || !inputText.trim()) {
    return {
      rankedOptions: list,
      bestMatch: null,
      matchScore: 0,
      isMatch: () => false,
    };
  }

  const kwDict = fieldKey ? getKeywordsDictionaryForField(fieldKey) : null;

  const scored = list.map((opt) => {
    const customKw = kwDict?.[opt];
    const score = calculateMatchScore(inputText, opt, customKw);
    return { opt, score };
  });

  // Sort by score desc, while preserving original relative order for ties
  const sorted = [...scored].sort((a, b) => b.score - a.score);

  const top = sorted[0];
  const bestMatch = top && top.score >= 35 ? top.opt : null;
  const matchScore = top ? top.score : 0;

  // Options with score >= 35 are brought to the front
  const matchedSet = new Set(sorted.filter((s) => s.score >= 35).map((s) => s.opt));

  const rankedOptions = [
    ...sorted.filter((s) => s.score >= 35).map((s) => s.opt),
    ...list.filter((opt) => !matchedSet.has(opt)),
  ];

  return {
    rankedOptions,
    bestMatch,
    matchScore,
    isMatch: (opt: string) => matchedSet.has(opt),
  };
}

/**
 * Helper to get the top matching service category for a title.
 */
export function detectBestServiceCategory(title: string): string | null {
  const result = rankOptionsBySmartIntent(HIZMET_CATEGORY_OPTIONS, title, 'serviceCategory');
  return result.bestMatch;
}
