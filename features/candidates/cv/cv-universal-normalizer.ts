/**
 * Girişimbee Universal CV Normalizer Engine
 * High-performance, robust, and zero-loss text normalization & semantic entity extraction.
 */

import {
  CORPORATE_DIRECTORATE_BLACKLIST_REGEX,
  UNIVERSAL_ROLE_ALIASES,
  UNIVERSAL_CERTIFICATE_ALIASES,
  TURKISH_PROVINCE_ABBREVIATIONS,
  EXTENSIVE_TURKISH_MALE_NAMES,
  EXTENSIVE_TURKISH_FEMALE_NAMES,
} from './cv-universal-dictionary';

export interface ParsedUniversalDateRange {
  startYear: number | null;
  endYear: number | null;
  isCurrent: boolean;
  duration?: string;
  raw: string;
}

export interface ParsedUniversalLocation {
  city: string;
  district?: string;
  detectedCities: string[];
}

export interface ParsedUniversalDemographics {
  gender?: 'Kadın' | 'Erkek';
  birthDate?: string;
  birthYear?: number;
}

// 1. Text Normalizer
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

// 2. Month Standardizer
export function standardizeMonthWords(text: string): string {
  let norm = text.toLowerCase().replace(/[–—]/g, '-');
  return norm
    .replace(/\b(?:a\s*ğ\s*u\s*s\s*t\s*o\s*s|a\s*g\s*u\s*s\s*t\s*o\s*s|ağu|agu|august|aug)\b/g, 'ağustos')
    .replace(/\b(?:e\s*y\s*l\s*ü\s*l|e\s*y\s*l\s*u\s*l|eyl|september|sep|sept)\b/g, 'eylül')
    .replace(/\b(?:k\s*a\s*s\s*ı\s*m|k\s*a\s*s\s*i\s*m|kas|november|nov)\b/g, 'kasım')
    .replace(/\b(?:a\s*r\s*a\s*l\s*ı\s*k|a\s*r\s*a\s*l\s*i\s*k|ara|december|dec)\b/g, 'aralık')
    .replace(/\b(?:ş\s*u\s*b\s*a\s*t|s\s*u\s*b\s*a\s*t|şub|sub|february|feb)\b/g, 'şubat')
    .replace(/\b(?:h\s*a\s*z\s*i\s*r\s*a\s*n|haz|june|jun)\b/g, 'haziran')
    .replace(/\b(?:t\s*e\s*m\s*m\s*u\s*z|tem|july|jul)\b/g, 'temmuz')
    .replace(/\b(?:m\s*a\s*y\s*ı\s*s|m\s*a\s*y\s*i\s*s|may|mayis)\b/g, 'mayıs')
    .replace(/\b(?:n\s*i\s*s\s*a\s*n|nis|april|apr)\b/g, 'nisan')
    .replace(/\b(?:o\s*c\s*a\s*k|oca|january|jan)\b/g, 'ocak')
    .replace(/\b(?:m\s*a\s*r\s*t|mar|march)\b/g, 'mart')
    .replace(/\b(?:e\s*k\s*i\s*m|eki|october|oct)\b/g, 'ekim');
}

