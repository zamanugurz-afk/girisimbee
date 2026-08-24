import { normalizeCvText } from '@/features/candidates/cv/cv-turkish-encoding';

export function normalizeTrUniversal(s: string): string {
  if (!s) return '';
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * List of forbidden section headers, keywords, and non-person phrases that
 * MUST NEVER be recognized as a candidate's full name.
 */
export const FORBIDDEN_NAME_SECTIONS = new Set([
  'egitim',
  'egitim ve gelisim',
  'egitim bilgileri',
  'egitim durumu',
  'egitim gecmisi',
  'egitim ve sertifikalar',
  'egitim ve nitelikler',
  'egitim ve ogrenim',
  'ogrenim durumu',
  'ogrenim bilgileri',
  'ogrenim',
  'akademik egitim',
  'akademik gecmis',
  'deneyim',
  'deneyimler',
  'deneyimlerim',
  'is deneyimi',
  'is deneyimleri',
  'is deneyimlerim',
  'is tecrubesi',
  'is tecrubeleri',
  'calisma gecmisi',
  'calisma tercihleri',
  'calisma tercihi',
  'mesleki deneyim',
  'mesleki tecrube',
  'sertifika',
  'sertifikalar',
  'sertifikalarim',
  'sertifika / dil',
  'sertifikalar ve diller',
  'kurslar',
  'kurs ve sertifikalar',
  'yetenekler',
  'yeteneklerim',
  'beceriler',
  'becerilerim',
  'yetkinlikler',
  'yetkinliklerim',
  'teknik yetkinlikler',
  'mesleki yetkinlikler',
  'uzmanlik alanlari',
  'uzmanlik alani',
  'uzmanliklar',
  'uzmanliklarim',
  'uzmanliklarin',
  'uzmanlik',
  'referanslar',
  'referanslarim',
  'referans',
  'diger bilgiler',
  'genel bilgiler',
  'ek bilgiler',
  'diger',
  'diller',
  'yabanci diller',
  'yabanci dil',
  'bilinen diller',
  'hobiler',
  'ilgi alanlari',
  'projeler',
  'projelerim',
  'yayinlar',
  'sosyal medya',
  'kisisel bilgiler',
  'kisisel bilgilerim',
  'kisisel bilgi',
  'kisisel veriler',
  'kisisel',
  'iletisim bilgileri',
  'iletisim bilgilerim',
  'iletisim',
  'iletisim detaylari',
  'ozgecmis',
  'ozgecmisim',
  'curriculum vitae',
  'curriculum',
  'resume',
  'cv',
  'cv ozeti',
  'kariyer ozeti',
  'kariyer profili',
  'kariyer hedefi',
  'kariyer gecmisi',
  'kariyer basamaklari',
  'kariyer',
  'hakkimda',
  'hakkinda',
  'profil',
  'profil ozeti',
  'kisa profil',
  'ozet',
  'ad soyad',
  'isim soyisim',
  'adi soyadi',
  'ad soyadi',
  'isim',
  'ad',
  'soyad',
  'full name',
  'candidate name',
  'candidate',
  'name',
  'personal information',
  'personal details',
  'contact information',
  'contact details',
  'work experience',
  'professional experience',
  'employment history',
  'education',
  'skills',
  'certifications',
  'languages',
  'references',
  'about me',
  'summary',
  'profile',
]);

export const FORBIDDEN_SECTION_WORD_ROOTS = new Set([
  'egitim',
  'egitimi',
  'egitimler',
  'egitimleri',
  'ogrenim',
  'ogrenimi',
  'deneyim',
  'deneyimler',
  'deneyimlerim',
  'deneyimi',
  'tecrube',
  'tecrubesi',
  'tecrubeler',
  'uzmanlik',
  'uzmanliklar',
  'uzmanliklarim',
  'uzmanliklarin',
  'kariyer',
  'hakkimda',
  'hakkinda',
  'profil',
  'ozet',
  'kisisel',
  'iletisim',
  'ozgecmis',
  'curriculum',
  'vitae',
  'resume',
  'sertifika',
  'sertifikalar',
  'sertifikalarim',
  'kurs',
  'kurslar',
  'yetenek',
  'yetenekler',
  'yeteneklerim',
  'beceri',
  'beceriler',
  'becerilerim',
  'yetkinlik',
  'yetkinlikler',
  'yetkinliklerim',
  'referans',
  'referanslar',
  'referanslarim',
  'genel',
  'bilgi',
  'bilgiler',
  'bilgileri',
  'bilgilerim',
  'diller',
  'yabanci',
  'hobi',
  'hobiler',
  'ilgi',
  'proje',
  'projeler',
  'projelerim',
  'yayin',
  'yayinlar',
  'tercih',
  'tercihler',
  'tercihleri',
  'calisma',
  'sektor',
  'sektoru',
  'pozisyon',
  'pozisyonu',
  'unvan',
  'unvani',
  'universite',
  'universitesi',
  'fakulte',
  'fakultesi',
  'enstitu',
  'enstitusu',
  'okul',
  'okulu',
  'lise',
  'lisesi',
  'bolum',
  'bolumu',
  'mezun',
  'mezuniyet',
  'yonetim',
  'yonetimi',
  'yonetimler',
  'yonetimleri',
  'pazarlama',
  'operasyon',
  'operasyonlar',
  'operasyonlari',
  'operasyonel',
  'gelistirme',
  'kazanimi',
  'performans',
  'verimlilik',
  'ekip',
  'ekibi',
  'ekipler',
  'ekipleri',
  'takim',
  'takimi',
  'takimlar',
  'takimlari',
  'kadro',
  'personel',
  'personeli',
  'eleman',
  'elemani',
  'sati',
  'satis',
  'satislar',
  'satislari',
  'telemarketing',
  'sutun',
  'sutunu',
  'sutunlar',
  'kolon',
  'kolonu',
  'kolonlar',
  'sidebar',
  'sol',
  'sag',
  'turkiye',
  'holding',
  'sirket',
  'sirketi',
  'sanayi',
  'ticaret',
  'danismanlik',
  'hizmetleri',
  'ltd',
  'sti',
  'tech',
  'teknoloji',
  'insaat',
  'lojistik',
  'otel',
  'otelleri',
  'bank',
  'bankasi',
  'sigorta',
  'medya',
  'enerji',
  'tekstil',
  'gida',
  'market',
  'yazilim',
  'muhendislik',
  'muhendisligi',
  'iktisat',
  'finans',
  'urun',
  'urunu',
  'urunler',
  'urunleri',
  'strateji',
  'stratejisi',
  'stratejiler',
  'stratejileri',
  'analiz',
  'analizi',
  'analizler',
  'tasarim',
  'tasarimi',
  'kodlama',
  'planlama',
  'planlamasi',
  'mali',
  'muhasebe',
  'denetim',
  'cozum',
  'destek',
  'arastirma',
  'uygulama',
  'agile',
  'scrum',
  'testi',
  'testler',
  'guvence',
  'guvencesi',
  'raporlama',
  'crm',
  'erp',
  'sap',
  'sql',
  'lead',
  'leader',
  'data',
  'analytics',
  'software',
  'hardware',
  'network',
  'cyber',
  'security',
  'cloud',
  'digital',
  'growth',
  'brand',
  'content',
  'social',
  'marketing',
  'sales',
  'finance',
  'accounting',
  'operations',
  'quality',
  'assurance',
  'legal',
  'compliance',
  'engineering',
  'development',
  'consulting',
  'management',
  'academic',
  'background',
  'experience',
  'education',
  'skills',
  'competencies',
  'berufserfahrung',
  'ausbildung',
  'kompetenzen',
  'fachkenntnisse',
  'referenzen',
  'lebenslauf',
  'formation',
  'competences',
  'langues',
  'experiencia',
  'laboral',
  'educacion',
  'habilidades',
  'idiomas',
  'referencias',
  'university',
  'universitat',
  'universite',
  'universidad',
  'polytechnic',
  'college',
  'academy',
  'institute',
  'instituto',
  'institut',
]);

const KNOWN_TITLE_CASE_OVERRIDES: Record<string, string> = {
  bilgin: 'Bilgin',
  engin: 'Engin',
  metin: 'Metin',
  cetin: 'Çetin',
  ismail: 'İsmail',
  ibrahim: 'İbrahim',
  ilker: 'İlker',
  ilhan: 'İlhan',
  izgi: 'İzgi',
  irem: 'İrem',
  ipek: 'İpek',
  inci: 'İnci',
  ilknur: 'İlknur',
  ilayda: 'İlayda',
  yigit: 'Yiğit',
  yagiz: 'Yağız',
  caglar: 'Çağlar',
  cagri: 'Çağrı',
};

/**
 * Converts a Turkish name into clean Title Case (e.g. "UĞUR ZAMAN" -> "Uğur Zaman")
 */
export function formatTurkishTitleCase(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      const norm = normalizeTrUniversal(word);
      if (KNOWN_TITLE_CASE_OVERRIDES[norm]) {
        return KNOWN_TITLE_CASE_OVERRIDES[norm];
      }
      const first = word.charAt(0).toLocaleUpperCase('tr-TR');
      const rest = word.slice(1).toLocaleLowerCase('tr-TR');
      return first + rest;
    })
    .join(' ');
}

