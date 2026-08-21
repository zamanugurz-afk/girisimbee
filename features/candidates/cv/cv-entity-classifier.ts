/**
 * Universal Entity Classifier (CV Extraction 4.0)
 * Multi-signal classification engine for entities (Company, Role, University,
 * Degree, Field, Skills, Languages, Responsibilities, Person Name, Location).
 */

import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';
import { EDUCATION_FIELD_OPTIONS } from '@/features/candidates/taxonomy/career-taxonomy';
import { UNIVERSAL_ROLE_ALIASES } from './cv-universal-dictionary';
import { normalizeTrUniversal, isCorporateEntity } from './cv-universal-normalizer';
import type { CandidateTokenType, CandidateToken } from './cv-unstructured-types';

export const COMPANY_LEGAL_SUFFIXES = [
  'a.ş.', 'a.s.', 'as', 'anonim şirketi', 'anonim sirketi',
  'ltd.', 'ltd. şti.', 'ltd. sti.', 'limited şirketi', 'limited sirketi',
  'holding', 'holdings', 'group', 'grup', 'grubu',
  'bank', 'bankası', 'bankasi', 'katılım bankası',
  'sigorta', 'emeklilik', 'reassürans',
  'sanayi', 'ticaret', 'san. ve tic.', 'san. tic.',
  'teknoloji', 'bilişim', 'yazılım', 'danışmanlık', 'lojistik', 'inşaat', 'enerji', 'otomotiv',
  'hukuk bürosu', 'avukatlık bürosu', 'ortaklığı',
  'gmbh', 'inc.', 'inc', 'llc', 'corp.', 'corp', 'co.', 'co', 'ltd', 'sa', 'nv',
];

const KNOWN_UNIVERSITIES = [
  'üniversitesi', 'universitesi', 'university', 'fakültesi', 'fakultesi',
  'enstitüsü', 'enstitusu', 'yüksekokulu', 'yuksekokulu', 'myo', 'koleji', 'lisesi', 'akademi',
];

const DEGREE_LEVEL_TERMS: Record<string, string> = {
  doktora: 'Doktora',
  phd: 'Doktora',
  doctorate: 'Doktora',
  'yuksek lisans': 'Yüksek Lisans',
  master: 'Yüksek Lisans',
  mba: 'Yüksek Lisans',
  msc: 'Yüksek Lisans',
  lisans: 'Lisans',
  bachelor: 'Lisans',
  bs: 'Lisans',
  ba: 'Lisans',
  'on lisans': 'Ön Lisans',
  onlisans: 'Ön Lisans',
  associate: 'Ön Lisans',
  myo: 'Ön Lisans',
  lise: 'Lise',
  'high school': 'Lise',
};

const SENIORITY_AND_ROLE_KEYWORDS = [
  'uzman', 'uzmanı', 'uzman yardımcısı', 'uzman yardimcisi',
  'müdür', 'müdürü', 'müdür yardımcısı', 'mudur', 'muduru',
  'direktör', 'direktörü', 'direktor', 'direktoru',
  'yönetici', 'yöneticisi', 'yonetici', 'yoneticisi',
  'danışman', 'danışmanı', 'danisman', 'danismani',
  'temsilci', 'temsilcisi',
  'geliştirici', 'gelistirici', 'developer',
  'mühendis', 'mühendisi', 'muhendis', 'muhendisi', 'engineer',
  'tekniker', 'teknisyeni',
  'stajyer', 'intern', 'asistan', 'asistanı', 'asistani',
  'koordinatör', 'koordinatörü', 'koordinator', 'koordinatoru',
  'şef', 'şefi', 'sef', 'sefi',
  'kıdemli', 'kidemli', 'senior', 'lead', 'baş', 'head',
  'lider', 'lideri', 'sorumlu', 'sorumlusu',
  'analist', 'analisti', 'analyst',
  'tasarımcı', 'tasarimci', 'designer',
  'doktor', 'hekim', 'hemşire', 'eczacı', 'avukat', 'mimar', 'öğretmen', 'egitmen',
];

const RESPONSIBILITY_ACTION_VERBS = [
  'yönetti', 'yonetti', 'geliştirdi', 'gelistirdi', 'tasarladı', 'tasarladi',
  'sağladı', 'sagladi', 'raporladı', 'raporladi', 'takip etti', 'yürüttü', 'yuruttu',
  'koordine etti', 'artırdı', 'artirdi', 'kurdu', 'denetledi', 'hazırladı', 'hazirladi',
  'organize etti', 'yönlendirdi', 'yonlendirdi', 'uyguladı', 'uyguladi', 'yönetimi',
  'sorumlusu', 'yürütülmesi', 'gerçekleştirdi', 'gerceklestirdi',
];

