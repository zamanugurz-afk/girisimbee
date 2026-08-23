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

  // 7.9 Section header root stems and fractured/OCR-split section headings (e.g. "Kış İselbilgiler", "iselbilgiler", "kisisel bilgiler")
  if (
    /\b(?:kisisel|iletisim|ozgecmis|deneyim|deneyimleri|tecrube|tecrubeleri|egitim|egitimleri|ogrenim|yetenek|yetenekleri|beceri|becerileri|sertifika|sertifikalari|referans|referanslar|referanslari|profesyonel|kariyer|hakkimda|yayinlar|projeler)\b|(?:\b\w*bilgi(?:ler|leri|si|m|lerim)\b)|\b(?:kis\s+isel\w*)\b|\b(?:kisi\s+sel\w*)\b/i.test(
      norm,
    )
  ) {
    return true;
  }

  return false;
}

import { segmentCvIntoDocumentZones, type CvZoneType } from './cv-document-zoning';
import { scoreCandidateName } from './cv-candidate-scorer';

/**
 * Robust candidate full name extraction engine with Document Zoning & Multi-factor Scoring.
 *
 * Guaranteed to NEVER return section headings (e.g. "Kişisel Bilgiler", "İletişim", "Eğitim"),
 * contact info, company names, or invalid non-name lines.
 *
 * If no reliable name candidate is found, returns `null` so UI form state remains clean.
 */
export function extractCandidateName(rawText: string | null | undefined): string | null {
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

  // Tier 2: Document Zoning - Scan Authorized Zones (HEADER, CONTACT)
  const zoning = segmentCvIntoDocumentZones(text);
  const candidatePool: Array<{ value: string; score: number }> = [];

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
      if (clean.length > 50) {
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
        if (cand.length < 3 || cand.length > 50) continue;
        const scoreRes = scoreCandidateName(cand, {
          zone: zoneType,
          isTopZone: true,
          lineIndex: lIdx,
          fullDocText: text,
          nextLineText: rawLines[lIdx + 1],
        });

        if (scoreRes.isAccepted) {
          candidatePool.push({ value: scoreRes.value, score: scoreRes.totalScore });
        }
      }
    }
  };

  for (const zone of zoning.zones) {
    if (zone.zoneType !== 'REFERENCES') {
      inspectZoneLines(zone.rawLines, zone.zoneType);
    }
  }

  // Also inspect top 50 lines for multi-column / unrolled headers
  const allLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  inspectZoneLines(allLines.slice(0, 50), 'HEADER');

  // If candidates found, select highest score (must be >= 60)
  if (candidatePool.length > 0) {
    candidatePool.sort((a, b) => b.score - a.score);
    if (candidatePool[0].score >= 60) {
      return formatTurkishTitleCase(candidatePool[0].value);
    }
  }

  // No reliable candidate found -> return null
  return null;
}