// 3. Universal Date Range Parser
export function parseUniversalDateRange(line: string): ParsedUniversalDateRange | null {
  if (!line || line.length > 150) return null;
  const standardized = standardizeMonthWords(line);
  const norm = normalizeTrUniversal(standardized);

  const months = 'ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik';
  const activePattern = 'gunumuz|guncel|devam|present|current|halen|hala|calisiyorum|suruyor|now';

  // Pattern A: "Mar 2023 - Ağu 2025" or "15.03.2019 - 20.08.2023" or "03/2019 - 08/2023" or "2019 - 2023"
  const singleDatePattern = `(?:(?:\\d{1,2}[.\\s/]+){1,2}|(?:${months})[.\\s/]+)?(19\\d{2}|20\\d{2})`;
  const endPattern = `(?:(?:(?:\\d{1,2}[.\\s/]+){1,2}|(?:${months})[.\\s/]+)?(19\\d{2}|20\\d{2})|(${activePattern}))`;
  const rangeRegex = new RegExp(`(${singleDatePattern})\\s*(?:-|to|ila|ile|/)\\s*(${endPattern})`, 'i');
  const match = norm.match(rangeRegex);

  if (match) {
    const startYearMatch = match[1].match(/\b(19\d{2}|20\d{2})\b/);
    const startYear = startYearMatch ? parseInt(startYearMatch[1], 10) : null;
    const endStr = match[3] || match[2] || '';
    const isCurrent = new RegExp(activePattern, 'i').test(endStr);
    const endYearMatch = endStr.match(/\b(19\d{2}|20\d{2})\b/);
    const endYear = isCurrent ? new Date().getFullYear() : (endYearMatch ? parseInt(endYearMatch[1], 10) : null);

    const durationMatch = line.match(/\(([^)]*(?:yıl|yil|ay|sene|year|month)[^)]*)\)/i);
    const duration = durationMatch ? durationMatch[1].trim() : undefined;

    return {
      startYear: Number.isFinite(startYear) ? startYear : null,
      endYear: Number.isFinite(endYear) ? endYear : null,
      isCurrent,
      duration,
      raw: match[0],
    };
  }

  // Pattern B: "2019 - Halen" / "2020 - Devam"
  const singleYearCurrent = norm.match(new RegExp(`\\b(19\\d{2}|20\\d{2})\\s*-\\s*(${activePattern})\\b`, 'i'));
  if (singleYearCurrent) {
    return {
      startYear: parseInt(singleYearCurrent[1], 10),
      endYear: new Date().getFullYear(),
      isCurrent: true,
      raw: singleYearCurrent[0],
    };
  }

  // Pattern C: Standalone Active Keyword on line
  const singleActive = norm.match(new RegExp(`\\b(${activePattern})\\b`, 'i'));
  if (singleActive && norm.length < 30) {
    const yr = new Date().getFullYear();
    return {
      startYear: yr,
      endYear: yr,
      isCurrent: true,
      raw: singleActive[0],
    };
  }

  // Pattern D: 4-digit standalone year (e.g. "(2024)" or "2022")
  const singleYear = norm.match(/(?:^|\s|\()((?:19[7-9]\d|20[0-4]\d))(?:\s|\)|$)/);
  if (singleYear) {
    const yr = parseInt(singleYear[1], 10);
    return {
      startYear: yr,
      endYear: yr,
      isCurrent: false,
      raw: singleYear[1],
    };
  }

  return null;
}

// 4. Universal Pure Date Line Detector
export function isUniversalPureDateLine(line: string): boolean {
  if (!line) return false;
  const standardized = standardizeMonthWords(line);
  const norm = normalizeTrUniversal(standardized);
  if (!norm) return false;
  const cleaned = norm.replace(/[()[\]{}.,:;\-–—/|\\]/g, ' ');
  const words = cleaned.split(/\s+/).filter(Boolean);
  const monthsAndTerms = [
    'ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran',
    'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik',
    'yil', 'ay', 'gunumuz', 'guncel', 'devam', 'present', 'current', 'halen', 'hala',
    'calisiyorum', 'suruyor', 'to', 'ila', 'ile', 'year', 'years', 'month', 'months',
    'duration', 'sure', 'tarih', 'period', 'date'
  ];
  return words.length > 0 && words.every((w) => monthsAndTerms.includes(w) || /^\d+$/.test(w));
}

