/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 11.0
 * CANDIDATE SCORING & POSITIVE / NEGATIVE EVIDENCE ENGINE
 * 
 * Implements a dual Positive Evidence vs Negative Evidence decision system
 * for every extracted entity (Name, Role, Sector, Location, Experience, Education).
 * 
 * CORE PRINCIPLE: ZERO FALSE POSITIVES.
 * An entity is accepted ONLY if positive evidence significantly outweighs negative evidence.
 * If evidence is ambiguous, the engine returns empty/undefined instead of hallucinating.
 */

import { normalizeCvText } from './cv-turkish-encoding';
import { normalizeTrUniversal } from './cv-universal-normalizer';
import { isForbiddenNameCandidate, FORBIDDEN_SECTION_WORD_ROOTS } from './cv-name-extractor';
import type { CvZoneType } from './cv-document-zoning';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { COMMON_TURKISH_DISTRICTS } from './cv-deterministic-extractor';

export function formatTurkishTitleCase(str: string): string {
  if (!str) return '';
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      let lower = word.toLocaleLowerCase('tr-TR');
      if (lower === 've' || lower === 'veya' || lower === 'ile' || lower === 'de' || lower === 'da') {
        return lower;
      }
      // Fix ASCII all-caps conversion for standard front-vowel Turkish stems (e.g. BILGIN -> Bilgin, DEMIR -> Demir)
      lower = lower
        .replace(/bılgın/g, 'bilgin')
        .replace(/sezgın/g, 'sezgin')
        .replace(/engın/g, 'engin')
        .replace(/tekın/g, 'tekin')
        .replace(/demır/g, 'demir')
        .replace(/çelık/g, 'çelik')
        .replace(/çetın/g, 'çetin')
        .replace(/ersın/g, 'ersin')
        .replace(/yetkın/g, 'yetkin')
        .replace(/metın/g, 'metin');

      return word.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
    })
    .join(' ');
}

export interface CandidateScoringResult<T = string> {
  value: T;
  totalScore: number;
  isAccepted: boolean;
  positiveEvidence: string[];
  negativeEvidence: string[];
  rejectionReason?: string;
  confidence: number;
}

const COMMON_JOB_TITLE_WORDS = new Set([
  'mudur', 'muduru', 'yonetici', 'yoneticisi', 'uzman', 'uzmani',
  'direktor', 'direktoru', 'muhendis', 'muhendisi', 'gelistirici',
  'analist', 'analisti', 'danisman', 'danismani', 'baskan', 'baskani',
  'lider', 'lideri', 'temsilci', 'temsilcisi', 'sorumlu', 'sorumlusu',
  'asistan', 'asistani', 'operator', 'operatoru', 'teknisyen', 'teknisyeni',
  'tekniker', 'teknikeri', 'stajyer', 'stajyeri', 'eleman', 'elemani',
  'koordinator', 'koordinatoru', 'memur', 'memuru', 'uzman yardimcisi',
  'denetci', 'denetcisi', 'auditor', 'muhasebeci', 'doktor', 'hemsire',
  'avukat', 'ogretmen', 'tasarimci', 'mimar', 'psikolog', 'cerrah',
  'developer', 'engineer', 'manager', 'director', 'lead', 'consultant',
  'analyst', 'specialist', 'officer', 'head', 'vp', 'ceo', 'cto', 'cfo', 'coo',
  'sef', 'sefi', 'kaptan', 'kaptani', 'zabit', 'zabiti', 'bolge muduru', 'genel mudur', 'genel muduru',
]);

const COMMON_ORG_WORDS = new Set([
  'holding', 'sirketi', 'anonim', 'limited', 'a.s.', 'as', 'ltd', 'sti',
  'bankasi', 'universitesi', 'fakultesi', 'enstitusu', 'belediyesi',
  'bakanligi', 'genel mudurlugu', 'mudurlugu', 'hastanesi', 'poliklinigi', 'poliklinik',
  'kulubu', 'dernegi', 'vakfi', 'odas', 'birligi', 'ajansi', 'merkezi',
  'univ', 'üniv', 'universite', 'lise', 'lisesi', 'kolej', 'koleji',
  'akademi', 'akademisi', 'okul', 'okulu', 'myo', 'fakulte', 'enstitu',
  'bolum', 'bolumu', 'program', 'programi', 'lisans', 'onlisans', 'doktora',
  'yuksekokul', 'yuksekokulu', 'meslek yuksekokulu', 'meslek yuksek okulu',
  'yatirim', 'yatirimi', 'menkul', 'degerler', 'sigorta', 'finans', 'lojistik', 'danismanlik',
  'pazarlama', 'sanayi', 'ticaret', 'grup', 'grubu',
]);