const LANGUAGE_LEVEL_MAP: Record<string, string> = {
  a1: 'A1 - Başlangıç',
  a2: 'A2 - Temel',
  b1: 'B1 - Orta',
  b2: 'B2 - İyi',
  c1: 'C1 - İleri',
  c2: 'C2 - Anadil / Yetkin',
  ileri: 'İleri',
  orta: 'Orta',
  temel: 'Temel',
  baslangic: 'Başlangıç',
  fluent: 'Akıcı',
  native: 'Anadil',
  advanced: 'İleri',
  intermediate: 'Orta',
  beginner: 'Başlangıç',
};

const KNOWN_LANGUAGES = [
  'ingilizce', 'english', 'almanca', 'german', 'deutsch', 'fransizca', 'french', 'francais',
  'ispanyolca', 'spanish', 'espanol', 'italyanca', 'italian', 'italiano', 'rusca', 'russian',
  'arapca', 'arabic', 'cince', 'chinese', 'japonca', 'japanese', 'turkce', 'turkish',
];

/**
 * Normalizes text for matching tokens.
 */
export function normalizeTrForEntity(text: string): string {
  return normalizeTrUniversal(text)
    .replace(/[^\w\s\.\/\-–—–@]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Multi-signal classification for a candidate string.
 */
export function classifyEntityToken(
  rawText: string,
  lineIndex: number,
  context?: { prevType?: CandidateTokenType; nextType?: CandidateTokenType },
): CandidateToken {
  const text = rawText.trim();
  const norm = normalizeTrForEntity(text);

  // 1. Check Noise
  if (
    /^(?:sayfa|page)\s*\d+(?:\s*(?:of|\/)\s*\d+)?$/i.test(norm) ||
    /^(?:cv|ozgecmis|curriculum\s*vitae)$/i.test(norm) ||
    /generated\s*by\s*(?:linkedin|kariyer|indeed|novoresume|canva|europass)/i.test(norm) ||
    /^(?:confidential|gizli|kisisel\s*belge|copyright|all\s*rights\s*reserved|tum\s*haklari\s*saklidir)/i.test(norm)
  ) {
    return { id: `tok_${lineIndex}`, type: 'NOISE', text, normalized: norm, lineIndex, confidence: 0.99 };
  }

  // 2. Email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    return { id: `tok_${lineIndex}`, type: 'EMAIL', text, normalized: norm, lineIndex, confidence: 0.99 };
  }

  // 3. Phone
  if (/(?:\+?90[\s.-]?)?(?:\(?0?5\d{2}\)?[\s.-]?)\d{3}[\s.-]?\d{2}[\s.-]?\d{2}|\b05\d{9}\b/.test(text)) {
    return { id: `tok_${lineIndex}`, type: 'PHONE', text, normalized: norm, lineIndex, confidence: 0.98 };
  }

  // 4. LinkedIn & URL
  if (/linkedin\.com\/(?:in|pub|profile)\/[a-zA-Z0-9_-]+/i.test(text)) {
    return { id: `tok_${lineIndex}`, type: 'LINKEDIN', text, normalized: norm, lineIndex, confidence: 0.99 };
  }
  if (/^https?:\/\/\S+/i.test(text) || /(?:github\.com|behance\.net|medium\.com)/i.test(text)) {
    return { id: `tok_${lineIndex}`, type: 'URL', text, normalized: norm, lineIndex, confidence: 0.95 };
  }

  // 5. University & Education Institution (Negative check for Company)
  const isUniversity = KNOWN_UNIVERSITIES.some((u) => norm.includes(u));
  if (isUniversity) {
    return { id: `tok_${lineIndex}`, type: 'UNIVERSITY', text, normalized: norm, lineIndex, confidence: 0.98 };
  }

  // 6. Degree Level
  for (const [degKey, degVal] of Object.entries(DEGREE_LEVEL_TERMS)) {
    if (norm === degKey || norm.startsWith(`${degKey} `) || norm.endsWith(` ${degKey}`)) {
      return {
        id: `tok_${lineIndex}`,
        type: 'DEGREE',
        text,
        normalized: norm,
        lineIndex,
        confidence: 0.96,
        metadata: { degreeLevel: degVal },
      };
    }
  }

  // 7. Field of Study
  for (const fieldOpt of EDUCATION_FIELD_OPTIONS) {
    if (fieldOpt === 'Diğer / Kendim gireceğim') continue;
    const fNorm = normalizeTrForEntity(fieldOpt);
    if (norm === fNorm || (norm.includes(fNorm) && norm.length <= fNorm.length + 15)) {
      return {
        id: `tok_${lineIndex}`,
        type: 'FIELD_OF_STUDY',
        text,
        normalized: norm,
        lineIndex,
        confidence: 0.94,
        metadata: { canonicalField: fieldOpt },
      };
    }
  }

  // 8. Language & Level: e.g. "İngilizce - C1", "English: Advanced", "Almanca (B2)"
  for (const lang of KNOWN_LANGUAGES) {
    if (norm.includes(lang)) {
      let matchedLevel: string | undefined;
      for (const [lvlKey, lvlVal] of Object.entries(LANGUAGE_LEVEL_MAP)) {
        if (norm.includes(lvlKey)) {
          matchedLevel = lvlVal;
          break;
        }
      }
      return {
        id: `tok_${lineIndex}`,
        type: 'LANGUAGE',
        text,
        normalized: norm,
        lineIndex,
        confidence: 0.97,
        metadata: { language: lang, level: matchedLevel },
      };
    }
  }

  // 9. Company (Strict Multi-Signal Evidence)
  const hasCompanySuffix = COMPANY_LEGAL_SUFFIXES.some((s) => {
    return norm.endsWith(` ${s}`) || norm.endsWith(s) || norm.includes(` ${s} `) || norm.includes(`${s},`);
  });
  const isCorporate = isCorporateEntity(text);
  if (hasCompanySuffix || isCorporate) {
    return { id: `tok_${lineIndex}`, type: 'COMPANY', text, normalized: norm, lineIndex, confidence: 0.97 };
  }

  // 10. Role Title (Multi-Signal Ontology & Aliases)
  if (UNIVERSAL_ROLE_ALIASES[norm]) {
    return {
      id: `tok_${lineIndex}`,
      type: 'ROLE',
      text,
      normalized: norm,
      lineIndex,
      confidence: 0.98,
      metadata: { canonicalRole: UNIVERSAL_ROLE_ALIASES[norm] },
    };
  }

  const hasRoleKeyword = SENIORITY_AND_ROLE_KEYWORDS.some((k) => {
    return norm === k || norm.startsWith(`${k} `) || norm.endsWith(` ${k}`) || norm.includes(` ${k} `);
  });

  const isRoleMorphology = /\b\w+(?:mühendisi|muhendisi|uzmanı|uzmani|geliştiricisi|gelistiricisi|yöneticisi|yoneticisi|müdürü|muduru|temsilcisi|danışmanı|danismani|şefi|sefi|koordinatörü|koordinatoru)\b/i.test(
    norm,
  );

  // Negative Guard: Words like "Mühendislik" or "Danışmanlık" alone in corporate context are not roles
  const isPureSectorWord = /^(?:muhendislik|mimarlik|danismanlik|sanayi|ticaret|teknoloji|lojistik|insaat|enerji|otomotiv)$/i.test(
    norm,
  );

  if ((hasRoleKeyword || isRoleMorphology) && !isPureSectorWord && text.length <= 60 && !text.includes('.')) {
    return { id: `tok_${lineIndex}`, type: 'ROLE', text, normalized: norm, lineIndex, confidence: 0.93 };
  }

  // 11. Location (City / District)
  for (const city of TURKISH_CITIES) {
    const cNorm = normalizeTrForEntity(city);
    if (norm === cNorm) {
      return {
        id: `tok_${lineIndex}`,
        type: 'CITY',
        text,
        normalized: norm,
        lineIndex,
        confidence: 0.98,
        metadata: { city },
      };
    }
  }

  // 12. Responsibility / Action Sentence
  const hasActionVerb = RESPONSIBILITY_ACTION_VERBS.some((v) => norm.includes(v));
  const isBulletItem = /^[\s•\-\*\>]\s+/.test(rawText) || (hasActionVerb && text.length > 25);
  if (isBulletItem || hasActionVerb) {
    return { id: `tok_${lineIndex}`, type: 'RESPONSIBILITY', text, normalized: norm, lineIndex, confidence: 0.92 };
  }

  // 13. Skill / Tool
  if (
    /^(?:python|react|javascript|typescript|java|c#|c\+\+|sql|docker|kubernetes|aws|azure|gcp|git|node\.js|vue|angular|spring|django|excel|sap|jira|figma|photoshop|power\s*bi|tableau)\b/i.test(
      norm,
    )
  ) {
    return { id: `tok_${lineIndex}`, type: 'SKILL', text, normalized: norm, lineIndex, confidence: 0.95 };
  }

  return { id: `tok_${lineIndex}`, type: 'UNKNOWN', text, normalized: norm, lineIndex, confidence: 0.5 };
}