// 5. Universal Demographics & Gender Resolver
export function extractUniversalDemographics(text: string): ParsedUniversalDemographics {
  const normText = normalizeTrUniversal(text);
  let gender: 'Kadın' | 'Erkek' | undefined;
  let birthDate: string | undefined;
  let birthYear: number | undefined;

  // 1. Explicit Gender Label
  if (
    /(?:^|\s)cinsiyet\b[\s:]*(?:kadin|bayan)\b/i.test(normText) ||
    /(?:^|\n)\s*cinsiyet\s*\n\s*(?:kadin|bayan)/i.test(normText) ||
    /(?:^|\s)cinsiyeti\b[\s:]*(?:kadin|bayan)\b/i.test(normText) ||
    (/ozel\s*bilgiler/i.test(normText) && /\bkadin\b/i.test(normText) && !/\berkek\b/i.test(normText))
  ) {
    gender = 'Kadın';
  } else if (
    /(?:^|\s)cinsiyet\b[\s:]*(?:erkek|bay)\b/i.test(normText) ||
    /(?:^|\n)\s*cinsiyet\s*\n\s*(?:erkek|bay)/i.test(normText) ||
    /(?:^|\s)cinsiyeti\b[\s:]*(?:erkek|bay)\b/i.test(normText) ||
    (/ozel\s*bilgiler/i.test(normText) && /\berkek\b/i.test(normText) && !/\bkadin\b/i.test(normText))
  ) {
    gender = 'Erkek';
  }

  // 1.5. First-Name Lookup from Top Lines (Header / Contact Section)
  if (!gender) {
    const lines = text.split(/\r?\n/).slice(0, 15);
    for (const l of lines) {
      const words = normalizeTrUniversal(l).split(/[\s,.:/|–—]+/).filter((w) => w.length >= 3);
      for (const w of words) {
        if (EXTENSIVE_TURKISH_MALE_NAMES.has(w)) {
          gender = 'Erkek';
          break;
        } else if (EXTENSIVE_TURKISH_FEMALE_NAMES.has(w)) {
          gender = 'Kadın';
          break;
        }
      }
      if (gender) break;
    }
  }

  // 2. Birth Date Detection across all formats
  // Pattern A: "1993 (32 Yaş)" or "1996 doğumlu"
  const ageMatch = text.match(/\b(19\d{2}|20\d{2})\s*(?:\(\s*\d{1,2}\s*(?:yaş|yas|yaşında|yasinda)?\s*\)|doğumlu|dogumlu)/i);
  if (ageMatch) {
    birthYear = parseInt(ageMatch[1], 10);
    birthDate = `${birthYear}-01-01`;
  }

  // Pattern B: "Doğum Tarihi: 13-06-1996" or "15.05.1993" or "1996"
  if (!birthDate) {
    const dobMatch = text.match(/(?:doğum\s*tarihi|dogum\s*tarihi|d\.tarihi|birth\s*date|dob|d\.tarih)[\s:]*([0-3]?\d[./\-][0-1]?\d[./\-](?:19\d{2}|20\d{2})|(?:19\d{2}|20\d{2}))/i);
    if (dobMatch) {
      const rawDate = dobMatch[1];
      if (/^\d{4}$/.test(rawDate)) {
        birthYear = parseInt(rawDate, 10);
        birthDate = `${birthYear}-01-01`;
      } else {
        const parts = rawDate.split(/[./\-]/);
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          birthYear = parseInt(year, 10);
          birthDate = `${year}-${month}-${day}`;
        }
      }
    }
  }

  // Pattern C: Full Turkish Month birth dates (e.g. "26 Şubat 1997", "15 Mart 1995")
  if (!birthDate) {
    const monthDobMatch = text.match(/\b([0-3]?\d)\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)\s+(19\d{2}|20\d{2})\b/i);
    if (monthDobMatch) {
      const day = monthDobMatch[1].padStart(2, '0');
      const mName = normalizeTrUniversal(monthDobMatch[2]);
      const monthMap: Record<string, string> = {
        ocak: '01', subat: '02', mart: '03', nisan: '04', mayis: '05', haziran: '06',
        temmuz: '07', agustos: '08', eylul: '09', ekim: '10', kasim: '11', aralik: '12',
      };
      const month = monthMap[mName] || '01';
      const year = monthDobMatch[3];
      birthYear = parseInt(year, 10);
      birthDate = `${year}-${month}-${day}`;
    }
  }

  return { gender, birthDate, birthYear };
}

// 6. Universal Certificate Scanner
export function scanUniversalCertificates(text: string): string[] {
  const normText = ` ${normalizeTrUniversal(text)} `;
  const found: string[] = [];

  for (const [certKey, canonicalCert] of Object.entries(UNIVERSAL_CERTIFICATE_ALIASES)) {
    const normKey = normalizeTrUniversal(certKey);
    const regex = new RegExp(`(?:^|[^a-z0-9])${normKey}(?:$|[^a-z0-9])`, 'i');
    if (regex.test(normText)) {
      if (!found.includes(canonicalCert)) {
        found.push(canonicalCert);
      }
    }
  }

  return found;
}