/**
 * Checks whether a candidate string is an invalid name (section header, email, phone, corporate, or illegal chars).
 */
export function isForbiddenNameCandidate(rawCandidate: string): boolean {
  if (!rawCandidate) return true;
  const trimmed = rawCandidate.trim();
  if (trimmed.length < 3 || trimmed.length > 60) return true;

  const norm = normalizeTrUniversal(trimmed);
  if (!norm) return true;

  // 1. Exact match against forbidden section headings
  if (FORBIDDEN_NAME_SECTIONS.has(norm)) {
    return true;
  }

  // 2. Word count constraints: Person full name must have between 2 and 4 words
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 4) {
    return true;
  }

  // 3. Check each word against forbidden roots, length, and valid alphabet
  for (const word of words) {
    if (word.length < 2) return true;
    if (!/^[-a-zA-ZÇĞİÖŞÜçğıöşü']+$/.test(word)) {
      return true;
    }
    const normWord = normalizeTrUniversal(word);
    if (FORBIDDEN_SECTION_WORD_ROOTS.has(normWord)) {
      return true;
    }
  }

  // 4. Starts-with check for common section heading prefixes
  const forbiddenPrefixes = [
    'kisisel bilgi',
    'kisisel',
    'iletisim',
    'egitim',
    'deneyim',
    'is deneyim',
    'kariyer',
    'hakkimda',
    'profil',
    'sertifika',
    'yetenek',
    'beceri',
    'yetkinlik',
    'uzmanlik',
    'referans',
    'diger bilgi',
    'genel bilgi',
    'ek bilgi',
    'diller',
    'yabanci dil',
    'hobiler',
    'projeler',
    'ad soyad',
    'isim soyisim',
    'adi soyadi',
    'personal info',
    'contact info',
    'work exp',
    'education',
    'skills',
    'certifications',
    'languages',
    'references',
  ];

  const firstWordToken = norm.split(/\s+/)[0];
  for (const prefix of forbiddenPrefixes) {
    if (
      norm === prefix ||
      norm.startsWith(prefix + ' ') ||
      norm.startsWith(prefix + ':') ||
      firstWordToken.startsWith(prefix)
    ) {
      return true;
    }
  }

  // 5.4 Lorem ipsum placeholder text check
  if (norm.includes('lorem') || norm.includes('ipsum') || norm.includes('dolor sit')) {
    return true;
  }

  // 5.5 City name as first word check (cities that are never Turkish given names)
  const firstWord = norm.split(/\s+/)[0];
  const nonPersonCities = new Set([
    'istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'gaziantep',
    'sanliurfa', 'kocaeli', 'mersin', 'diyarbakir', 'hatay', 'manisa', 'kayseri',
    'samsun', 'balikesir', 'kahramanmaras', 'van', 'denizli', 'sakarya',
    'erzurum', 'mugla', 'eskisehir', 'mardin', 'trabzon', 'malatya', 'tekirdag',
    'ordu', 'afyonkarahisar', 'sivas', 'edirne', 'canakkale', 'rize', 'yalova',
  ]);
  if (nonPersonCities.has(firstWord) && norm.split(/\s+/).length > 1) {
    return true;
  }

  // 7. Corporate entities / institutional words & suffixes
  if (
    /\b(?:holding|sirketi|sirket|limited|anonim|a\.s|ltd|bankasi|banka|hastanesi|hastane|universitesi|universite|univ|üniv|fakultesi|fakulte|enstitusu|enstitu|mudurlugu|mudurluk|bakanligi|bakanlik|belediyesi|belediye|sanayi|ticaret|vakfi|vakif|dernegi|dernek|federasyonu|ortakligi|ortaklik|burosu|buro|ajansi|ajans|ofisi|ofis|merkezi|merkez|klinigi|klinik|laboratuvari|hizmetleri|hizmet|atolyesi|grubu|grup|group|solutions|consulting|associates|law\s*firm|danismanlik|musavirlik|avukatlik|lise|lisesi|kolej|koleji|akademi|akademisi|okul|okulu|myo|bolum|bolumu|program|programi|lisans|onlisans|doktora|teknik|teknoloji|teknolojileri|sistemleri)\b/i.test(
      norm,
    )
  ) {
    return true;
  }

  // 7.5 Job titles and occupational nouns must never be treated as names
  if (
    /\b(?:gelistirici|developer|engineer|muhendisi|muhendis|uzmani|uzman|muduru|mudur|yoneticisi|yonetici|temsilcisi|temsilci|danismani|danisman|direktoru|direktor|operatoru|operator|analisti|analist|teknisyeni|teknisyen|teknikeri|tekniker|stajyeri|stajyer|ogrencisi|ogrenci|sorumlusu|sorumlu|koordinatoru|koordinator|asistani|asistan|baskani|baskan|sef|sefi|lideri|lider|personeli|elemani|gorevlisi|gorevli|denetci|denetcisi|auditor|muhasebeci|doktor|hemsire|avukat|ogretmen|tasarimci|mimar|psikolog|cerrah)\b/i.test(
      norm,
    )
  ) {
    return true;
  }

  // 7.6 Turkish action clauses, responsibility phrases, and verbal noun suffixes
  if (
    /\b(?:yapilmasi|yapilmasini|edilmesi|edilmesini|yurutulmesi|yurutulmesini|saglanmasi|saglanmasini|takibi|takibinin|yonetimi|yonetiminin|duzenlenmesi|olusturulmasi|hazirlanmasi|raporlanmasi|surecleri|sureclerinin|faaliyetleri|islemleri|koordinasyonu|gelistirilmesi|artirilmasi|kontrolu|desteklenmesi)\b/i.test(
      norm,
    )
  ) {
    return true;
  }

  // 7.7 Team, staff, sales, metrics, customer acquisition, and operational keywords (including glued/compound tokens)
  if (
    /(?:ekip|ekibi|ekipleri|takim|takimi|kadro|personel|performans|verimlilik|operasyon|yonetim|surec|rapor|analiz|strateji|hedef|kalite|denetim|portfoy|kazanim|musteri|segmentasyon|donusum|pazar|faaliyet|gelistirme|ticari|destek|inbound|outbound|dijital|kurumsal|bireysel|saha|telemarketing|kanali|kanallari|lead|generation)/i.test(
      norm,
    )
  ) {
    return true;
  }

  // 7.8 Words containing non-name sales/commercial stems
  if (/\b(?:sati|satis|satislar|pazarlama|muhasebe|finans|telemarketing)\b/i.test(norm)) {
    return true;
  }

  // 7.9 Section header root stems and fractured/OCR-split section headings (e.g. "Kış İselbilgiler", "iselbilgiler", "kisisel bilgiler", "eg itim")
  const noSpaceNorm = norm.replace(/[\s\-_.,/]+/g, '');
  if (
    noSpaceNorm.startsWith('egitim') ||
    noSpaceNorm.startsWith('deneyim') ||
    noSpaceNorm.startsWith('isdeney') ||
    noSpaceNorm.startsWith('isgecmis') ||
    noSpaceNorm.startsWith('kisisel') ||
    noSpaceNorm.startsWith('iletisim') ||
    noSpaceNorm.startsWith('ozgecmis') ||
    noSpaceNorm.startsWith('referans') ||
    noSpaceNorm.startsWith('yetenek') ||
    noSpaceNorm.startsWith('beceri') ||
    noSpaceNorm.startsWith('sertifika') ||
    noSpaceNorm.startsWith('hakkimda') ||
    noSpaceNorm.startsWith('kariyer') ||
    /\b(?:kisisel|iletisim|ozgecmis|deneyim|deneyimleri|tecrube|tecrubeleri|egitim|egitimleri|ogrenim|yetenek|yetenekleri|beceri|becerileri|sertifika|sertifikalari|referans|referanslar|referanslari|profesyonel|kariyer|hakkimda|yayinlar|projeler)\b|(?:\b\w*bilgi(?:ler|leri|si|m|lerim)\b)|\b(?:kis\s+isel\w*)\b|\b(?:kisi\s+sel\w*)\b/i.test(
      norm,
    )
  ) {
    return true;
  }

  return false;
}