/**
 * Multi-factor Scoring for Candidate Full Name.
 */
export function scoreCandidateName(
  candidate: string,
  context: {
    zone: CvZoneType;
    isTopZone: boolean;
    lineIndex: number;
    fullDocText: string;
    hasExplicitLabel?: boolean;
    nextLineText?: string;
  },
): CandidateScoringResult<string> {
  const positive: string[] = [];
  const negative: string[] = [];
  let score = 0;

  if (!candidate || candidate.trim().length < 2) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['EMPTY_OR_WHITESPACE_STRING'],
      rejectionReason: 'EMPTY_STRING',
      confidence: 0,
    };
  }

  const clean = candidate
    .replace(/^[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:#\d\.\(\)\[\]\/]+/, '')
    .replace(/[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:#\.\(\)\[\]\/]+$/, '')
    .trim();

  const norm = normalizeTrUniversal(clean);
  const words = clean.split(/\s+/).filter(Boolean);
  const normWords = words.map((w) => normalizeTrUniversal(w));

  // --------------------------------------------------------------------------
  // 1. HARD NEGATIVE CHECKS (Disqualifying)
  // --------------------------------------------------------------------------
  const isAllAlphaWords = words.length >= 2 && words.length <= 4 && words.every((w) => /^[a-zA-ZçğıöşüÇĞİÖŞÜ]+$/.test(w));
  const isUpperCase = clean === clean.toLocaleUpperCase('tr-TR');
  const isTitleCase = words.every((w) => w.charAt(0) === w.charAt(0).toLocaleUpperCase('tr-TR'));

  // Check email username overlap in document (e.g. "zamanugurz@gmail.com" -> "Uğur Zaman")
  let hasEmailOverlap = false;
  const emailMatch = context.fullDocText.match(/\b([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch && emailMatch[1]) {
    const userPart = emailMatch[1].toLowerCase().replace(/[^a-z]/g, '');
    const nameCompact = norm.replace(/[^a-z]/g, '');
    if (
      userPart.includes(normWords[0]) ||
      (normWords[1] && userPart.includes(normWords[1])) ||
      nameCompact.includes(userPart.slice(0, 5))
    ) {
      hasEmailOverlap = true;
    }
  }

  // Next line context confirmation (e.g. followed by title, phone, email, or city)
  let hasNextContext = false;
  if (context.nextLineText) {
    const nextNorm = normalizeTrUniversal(context.nextLineText);
    hasNextContext =
      nextNorm.includes('@') ||
      /(?:\+?90|0?5\d{2})\s*\d{3}/.test(context.nextLineText) ||
      Array.from(COMMON_JOB_TITLE_WORDS).some((t) => nextNorm.includes(t)) ||
      TURKISH_CITIES.some((c) => nextNorm.includes(normalizeTrUniversal(c)));
  }

  const isMultiColumnHeaderCandidate = isAllAlphaWords && (isUpperCase || isTitleCase) && (hasEmailOverlap || hasNextContext);

  if (context.zone === 'REFERENCES') {
    if (!hasEmailOverlap) {
      negative.push('ZONE_IS_REFERENCES_SECTION');
    }
  } else if (context.zone === 'EDUCATION' || context.zone === 'EXPERIENCE' || context.zone === 'SKILLS' || context.zone === 'CERTIFICATIONS' || context.zone === 'PUBLICATIONS') {
    if (!isMultiColumnHeaderCandidate) {
      negative.push(`ZONE_IS_${context.zone}_SECTION`);
    }
  }

  if (isForbiddenNameCandidate(clean)) {
    negative.push('FORBIDDEN_SECTION_OR_ROLE_OR_CITY_HEADING');
  }

  if (/[0-9@_#\$\%\^&\*\<\>\=\+\{\}\[\]\\]/.test(clean)) {
    negative.push('CONTAINS_INVALID_SYMBOLS_OR_DIGITS');
  }

  // Check if document contains any minimum career or contact signals
  const normDocText = normalizeTrUniversal(context.fullDocText || '');
  const CAREER_INDICATORS = [
    'deneyim', 'egitim', 'profil', 'ozet', 'beceri', 'yetenek', 'tecrube',
    'universite', 'lise', 'fakulte', 'enstitu', 'myo', 'okul', 'akademi',
    'lisans', 'onlisans', 'doktora', 'ogretim', 'ogrenim', 'mezun',
    'sirket', 'holding', 'a.s', 'ltd', 'sti', 'grup', 'group', 'ajans',
    'uzman', 'mudur', 'muhendis', 'developer', 'gelistirici', 'yonetici',
    'analist', 'danisman', 'temsilci', 'asistan', 'sorumlu', 'koordinator',
    'operator', 'teknisyen', 'tekniker', 'stajyer', 'eleman', 'lider',
    'sef', 'baskan', 'direktor', 'hekim', 'doktor', 'avukat',
    'mimar', 'ogretmen', 'tasarimci', 'muhasebeci', 'denetci', 'auditor',
    'cagri', 'operasyon', 'satis', 'pazarlama', 'muhasebe', 'finans',
    'insan kaynaklari', 'yazilim', 'donanim', 'test', 'lead',
    'gorev', 'staj', 'pozisyon', 'kariyer', 'calisma', 'sektor',
    'diller', 'yabanci dil', 'sertifika', 'kurs', 'referans', 'proje',
    'experience', 'education', 'skills', 'summary', 'engineer', 'manager',
    'director', 'specialist', 'consultant', 'analyst', 'developer',
    'university', 'college', 'school', 'bachelor', 'master',
  ];

  const hasAnyCareerSignals =
    context.hasExplicitLabel ||
    context.fullDocText.includes('@') ||
    /(?:\+?90|0?5\d{2})\s*\d{3}/.test(context.fullDocText) ||
    /\b(?:it|qa|hr|ui|ux|ai|ml|work)\b/i.test(context.fullDocText) ||
    TURKISH_CITIES.some((c) => normDocText.includes(normalizeTrUniversal(c))) ||
    CAREER_INDICATORS.some((ind) => normDocText.includes(ind));

  if (!hasAnyCareerSignals) {
    negative.push('ZERO_CAREER_OR_CONTACT_SIGNALS_IN_DOCUMENT');
  }

  if (words.length > 5 || clean.length > 50) {
    negative.push('EXCEEDS_MAX_PERSON_NAME_LENGTH');
  }

  if (words.length === 1 && !context.hasExplicitLabel) {
    negative.push('SINGLE_WORD_WITHOUT_EXPLICIT_NAME_LABEL');
  }

  // Check if every word in candidate is an organizational/city/role keyword
  if (normWords.some((w) => COMMON_ORG_WORDS.has(w))) {
    negative.push('CONTAINS_ORGANIZATION_KEYWORD');
  }

  if (normWords.every((w) => COMMON_JOB_TITLE_WORDS.has(w))) {
    negative.push('ALL_WORDS_ARE_JOB_TITLE_KEYWORDS');
  }

  // --------------------------------------------------------------------------
  // 2. POSITIVE EVIDENCE CHECKS
  // --------------------------------------------------------------------------
  if (context.zone === 'HEADER') {
    positive.push('LOCATED_IN_HEADER_ZONE');
    score += 50;
  } else if (context.zone === 'CONTACT') {
    positive.push('LOCATED_IN_CONTACT_ZONE');
    score += 40;
  }

  if (context.hasExplicitLabel) {
    positive.push('EXPLICIT_NAME_LABEL_ANCHOR');
    score += 60;
  }

  if (context.lineIndex <= 2) {
    positive.push('TOP_DOCUMENT_LINES_POSITION');
    score += 40;
  }

  if (words.length >= 2 && words.length <= 4 && isAllAlphaWords) {
    positive.push('STANDARD_2_TO_4_WORD_PERSON_NAME_STRUCTURE');
    score += 35;
  }

  if (isUpperCase) {
    positive.push('ALL_UPPERCASE_HEADER_TYPOGRAPHY');
    score += 20;
  } else if (isTitleCase) {
    positive.push('TITLECASE_HEADER_TYPOGRAPHY');
    score += 20;
  }

  if (hasEmailOverlap) {
    positive.push('EMAIL_USERNAME_CORROBORATION');
    score += 35;
  }

  if (isMultiColumnHeaderCandidate) {
    positive.push('MULTI_COLUMN_MAIN_BODY_HEADER');
    score += 40;
  }

  // Next line context confirmation (e.g. followed by title, phone, email, or city)
  if (context.nextLineText) {
    const nextNorm = normalizeTrUniversal(context.nextLineText);
    const hasNextContext =
      nextNorm.includes('@') ||
      /(?:\+?90|0?5\d{2})\s*\d{3}/.test(context.nextLineText) ||
      Array.from(COMMON_JOB_TITLE_WORDS).some((t) => nextNorm.includes(t)) ||
      TURKISH_CITIES.some((c) => nextNorm.includes(normalizeTrUniversal(c)));

    if (hasNextContext) {
      positive.push('FOLLOWED_BY_PROFESSIONAL_OR_CONTACT_CONTEXT');
      score += 25;
    }
  }

  // --------------------------------------------------------------------------
  // 3. FINAL DECISION
  // --------------------------------------------------------------------------
  const isAccepted = negative.length === 0 && score >= 60;
  const confidence = isAccepted ? Math.min(1.0, score / 150) : 0;
  const formattedValue = isAccepted ? formatTurkishTitleCase(clean) : '';

  return {
    value: formattedValue,
    totalScore: negative.length > 0 ? -100 : score,
    isAccepted,
    positiveEvidence: positive,
    negativeEvidence: negative,
    rejectionReason: negative.length > 0 ? negative.join('; ') : (score < 60 ? 'INSUFFICIENT_POSITIVE_EVIDENCE' : undefined),
    confidence,
  };
}

/**
 * Multi-factor Scoring for Candidate Primary / Desired Role.
 */
export function scoreCandidateRole(
  roleCandidate: string,
  context: {
    zone: CvZoneType;
    hasEmploymentAnchor: boolean;
    isCurrentJob?: boolean;
  },
): CandidateScoringResult<string> {
  const positive: string[] = [];
  const negative: string[] = [];
  let score = 0;

  if (!roleCandidate || roleCandidate.trim().length < 2) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['EMPTY_ROLE_STRING'],
      rejectionReason: 'EMPTY_ROLE_STRING',
      confidence: 0,
    };
  }

  const clean = roleCandidate.trim();
  const norm = normalizeTrUniversal(clean);
  const words = clean.split(/\s+/).filter(Boolean);

  // Prohibited zones
  if (context.zone === 'SKILLS') {
    negative.push('ROLE_EXTRACTED_FROM_SKILLS_SECTION_PROHIBITED');
  }
  if (context.zone === 'EDUCATION') {
    negative.push('ROLE_EXTRACTED_FROM_EDUCATION_SECTION_PROHIBITED');
  }
  if (context.zone === 'CERTIFICATIONS') {
    negative.push('ROLE_EXTRACTED_FROM_CERTIFICATIONS_SECTION_PROHIBITED');
  }
  if (context.zone === 'REFERENCES') {
    negative.push('ROLE_EXTRACTED_FROM_REFERENCES_SECTION_PROHIBITED');
  }
  if (context.zone === 'PROJECTS') {
    negative.push('ROLE_EXTRACTED_FROM_PROJECTS_SECTION_PROHIBITED');
  }

  // Single-word generic modifiers without domain context
  const genericWords = new Set(['uzman', 'mudur', 'yonetici', 'direktor', 'analist', 'danisman', 'lider', 'asistan', 'eleman']);
  if (words.length === 1 && genericWords.has(norm)) {
    negative.push('STANDALONE_GENERIC_TITLE_WITHOUT_DOMAIN_SPECIFIER');
  }

  // Permitted zones positive scoring
  if (context.zone === 'HEADER') {
    positive.push('ROLE_IN_DOCUMENT_HEADER');
    score += 50;
  } else if (context.zone === 'SUMMARY') {
    positive.push('ROLE_IN_PROFESSIONAL_SUMMARY');
    score += 40;
  } else if (context.zone === 'EXPERIENCE') {
    positive.push('ROLE_IN_EXPERIENCE_SECTION');
    score += 50;
  }

  if (context.hasEmploymentAnchor) {
    positive.push('ANCHORED_WITH_EMPLOYER_OR_DATES');
    score += 40;
  }

  if (context.isCurrentJob) {
    positive.push('CURRENT_ACTIVE_EMPLOYMENT');
    score += 30;
  }

  const isAccepted = negative.length === 0 && score >= 50;
  const confidence = isAccepted ? Math.min(1.0, score / 140) : 0;

  return {
    value: isAccepted ? formatTurkishTitleCase(clean) : '',
    totalScore: negative.length > 0 ? -100 : score,
    isAccepted,
    positiveEvidence: positive,
    negativeEvidence: negative,
    rejectionReason: negative.length > 0 ? negative.join('; ') : (score < 50 ? 'INSUFFICIENT_ROLE_EVIDENCE' : undefined),
    confidence,
  };
}

/**
 * Multi-factor Scoring for Candidate Primary Sector.
 */
export function scoreCandidateSector(
  sectorCandidate: string,
  context: {
    zone: CvZoneType;
    hasExperienceMatch: boolean;
    matchedCompanyName?: string;
  },
): CandidateScoringResult<string> {
  const positive: string[] = [];
  const negative: string[] = [];
  let score = 0;

  if (!sectorCandidate || sectorCandidate.trim().length < 2) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['EMPTY_SECTOR_STRING'],
      rejectionReason: 'EMPTY_SECTOR_STRING',
      confidence: 0,
    };
  }

  // Prohibited zones
  if (context.zone === 'EDUCATION') {
    negative.push('SECTOR_DERIVED_FROM_ACADEMIC_DEGREE_PROHIBITED');
  }
  if (context.zone === 'SKILLS') {
    negative.push('SECTOR_DERIVED_FROM_SKILLS_PROHIBITED');
  }
  if (context.zone === 'LANGUAGES') {
    negative.push('SECTOR_DERIVED_FROM_LANGUAGES_PROHIBITED');
  }
  if (context.zone === 'CERTIFICATIONS') {
    negative.push('SECTOR_DERIVED_FROM_CERTIFICATIONS_PROHIBITED');
  }
  if (context.zone === 'REFERENCES') {
    negative.push('SECTOR_DERIVED_FROM_REFERENCES_PROHIBITED');
  }

  if (context.hasExperienceMatch) {
    positive.push(`DIRECT_EMPLOYMENT_MATCH_AT_${context.matchedCompanyName || 'EXPERIENCE'}`);
    score += 70;
  }

  if (context.zone === 'SUMMARY' || context.zone === 'EXPERIENCE') {
    positive.push('AUTHORIZED_SECTOR_ZONE');
    score += 30;
  }

  const isAccepted = negative.length === 0 && score >= 60;
  const confidence = isAccepted ? Math.min(1.0, score / 120) : 0;

  return {
    value: isAccepted ? sectorCandidate.trim() : '',
    totalScore: negative.length > 0 ? -100 : score,
    isAccepted,
    positiveEvidence: positive,
    negativeEvidence: negative,
    rejectionReason: negative.length > 0 ? negative.join('; ') : (score < 60 ? 'INSUFFICIENT_SECTOR_EVIDENCE' : undefined),
    confidence,
  };
}

export type SkillClassification =
  | 'EXPLICIT_SKILL'
  | 'TECHNICAL_SKILL'
  | 'TOOL'
  | 'CERTIFICATION'
  | 'LANGUAGE'
  | 'JOB_RESPONSIBILITY'
  | 'JOB_TITLE_FRAGMENT'
  | 'COMPANY_TERM'
  | 'INDUSTRY_TERM'
  | 'EDUCATION_TERM'
  | 'LOCATION_TERM'
  | 'GENERIC_WORD'
  | 'INFERRED_SKILL'
  | 'DUPLICATE'
  | 'NO_EVIDENCE';

export interface SkillScoringResult extends CandidateScoringResult<string> {
  classification: SkillClassification;
}

/**
 * Multi-factor Scoring and Classification for Candidate Skills.
 * Enforces Precision > Recall and eliminates full-document keyword dumps.
 */
export function scoreCandidateSkill(
  skillCandidate: string,
  context: {
    zone: CvZoneType;
    isExplicitSkillSection: boolean;
    rawLine?: string;
    fullDocText?: string;
  },
): SkillScoringResult {
  const positive: string[] = [];
  const negative: string[] = [];
  let score = 0;
  let classification: SkillClassification = 'NO_EVIDENCE';

  if (!skillCandidate || skillCandidate.trim().length < 2) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['EMPTY_SKILL_STRING'],
      rejectionReason: 'EMPTY_SKILL_STRING',
      confidence: 0,
      classification: 'NO_EVIDENCE',
    };
  }

  const clean = skillCandidate.trim();
  const norm = normalizeTrUniversal(clean);
  const words = clean.split(/\s+/).filter(Boolean);

  // 1. Check verbal noun / responsibility clauses FIRST (-yapılması, -takibi, long sentences)
  const isResponsibilitySentence =
    words.length >= 4 ||
    clean.length > 30 ||
    norm.endsWith('yapilmasi') ||
    norm.endsWith('saglanmasi') ||
    norm.endsWith('yurutulmesi') ||
    norm.endsWith('takibi') ||
    norm.endsWith('yonetimi ve') ||
    norm.endsWith('olusturulmasi') ||
    norm.endsWith('sunulmasi') ||
    norm.endsWith('edilmesi') ||
    norm.endsWith('alinmasi') ||
    norm.endsWith('gelistirilmesi') ||
    norm.endsWith('hazirlanmasi') ||
    norm.endsWith('uygulanmasi') ||
    norm.endsWith('belirlenmesi') ||
    norm.endsWith('incelenmesi') ||
    norm.endsWith('dogrulanmasi') ||
    norm.endsWith('koordinasyonu') ||
    norm.endsWith('gerceklestirilmesi');

  if (isResponsibilitySentence) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['RESPONSIBILITY_CLAUSE_AS_SKILL_PROHIBITED'],
      rejectionReason: 'RESPONSIBILITY_CLAUSE_AS_SKILL_PROHIBITED',
      confidence: 0,
      classification: 'JOB_RESPONSIBILITY',
    };
  }

  // 2. Prohibited zones
  if (context.zone === 'EDUCATION') {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['SKILL_EXTRACTED_FROM_EDUCATION_PROHIBITED'],
      rejectionReason: 'SKILL_EXTRACTED_FROM_EDUCATION_PROHIBITED',
      confidence: 0,
      classification: 'EDUCATION_TERM',
    };
  }
  if (context.zone === 'REFERENCES') {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['SKILL_EXTRACTED_FROM_REFERENCES_PROHIBITED'],
      rejectionReason: 'SKILL_EXTRACTED_FROM_REFERENCES_PROHIBITED',
      confidence: 0,
      classification: 'GENERIC_WORD',
    };
  }
  if (context.zone === 'CONTACT' || context.zone === 'HEADER') {
    if (TURKISH_CITIES.some((c) => normalizeTrUniversal(c) === norm) || COMMON_TURKISH_DISTRICTS[norm]) {
      return {
        value: '',
        totalScore: -100,
        isAccepted: false,
        positiveEvidence: [],
        negativeEvidence: ['LOCATION_WORD_AS_SKILL_PROHIBITED'],
        rejectionReason: 'LOCATION_WORD_AS_SKILL_PROHIBITED',
        confidence: 0,
        classification: 'LOCATION_TERM',
      };
    }
  }

  // 3. Check language match (including level indicators e.g. "İngilizce - İleri")
  const languageNames = new Set(['ingilizce', 'almanca', 'fransizca', 'ispanyolca', 'italyanca', 'rusca', 'arapca', 'cince', 'turkce', 'english', 'german', 'french', 'spanish', 'turkish']);
  const firstWordNorm = words[0] ? normalizeTrUniversal(words[0]) : '';
  if (languageNames.has(norm) || languageNames.has(firstWordNorm) || norm.startsWith('ingilizce') || norm.startsWith('almanca') || norm.startsWith('fransizca') || norm.startsWith('ispanyolca')) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['LANGUAGE_AS_SKILL_PROHIBITED'],
      rejectionReason: 'LANGUAGE_AS_SKILL_PROHIBITED',
      confidence: 0,
      classification: 'LANGUAGE',
    };
  }

  // 4. Check job title word match
  const isJobTitle =
    words.length <= 2 &&
    (COMMON_JOB_TITLE_WORDS.has(norm) || words.some((w) => COMMON_JOB_TITLE_WORDS.has(normalizeTrUniversal(w))));

  if (isJobTitle) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['STANDALONE_JOB_TITLE_AS_SKILL_PROHIBITED'],
      rejectionReason: 'STANDALONE_JOB_TITLE_AS_SKILL_PROHIBITED',
      confidence: 0,
      classification: 'JOB_TITLE_FRAGMENT',
    };
  }

  // 5. Check corporate entity & company brand names
  const KNOWN_CORP_BRANDS = new Set([
    'tusas', 'aselsan', 'roketsan', 'havelsan', 'trendyol', 'hepsiburada', 'getir',
    'defacto', 'lc waikiki', 'siemens', 'bosch', 'midpoint', 'big chefs', 'garanti',
    'akbank', 'is bankasi', 'yapi kredi', 'halkbank', 'vakifbank', 'qnb', 'finansbank',
    'denizbank', 'teknokent', 'holding', 'sirketi', 'banka', 'bankasi', 'restoran',
    'gida', 'magazacilik', 'havacilik', 'sanayi', 'ticaret', 'perakende'
  ]);
  const hasCorpWord =
    words.some((w) => COMMON_ORG_WORDS.has(normalizeTrUniversal(w)) || KNOWN_CORP_BRANDS.has(normalizeTrUniversal(w))) ||
    Array.from(KNOWN_CORP_BRANDS).some((b) => norm.includes(b));

  if (hasCorpWord) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['ORGANIZATION_OR_COMPANY_AS_SKILL_PROHIBITED'],
      rejectionReason: 'ORGANIZATION_OR_COMPANY_AS_SKILL_PROHIBITED',
      confidence: 0,
      classification: 'COMPANY_TERM',
    };
  }

  // Generic non-skill stop words
  const genericWords = new Set(['is', 'calisma', 'deneyim', 'bilgi', 'surec', 'alan', 'konu', 'tarih', 'yil', 'ay', 'gun', 'seviye', 'orta', 'ileri', 'baslangic', 'temel', 'derece']);
  if (genericWords.has(norm)) {
    return {
      value: '',
      totalScore: -100,
      isAccepted: false,
      positiveEvidence: [],
      negativeEvidence: ['GENERIC_STOP_WORD_AS_SKILL_PROHIBITED'],
      rejectionReason: 'GENERIC_STOP_WORD_AS_SKILL_PROHIBITED',
      confidence: 0,
      classification: 'GENERIC_WORD',
    };
  }

  // Positive Scoring
  if (context.zone === 'SKILLS' || context.isExplicitSkillSection) {
    positive.push('EXPLICIT_SKILL_SECTION_SOURCE');
    score += 80;
    classification = 'EXPLICIT_SKILL';
  } else if (context.zone === 'EXPERIENCE') {
    const isTech = /^(?:python|java|javascript|typescript|c\+\+|c#|react|angular|vue|node|docker|kubernetes|aws|azure|gcp|sql|postgresql|mongodb|redis|git|kafka|spark|airflow|ci\/cd|terraform|ansible|linux|figma|jira|sap|excel|tableau|power bi|graphql|rest|html|css|php|go|rust|swift|kotlin|flutter|dart|matlab|autocad|solidworks|catia|scada|plc)$/i.test(clean);
    if (isTech) {
      positive.push('VERIFIED_TECH_TOOL_IN_EXPERIENCE_BULLET');
      score += 70;
      classification = 'TOOL';
    } else {
      negative.push('UNGROUNDED_FREE_TEXT_SKILL_IN_EXPERIENCE_ZONE');
      classification = 'NO_EVIDENCE';
    }
  }

  const isAccepted = negative.length === 0 && score >= 60;
  const confidence = isAccepted ? Math.min(1.0, score / 100) : 0;

  return {
    value: isAccepted ? clean : '',
    totalScore: negative.length > 0 ? -100 : score,
    isAccepted,
    positiveEvidence: positive,
    negativeEvidence: negative,
    rejectionReason: negative.length > 0 ? negative.join('; ') : (score < 60 ? 'INSUFFICIENT_SKILL_EVIDENCE' : undefined),
    confidence,
    classification: isAccepted ? classification : (classification === 'NO_EVIDENCE' ? 'NO_EVIDENCE' : classification),
  };
}