// 7. Universal Corporate Entity Checker
export function isCorporateEntity(line: string): boolean {
  if (!line) return false;
  const norm = normalizeTrUniversal(line);

  const hasPersonTitle = /\b(?:mudur|muduru|direktor|direktoru|yonetici|yoneticisi|uzman|uzmani|temsilci|temsilcisi|lider|lideri|amir|amiri|sorumlu|sorumlusu|yetkili|yetkilisi|danisman|danismani|muhendis|muhendisi|gelistirici|asistan|asistani|operator|operatoru|teknisyen|tekniker|doktor|hekim|hemsire|avukat|ogretmen|mimar|asci|kasiyer|sofor|surucu|kurye|baskan|sef|sefi)\b/i.test(norm);

  const isPureEntitySuffix = /\b(?:genel\s*mudurluk|genel\s*mudurlugu|bolge\s*mudurluk|bolge\s*mudurlugu|sube\s*mudurluk|sube\s*mudurlugu|mudurlugu|mudurluk|bakanlik|bakanligi|baskanlik|baskanligi|komutanlik|komutanligi|rektorluk|rektorlugu|dekanlik|dekanligi|enstitusu|enstitu|mustesarlik|belediyesi|belediye|valiligi|valilik|kaymakamligi|kaymakamlik|universitesi|universite|fakultesi|fakulte|yuksekokulu|holding|a\s*\.?\s*s\s*\.?|ltd\s*\.?\s*sti\s*\.?|sirketi|vakfi|vakif|dernegi|dernek|kulubu|platformu|poliklinigi|laboratuvari|ajansi|fabrikasi|tesisleri|santrali)\b/i.test(norm);

  if (isPureEntitySuffix) {
    return true;
  }

  if (hasPersonTitle) {
    return false;
  }

  return CORPORATE_DIRECTORATE_BLACKLIST_REGEX.test(norm);
}

// 8. Universal Education Degree Parser
export function parseUniversalEducationLevel(text: string): 'Doktora' | 'Yüksek Lisans' | 'Lisans' | 'Ön Lisans' | 'Lise' | 'İlköğretim' | null {
  const norm = normalizeTrUniversal(text);
  if (/\b(?:doktora|ph\.?d|phd|dr\b|sanatta\s*yeterlik)\b/i.test(norm)) return 'Doktora';
  if (/\b(?:y[uü]ksek\s*lisans|master|m\.?sc|m\.?a|mba|tezli\s*y[uü]ksek|tezsiz\s*y[uü]ksek|postgraduate)\b/i.test(norm)) return 'Yüksek Lisans';
  if (/\b(?:lisans|bachelor|b\.?sc|b\.?a|fak[uü]lte|m[uü]hendisli[gğ]i|i[sş]letme|iktisat)\b/i.test(norm) && !norm.includes('on lisans') && !norm.includes('ön lisans')) return 'Lisans';
  if (/\b(?:[oö]n\s*lisans|myo|meslek\s*y[uü]ksek\s*okulu|associate\s*degree)\b/i.test(norm)) return 'Ön Lisans';
  if (/\b(?:lise|anadolu\s*lisesi|fen\s*lisesi|meslek\s*lisesi|teknik\s*lise|imam\s*hatip|high\s*school)\b/i.test(norm)) return 'Lise';
  return null;
}

// 9. Universal Driver License Parser
export function parseUniversalDriverLicense(text: string): string[] {
  const norm = normalizeTrUniversal(text);
  const found: string[] = [];
  const licenseMatch = norm.match(/(?:ehliyet|surucu\s*belgesi|surucu\s*ehliyeti|driver\s*licen[sc]e)[\s:]*([a-z0-9,\s\-+/]+)/i);
  if (licenseMatch) {
    const rawClasses = licenseMatch[1].toUpperCase();
    const classes = ['A1', 'A2', 'A', 'B1', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'F', 'G', 'M'];
    for (const c of classes) {
      if (new RegExp(`(?:^|[^A-Z0-9])${c}(?:$|[^A-Z0-9])`, 'i').test(rawClasses)) {
        found.push(c);
      }
    }
  }
  return found;
}