import { segmentCvIntoDocumentZones, type CvZoneType } from './cv-document-zoning';
import { scoreCandidateName, classifyCandidateSemantic } from './cv-candidate-scorer';
import { EXTENSIVE_TURKISH_MALE_NAMES, EXTENSIVE_TURKISH_FEMALE_NAMES } from './cv-universal-dictionary';

import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';

const TURKISH_PROVINCES_NORM = new Set(
  TURKISH_CITIES.map((c) => normalizeTrUniversal(c)).filter((c) => c !== 'aydin'),
);

function isValidSurnameToken(word: string, norm: string): boolean {
  if (!word || word.length < 2 || word.length > 25) return false;
  if (!/^[-a-zA-ZÇĞİÖŞÜçğıöşü']+$/.test(word)) return false;
  if (TURKISH_PROVINCES_NORM.has(norm)) return false;
  if (FORBIDDEN_SECTION_WORD_ROOTS.has(norm)) return false;
  if (FORBIDDEN_NAME_SECTIONS.has(norm)) return false;
  
  // Job titles, occupational nouns, corporate entities, industry domains, HR / departmental / contact tokens
  if (
    /\b(?:gelistirici|developer|engineer|muhendisi|muhendis|uzmani|uzman|muduru|mudur|yoneticisi|yonetici|temsilcisi|temsilci|danismani|danisman|direktoru|direktor|operatoru|operator|analisti|analist|teknisyeni|teknisyen|teknikeri|tekniker|stajyeri|stajyer|ogrencisi|ogrenci|sorumlusu|sorumlu|koordinatoru|koordinator|asistani|asistan|baskani|baskan|sef|sefi|lideri|lider|personeli|elemani|gorevlisi|gorevli|holding|sirket|ltd|banka|hastane|universite|fakulte|enstitu|mudurluk|bakanlik|belediye|sanayi|ticaret|vakif|dernek|ofis|merkez|klinik|hizmet|grup|group|lise|okul|lisans|doktora|teknik|teknoloji|yazarligi|yazarlik|yazar|saglik|tip|poliklinik|lojistik|pazarlama|muhasebe|finans|sigorta|reklam|medya|yayincilik|gazete|ajans|turizm|otelcilik|gida|tarim|tekstil|insaat|enerji|otomotiv|insan|kaynaklari|kaynaklar|departmani|bolumu|hukuk|avukat|musaviri|musavir|telefon|eposta|email|mail|gsm|iletisim|bilgisayar|yazilim|donanim|sistem|ag|veri|robotik|yapay|zeka|futbol|futbolcu|santrafor|kaleci|stoper|orta|saha|basketbol|voleybol|antrenor|tasarim|grafik|iktisat|isletme|kidemli|bas|lead|senior|junior|mid|tedarik|zinciri|planlama|frontend|backend|fullstack|mimari|mimar|film|produksiyon|studyo|studio|sinema|tiyatro|muzik|haber|kelime|sozcuk|cumle|satir|paragraf|sayfa|ornek|deneme|yazi|belge|dosya|dokuman|resim|foto|kod|hakkinda)\b/i.test(
      norm,
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Sliding Window Token Scanner for Turkish Names.
 * Tokenizes continuous words line-by-line and scans 2-3 word windows against extensive Turkish name sets,
 * validating adjacent surname candidate and cross-corroborating with email/LinkedIn/position.
 */
export function extractCandidateNameBySlidingWindow(rawText: string | null | undefined): string | null {
  if (!rawText) return null;
  const text = normalizeCvText(rawText, true);
  if (!text) return null;

  // Extract email username tokens for cross-corroboration
  const emailMatch =
    text.match(/([a-zA-Z0-9._%+-]+)@(gmail|hotmail|outlook|yahoo|icloud|yandex|proton)\.[a-zA-Z]{2,}/i) ||
    text.match(/([a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const emailTokens = emailMatch
    ? emailMatch[1].toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter((t) => t.length >= 2)
    : [];

  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedinTokens = linkedinMatch
    ? linkedinMatch[1].toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter((t) => t.length >= 2)
    : [];

  interface ScoredCandidate {
    fullName: string;
    score: number;
    lineIndex: number;
    wordIndex: number;
  }

  const candidates: ScoredCandidate[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const maxScanLines = Math.min(lines.length, 30);

  let inRefereeSection = false;
  for (let lineIdx = 0; lineIdx < maxScanLines; lineIdx++) {
    const line = lines[lineIdx];
    const normLine = normalizeTrUniversal(line);

    if (normLine.startsWith('referans') || normLine === 'references') {
      inRefereeSection = true;
      continue;
    }
    if (inRefereeSection) {
      const hasRefereeMarkers =
        normLine.includes('ref@') ||
        normLine.includes('referans') ||
        /\b(?:yonetim\s*kurulu|genel\s*mudur|direktor|baskan|mudur|sef|lider|danisman|prof|docent)\b/i.test(normLine);

      const hasCandidateEmailMatch = emailTokens.length > 0 && emailTokens.some((t) => normLine.includes(t));
      const nextLine = lines[lineIdx + 1] ? normalizeTrUniversal(lines[lineIdx + 1]) : '';
      const nextLineHasCandidateDetails =
        TURKISH_CITIES.some((c) => nextLine.includes(normalizeTrUniversal(c))) ||
        (emailTokens.length > 0 && emailTokens.some((t) => nextLine.includes(t)));

      if (
        normLine.startsWith('iletisim') ||
        normLine.startsWith('kisisel') ||
        normLine.startsWith('egitim') ||
        normLine.startsWith('deneyim') ||
        normLine.startsWith('is deneyim') ||
        normLine.startsWith('is gecmis') ||
        normLine.startsWith('hakkimda') ||
        normLine.startsWith('ozet') ||
        normLine.startsWith('yetkinlik') ||
        normLine.startsWith('beceri')
      ) {
        inRefereeSection = false;
        continue;
      } else if (hasCandidateEmailMatch || (nextLineHasCandidateDetails && !hasRefereeMarkers)) {
        inRefereeSection = false;
        // Proceed to tokenize this line as candidate name
      } else {
        continue;
      }
    }

    // Skip lines that are obvious section headers
    if (FORBIDDEN_NAME_SECTIONS.has(normLine) || FORBIDDEN_SECTION_WORD_ROOTS.has(normLine)) {
      continue;
    }

    // Split line into clause segments delimited by pipes, dashes with spaces, slashes with spaces, or parens
    const segments = line.split(/[|]|(?:\s+[\/\-–—]\s+)|(?:\s*[\(\)]\s*)/).map((s) => s.trim()).filter(Boolean);

    for (const segment of segments) {
      const cleanSegment = segment
        .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, ' ')
        .replace(/(?:https?:\/\/|www\.)[^\s]+/gi, ' ')
        .replace(/(?:\+?90|0?5\d{2})[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}/g, ' ')
        .replace(/\b\d{10,11}\b/g, ' ')
        .replace(/[\p{Extended_Pictographic}\uFE00-\uFE0F]/gu, ' ')
        .replace(/[•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:;,/\\()[\]{}"]/g, ' ');

      const rawWords = cleanSegment
        .split(/\s+/)
        .filter(Boolean);

      if (rawWords.length < 2) continue;

      for (let i = 0; i < rawWords.length - 1; i++) {
        const w1 = rawWords[i];
        const w2 = rawWords[i + 1];
        const w3 = i + 2 < rawWords.length ? rawWords[i + 2] : '';
        const nextWordAfter2 = i + 2 < rawWords.length ? rawWords[i + 2] : '';
      const nextWordAfter3 = i + 3 < rawWords.length ? rawWords[i + 3] : '';
      const normNext2 = nextWordAfter2 ? normalizeTrUniversal(nextWordAfter2) : '';
      const normNext3 = nextWordAfter3 ? normalizeTrUniversal(nextWordAfter3) : '';

      const isInstitutionalToken = (normToken: string) =>
        Boolean(
          normToken &&
            /\b(?:universitesi|universite|fakultesi|fakulte|enstitusu|enstitu|hastanesi|poliklinigi|vakfi|dernegi|belediyesi|holding|sirketi|lisesi|okulu|koleji|akademisi|subesi|bankasi)\b/i.test(
              normToken,
            ),
        );

      const norm1 = normalizeTrUniversal(w1);
      const norm2 = normalizeTrUniversal(w2);
      const norm3 = w3 ? normalizeTrUniversal(w3) : '';

      // If w1 is a province name (e.g. Aydın, İstanbul, Adana), only accept as given name if corroborated with email
      if (TURKISH_PROVINCES_NORM.has(norm1) && !emailTokens.some((t) => t.includes(norm1))) {
        continue;
      }

      // If CV has an email address, names deep in document (lines >= 5) with 0 email match are referees/managers
      if (emailTokens.length > 0 && lineIdx >= 5) {
        const matchesEmail1 = emailTokens.some((t) => t.includes(norm1) || norm1.includes(t));
        const matchesEmail2 = emailTokens.some((t) => t.includes(norm2) || norm2.includes(t));
        const matchesEmail3 = norm3 ? emailTokens.some((t) => t.includes(norm3) || norm3.includes(t)) : false;
        if (!matchesEmail1 && !matchesEmail2 && !matchesEmail3) {
          continue;
        }
      }

      const isW1GivenName = EXTENSIVE_TURKISH_MALE_NAMES.has(norm1) || EXTENSIVE_TURKISH_FEMALE_NAMES.has(norm1);

      if (isW1GivenName) {
        const isW2GivenName = EXTENSIVE_TURKISH_MALE_NAMES.has(norm2) || EXTENSIVE_TURKISH_FEMALE_NAMES.has(norm2);
        const w4 = i + 3 < rawWords.length ? rawWords[i + 3] : '';
        const norm4 = w4 ? normalizeTrUniversal(w4) : '';
        const isW3GivenName = norm3 ? EXTENSIVE_TURKISH_MALE_NAMES.has(norm3) || EXTENSIVE_TURKISH_FEMALE_NAMES.has(norm3) : false;

        // 0. Check 4-word candidate: [GivenName1, GivenName2, GivenName3, Surname]
        if (w4 && isW2GivenName && isW3GivenName && isValidSurnameToken(w4, norm4)) {
          let score = 240;
          if (lineIdx === 0) score += 70;
          else if (lineIdx < 5) score += 50;
          const candidateName = `${w1} ${w2} ${w3} ${w4}`;
          if (!isForbiddenNameCandidate(candidateName)) {
            candidates.push({ fullName: candidateName, score, lineIndex: lineIdx, wordIndex: i });
          }
        }

        // 1. Check 3-word candidate: [GivenName1, GivenName2, Surname] or [GivenName, Surname1, Surname2]
        if (w3 && !isInstitutionalToken(normNext3)) {
          const isW2ValidSurname = isValidSurnameToken(w2, norm2);
          const isW3ValidSurname = isValidSurnameToken(w3, norm3);

          if ((isW2GivenName && isW3ValidSurname) || (isW2ValidSurname && isW3ValidSurname)) {
            let score = isW2GivenName ? 205 : 195;
            if (lineIdx === 0) score += 70;
            else if (lineIdx < 5) score += 50;
            else if (lineIdx < 10) score += 30;

            const matchesEmail1 = emailTokens.some((t) => t.includes(norm1) || norm1.includes(t));
            const matchesEmail2 = emailTokens.some((t) => t.includes(norm2) || norm2.includes(t));
            const matchesEmailLast = emailTokens.some((t) => t.includes(norm3) || norm3.includes(t));
            const emailMatchCount = [matchesEmail1, matchesEmail2, matchesEmailLast].filter(Boolean).length;

            if (emailMatchCount >= 2) score += 200;
            else if (emailMatchCount === 1) score += 80;

            if (
              w1 === w1.toLocaleUpperCase('tr-TR') &&
              w2 === w2.toLocaleUpperCase('tr-TR') &&
              w3 === w3.toLocaleUpperCase('tr-TR')
            ) {
              score += 30;
            }

            const candidateName = `${w1} ${w2} ${w3}`;
            if (!isForbiddenNameCandidate(candidateName)) {
              candidates.push({ fullName: candidateName, score, lineIndex: lineIdx, wordIndex: i });
            }
          }
        }

        // 2. Check 2-word candidate: [GivenName, Surname]
        if (!isInstitutionalToken(normNext2) && isValidSurnameToken(w2, norm2)) {
          // If w2 is also a given name and w3 exists as a surname, give 2-word lower score than 3-word
          let score = isW2GivenName && w3 && isValidSurnameToken(w3, norm3) ? 140 : 160;

          if (lineIdx === 0) score += 70;
          else if (lineIdx < 5) score += 50;
          else if (lineIdx < 10) score += 30;

          // Email corroboration bonus:
          const matchesEmail1 = emailTokens.some((t) => t.includes(norm1) || norm1.includes(t));
          const matchesEmail2 = emailTokens.some((t) => t.includes(norm2) || norm2.includes(t));
          if (matchesEmail1 && matchesEmail2) score += 200;
          else if (matchesEmail1 || matchesEmail2) score += 80;

          // LinkedIn corroboration bonus:
          const matchesLi1 = linkedinTokens.some((t) => t.includes(norm1) || norm1.includes(t));
          const matchesLi2 = linkedinTokens.some((t) => t.includes(norm2) || norm2.includes(t));
          if (matchesLi1 && matchesLi2) score += 120;
          else if (matchesLi1 || matchesLi2) score += 60;

          // Uppercase or TitleCase bonus:
          if (w1 === w1.toLocaleUpperCase('tr-TR') && w2 === w2.toLocaleUpperCase('tr-TR')) score += 30;

            const candidateName = `${w1} ${w2}`;
            if (!isForbiddenNameCandidate(candidateName)) {
              candidates.push({ fullName: candidateName, score, lineIndex: lineIdx, wordIndex: i });
            }
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score || a.lineIndex - b.lineIndex || a.wordIndex - b.wordIndex);

  const best = candidates[0];
  if (best && best.score >= 140) {
    return formatTurkishTitleCase(best.fullName);
  }

  return null;
}

/**
 * Robust candidate full name extraction engine with Document Zoning & Multi-factor Scoring.
 *
 * Guaranteed to NEVER return section headings (e.g. "Kişisel Bilgiler", "İletişim", "Eğitim"),
 * contact info, company names, or invalid non-name lines.
 *
 * If no reliable name candidate is found, returns `null` so UI form state remains clean.
 */
export function extractCandidateName(
  rawText: string | null | undefined,
  fileName?: string | null,
): string | null {
  if (!rawText) return null;
  const text = normalizeCvText(rawText, true);
  if (!text) return null;

  // Tier 0: Explicit separate First Name + Last Name labels
  const firstNameMatch = text.match(
    /(?:^|\n)[ \t]*(?:[aA]d[ıiİI]?|first\s*name)[\s:]+([^\r\n,;:|0-9@]+)/iu,
  );
  const lastNameMatch = text.match(
    /(?:^|\n)[ \t]*(?:[sS]oyad[ıiİI]?|last\s*name|surname)[\s:]+([^\r\n,;:|0-9@]+)/iu,
  );
  if (firstNameMatch && lastNameMatch) {
    const fn = firstNameMatch[1].trim();
    const ln = lastNameMatch[1].trim();
    const combined = `${fn} ${ln}`;
    const scoreRes = scoreCandidateName(combined, {
      zone: 'CONTACT',
      isTopZone: true,
      lineIndex: 0,
      fullDocText: text,
      hasExplicitLabel: true,
    });
    if (scoreRes.isAccepted) {
      return formatTurkishTitleCase(scoreRes.value);
    }
  }

  // Tier 1: Explicit combined name label
  const nameLabelMatch = text.match(
    /(?:^|\n)[ \t]*(?:[iİıI]sim\s*[sS]oyisim|[iİıI]sim|[aA]d\s*[sS]oyad|[aA]d[ıiİI]\s*[sS]oyad[ıiİI]|[aA]d[ıiİI]n[ıiİI]z|full\s*name|candidate\s*name|candidate|aday)[\s:]+([^\r\n,;|]+)/iu,
  );
  if (nameLabelMatch) {
    const candidate = nameLabelMatch[1].trim();
    const scoreRes = scoreCandidateName(candidate, {
      zone: 'CONTACT',
      isTopZone: true,
      lineIndex: 0,
      fullDocText: text,
      hasExplicitLabel: true,
    });
    if (scoreRes.isAccepted) {
      return formatTurkishTitleCase(scoreRes.value);
    }
  }

  // Tier 1.5: Sliding Window Turkish Name Scanner (Robust against multi-column, unlabelled or embedded layouts)
  const slidingWindowResult = extractCandidateNameBySlidingWindow(text);
  if (slidingWindowResult) {
    return slidingWindowResult;
  }

  // Tier 1.8: Structural Identity Detection in Contact / Header / Personal Info Zones
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const emailUsername = emailMatch ? normalizeTrUniversal(emailMatch[1]) : '';
  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedinUsername = linkedinMatch ? normalizeTrUniversal(linkedinMatch[1]) : '';

  const docLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const structuralCandidates: Array<{ value: string; score: number }> = [];

  for (let i = 0; i < Math.min(docLines.length, 35); i++) {
    const rawLine = docLines[i];
    if (!rawLine || rawLine.length < 3 || rawLine.length > 50) continue;
    if (isForbiddenNameCandidate(rawLine)) continue;
    if (classifyCandidateSemantic(rawLine) !== 'PERSON_NAME') continue;

    // Clean line from prefixes/bullets
    const clean = rawLine
      .replace(/[\p{Extended_Pictographic}\uFE00-\uFE0F]/gu, ' ')
      .replace(/^[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:]+/, '')
      .replace(/[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:]+$/, '')
      .trim();

    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4) {
      const normWords = words.map((w) => normalizeTrUniversal(w));
      const hasGivenName = normWords.some(
        (w) => EXTENSIVE_TURKISH_MALE_NAMES.has(w) || EXTENSIVE_TURKISH_FEMALE_NAMES.has(w),
      );

      if (hasGivenName) {
        let structuralScore = 150;

        // Corroborate with email
        if (emailUsername) {
          const matchedEmailTokens = normWords.filter(
            (w) => w.length >= 3 && emailUsername.includes(w),
          );
          if (matchedEmailTokens.length >= 2) structuralScore += 100;
          else if (matchedEmailTokens.length === 1) structuralScore += 50;
        }

        // Corroborate with LinkedIn
        if (linkedinUsername) {
          const matchedLiTokens = normWords.filter(
            (w) => w.length >= 3 && linkedinUsername.includes(w),
          );
          if (matchedLiTokens.length >= 2) structuralScore += 80;
          else if (matchedLiTokens.length === 1) structuralScore += 40;
        }

        // Typography bonus
        if (clean === clean.toLocaleUpperCase('tr-TR')) structuralScore += 30;

        // Header proximity bonus
        if (i < 10) structuralScore += 20;

        const scoreRes = scoreCandidateName(clean, {
          zone: 'HEADER',
          isTopZone: true,
          lineIndex: i,
          fullDocText: text,
          nextLineText: docLines[i + 1],
        });

        if (scoreRes.isAccepted && scoreRes.totalScore > 0) {
          structuralCandidates.push({
            value: scoreRes.value,
            score: structuralScore + scoreRes.totalScore,
          });
        }
      }
    }
  }

  if (structuralCandidates.length > 0) {
    structuralCandidates.sort((a, b) => b.score - a.score);
    return formatTurkishTitleCase(structuralCandidates[0].value);
  }

  // Tier 2: Document Zoning - Scan Authorized Zones (HEADER, CONTACT)
  const zoning = segmentCvIntoDocumentZones(text);
  const candidatePool: Array<{ value: string; score: number; positive: string[]; negative: string[] }> = [];
  const seenCandidates = new Set<string>();

  const inspectZoneLines = (rawLines: string[], zoneType: CvZoneType) => {
    for (let lIdx = 0; lIdx < rawLines.length; lIdx++) {
      const rawLine = rawLines[lIdx];
      if (!rawLine || rawLine.length < 2) continue;

      let clean = rawLine
        .replace(/[\p{Extended_Pictographic}\uFE00-\uFE0F]/gu, ' ')
        .replace(/^[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:]+/, '')
        .replace(/[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:]+$/, '')
        .replace(/^(?:özgeçmiş|curriculum\s*vitae|resume|cv)\s*[-–—|:]\s*/i, '')
        .replace(/^(?:ad(?:ı)?\s*soyad(?:ı)?|isim\s*soyisim|isim|adınız\s*soyadınız|full\s*name|candidate\s*name|candidate|name|aday)\s*[:\-–—]\s*/i, '')
        .replace(
          /^(?:av\.?|avukat|dr\.?|doktor|prof\.?\s*dr\.?|doç\.?\s*dr\.?|müh\.?|mühendis|uzm\.?\s*dr\.?|şef|öğr\.?\s*gör\.?)\s+/i,
          '',
        )
        .trim();

      // Check sub-parts for pipe, dash, or slash separated lines
      const candidatesToTest = [clean];

      // If line is very long, extract candidate name from first 2-3 words
      if (clean.length > 40) {
        const cWords = clean.split(/\s+/).filter(Boolean);
        if (cWords.length >= 2) {
          const twoWord = `${cWords[0]} ${cWords[1]}`;
          if (!isForbiddenNameCandidate(twoWord)) {
            candidatesToTest.push(twoWord);
          }
          if (cWords.length >= 3) {
            const threeWord = `${cWords[0]} ${cWords[1]} ${cWords[2]}`;
            if (!isForbiddenNameCandidate(threeWord)) {
              candidatesToTest.push(threeWord);
            }
          }
        }
      }

      if (clean.includes('|') || clean.includes('—') || clean.includes(' - ')) {
        const parts = clean.split(/[|—]|\s+-\s+/).map((p) => p.trim()).filter(Boolean);
        candidatesToTest.push(...parts);
      }
      if (clean.includes('/') && !clean.includes('@') && !clean.includes('http')) {
        const parts = clean.split('/').map((p) => p.trim()).filter(Boolean);
        candidatesToTest.push(...parts);
      }

      for (const cand of candidatesToTest) {
        const normC = normalizeTrUniversal(cand);
        if (cand.length < 3 || cand.length > 40 || seenCandidates.has(normC)) continue;
        seenCandidates.add(normC);

        const scoreRes = scoreCandidateName(cand, {
          zone: zoneType,
          isTopZone: true,
          lineIndex: lIdx,
          fullDocText: text,
          nextLineText: rawLines[lIdx + 1],
        });

        if (scoreRes.isAccepted) {
          candidatePool.push({
            value: scoreRes.value,
            score: scoreRes.totalScore,
            positive: scoreRes.positiveEvidence,
            negative: scoreRes.negativeEvidence,
          });
        }
      }
    }
  };

  for (const zone of zoning.zones) {
    inspectZoneLines(zone.rawLines, zone.zoneType);
  }

  // If no candidates found from zoning, inspect top 30 lines
  if (candidatePool.length === 0) {
    const allLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    inspectZoneLines(allLines.slice(0, 30), 'HEADER');
  }

  // If candidates found, select highest score (must be >= 60)
  if (candidatePool.length > 0) {
    candidatePool.sort((a, b) => b.score - a.score);
    if (candidatePool[0].score >= 60) {
      return formatTurkishTitleCase(candidatePool[0].value);
    }
  }

  // Tier 3: Filename Fallback (e.g. "CV - UĞUR ZAMAN (4).pdf" -> "Uğur Zaman")
  if (fileName) {
    const fnName = extractCandidateNameFromFileName(fileName);
    if (fnName) return fnName;
  }

  // No reliable candidate found -> return null
  return null;
}

/**
 * Extracts candidate name from CV file name when text layer is graphic or unlabelled.
 * e.g. "CV - UĞUR ZAMAN (4).pdf" -> "Uğur Zaman"
 */
export function extractCandidateNameFromFileName(fileName: string | null | undefined): string | null {
  if (!fileName) return null;
  const clean = fileName
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .replace(/\b(?:cv|ozgecmis|resume|curriculum|vitae|yeni|guncel|final|taslak)\b/gi, ' ')
    .replace(/[\d()_.\-]+/g, ' ')
    .trim();

  const words = clean.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length >= 2 && words.length <= 4) {
    const normWords = words.map((w) => normalizeTrUniversal(w));
    const hasGiven = normWords.some(
      (w) => EXTENSIVE_TURKISH_MALE_NAMES.has(w) || EXTENSIVE_TURKISH_FEMALE_NAMES.has(w),
    );
    if (hasGiven && !isForbiddenNameCandidate(clean)) {
      return formatTurkishTitleCase(words.join(' '));
    }
  }
  return null;
}
