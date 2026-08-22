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

  for (const prefix of forbiddenPrefixes) {
    if (norm === prefix || norm.startsWith(prefix + ' ') || norm.startsWith(prefix + ':')) {
      return true;
    }
  }

  // 5. Suffix checks
  if (
    norm.endsWith(' bilgileri') ||
    norm.endsWith(' bilgilerim') ||
    norm.endsWith(' deneyimleri') ||
    norm.endsWith(' deneyimlerim') ||
    norm.endsWith(' sertifikalari') ||
    norm.endsWith(' yetenekleri') ||
    norm.endsWith(' alanlari')
  ) {
    return true;
  }

  // 6. Contact markers & invalid characters
  if (
    trimmed.includes('@') ||
    /https?:\/\/|www\.|\.com|\.net|\.org|\.edu|\.gov|\.dev|\.io/i.test(trimmed) ||
    /(?:\+90|0)?\s*\(?\d{3}\)?[\s.-]?\d{3}/.test(trimmed) ||
    /[0-9<>{}[\]_=+*#~^/\\;:]/.test(trimmed)
  ) {
    return true;
  }

  // 7. Corporate entities / institutional words & suffixes
  if (
    /\b(?:holding|sirketi|sirket|limited|anonim|a\.s|ltd|bankasi|banka|hastanesi|hastane|universitesi|universite|fakultesi|fakulte|enstitusu|enstitu|mudurlugu|mudurluk|bakanligi|bakanlik|belediyesi|belediye|sanayi|ticaret|vakfi|vakif|dernegi|dernek|federasyonu|ortakligi|ortaklik|burosu|buro|ajansi|ajans|ofisi|ofis|merkezi|merkez|klinigi|klinik|laboratuvari|hizmetleri|hizmet|atolyesi|grubu|grup|group|solutions|consulting|associates|law\s*firm|danismanlik|musavirlik|avukatlik)\b/i.test(
      norm,
    )
  ) {
    return true;
  }

  // 7.5 Job titles and occupational nouns must never be treated as names
  if (
    /\b(?:gelistirici|developer|engineer|muhendisi|muhendis|uzmani|uzman|muduru|mudur|yoneticisi|yonetici|temsilcisi|temsilci|danismani|danisman|direktoru|direktor|operatoru|operator|analisti|analist|teknisyeni|teknisyen|teknikeri|tekniker|stajyeri|stajyer|ogrencisi|ogrenci|sorumlusu|sorumlu|koordinatoru|koordinator|asistani|asistan|baskani|baskan|sef|sefi|lideri|lider|personeli|elemani|gorevlisi|gorevli)\b/i.test(
      norm,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Robust candidate full name extraction engine.
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
  // e.g. "Adı: Uğur" and "Soyadı: Zaman"
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
    if (!isForbiddenNameCandidate(combined)) {
      return formatTurkishTitleCase(combined);
    }
  }

  // Tier 1: Explicit combined name label
  // e.g. "İsim: Uğur Zaman", "Ad Soyad: Uğur Zaman", "Aday: Uğur Zaman"
  const nameLabelMatch = text.match(
    /(?:^|\n)[ \t]*(?:[iİıI]sim\s*[sS]oyisim|[iİıI]sim|[aA]d\s*[sS]oyad|[aA]d[ıiİI]\s*[sS]oyad[ıiİI]|[aA]d[ıiİI]n[ıiİI]z|full\s*name|candidate\s*name|candidate|aday)[\s:]+([^\r\n,;|]+)/iu,
  );
  if (nameLabelMatch) {
    const candidate = nameLabelMatch[1].trim();
    if (!isForbiddenNameCandidate(candidate)) {
      return formatTurkishTitleCase(candidate);
    }
  }

  // Tier 2: Inside "Kişisel Bilgiler" section block
  // e.g.:
  // KİŞİSEL BİLGİLER
  // Uğur Zaman
  // Telefon: ...
  const kisiselSectionMatch = text.match(
    /(?:[kK][iİıI][sS][iİıI][sS][eE]l\s*[bB][iİıI]lgiler(?:im)?|[öÖ]zel\s*[bB][iİıI]lgiler|personal\s*information)[\s:]*\n+([\s\S]{1,500})/iu,
  );
  if (kisiselSectionMatch) {
    const sectionBody = kisiselSectionMatch[1];
    const sectionLines = sectionBody
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    for (const rawLine of sectionLines.slice(0, 8)) {
      let cleanLine = rawLine
        .replace(/^[\s•*·\->–—👤📱📧🔗🏠]+/, '')
        .replace(/^(?:adı|ad|isim|isim\s*soyisim|ad\s*soyad)[\s:]+/i, '')
        .trim();

      if (cleanLine.includes('|') || cleanLine.includes('—') || cleanLine.includes(' - ')) {
        const parts = cleanLine.split(/[|—]|\s+-\s+/);
        if (parts[0] && parts[0].trim().split(/\s+/).length >= 2) {
          cleanLine = parts[0].trim();
        }
      }

      if (cleanLine.includes('/') && !cleanLine.includes('@') && !cleanLine.includes('http')) {
        const parts = cleanLine.split('/');
        if (parts[0] && parts[0].trim().split(/\s+/).length >= 2) {
          cleanLine = parts[0].trim();
        }
      }

      if (!isForbiddenNameCandidate(cleanLine)) {
        return formatTurkishTitleCase(cleanLine);
      }
    }
  }

  // Tier 3: Scan top lines of the document (first page header lines 0 to 20)
  const allLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const topLines = allLines.slice(0, 20);

  for (const rawLine of topLines) {
    let clean = rawLine
      .replace(/^[\s•*·\->–—👤📱📧🔗🏠]+/, '')
      .replace(/^(?:özgeçmiş|curriculum\s*vitae|resume|cv)\s*[-–—|:]\s*/i, '')
      .replace(
        /^(?:av\.?|avukat|dr\.?|doktor|prof\.?\s*dr\.?|doç\.?\s*dr\.?|müh\.?|mühendis|uzm\.?\s*dr\.?|şef|öğr\.?\s*gör\.?)\s+/i,
        '',
      )
      .trim();

    // If line contains pipe or dash with location / role, take the name portion before separator
    if (clean.includes('|') || clean.includes('—') || clean.includes(' - ')) {
      const parts = clean.split(/[|—]|\s+-\s+/);
      if (parts[0] && parts[0].trim().split(/\s+/).length >= 2) {
        clean = parts[0].trim();
      }
    }

    // If line contains "/" for location, check if left part is name
    if (clean.includes('/') && !clean.includes('@') && !clean.includes('http')) {
      const parts = clean.split('/');
      if (parts[0] && parts[0].trim().split(/\s+/).length >= 2) {
        clean = parts[0].trim();
      }
    }

    if (!isForbiddenNameCandidate(clean)) {
      return formatTurkishTitleCase(clean);
    }
  }

  // No reliable candidate found -> return null
  return null;
}
