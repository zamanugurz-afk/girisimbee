/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 11.0
 * DOCUMENT ZONING & SECTION-FIRST SEGMENTATION SYSTEM
 * 
 * Provides deterministic 2D and line-based document zoning into 14 distinct
 * semantic regions. Resolvers are strictly authorized to extract data ONLY
 * from their designated zones.
 * 
 * ZONE PERMISSIONS:
 * - NameResolver:        HEADER, CONTACT
 * - RoleResolver:        HEADER, SUMMARY, EXPERIENCE
 * - SectorResolver:      SUMMARY, EXPERIENCE
 * - ExperienceResolver:  EXPERIENCE
 * - EducationResolver:   EDUCATION
 * - SkillResolver:       SKILLS (and strictly controlled EXPERIENCE bullets)
 * - LanguageResolver:    LANGUAGES, CERTIFICATIONS
 * - ReferenceResolver:   REFERENCES
 * - LocationResolver:    CONTACT, HEADER (residence only)
 */

import { normalizeCvText } from './cv-turkish-encoding';
import { normalizeTrUniversal } from './cv-universal-normalizer';
import { EXTENSIVE_TURKISH_MALE_NAMES, EXTENSIVE_TURKISH_FEMALE_NAMES } from './cv-universal-dictionary';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import type { CvDocumentModel } from './cv-document-model';

export type CvZoneType =
  | 'HEADER'
  | 'CONTACT'
  | 'SUMMARY'
  | 'EXPERIENCE'
  | 'EDUCATION'
  | 'SKILLS'
  | 'LANGUAGES'
  | 'CERTIFICATIONS'
  | 'REFERENCES'
  | 'PROJECTS'
  | 'PUBLICATIONS'
  | 'VOLUNTEER'
  | 'INTERESTS'
  | 'OTHER';

export interface CvDocumentZone {
  zoneType: CvZoneType;
  rawLines: string[];
  text: string;
  startLine: number;
  endLine: number;
  headingText?: string;
  confidence: number;
  isExplicitHeading: boolean;
}

export interface CvDocumentZoningResult {
  zones: CvDocumentZone[];
  zoneMap: Map<CvZoneType, CvDocumentZone[]>;
  headerZone?: CvDocumentZone;
  contactZone?: CvDocumentZone;
  summaryZone?: CvDocumentZone;
  experienceZone?: CvDocumentZone;
  educationZone?: CvDocumentZone;
  skillsZone?: CvDocumentZone;
  languagesZone?: CvDocumentZone;
  certificationsZone?: CvDocumentZone;
  referencesZone?: CvDocumentZone;
  projectsZone?: CvDocumentZone;
  publicationsZone?: CvDocumentZone;
  volunteerZone?: CvDocumentZone;
  interestsZone?: CvDocumentZone;
}

// Multilingual Section Heading Root Dictionaries (TR, EN, DE, FR, ES)
const HEADING_RULES: Array<{
  zoneType: CvZoneType;
  patterns: RegExp[];
}> = [
  {
    zoneType: 'CONTACT',
    patterns: [
      /^(?:ozgecmis|curriculum\s*vitae|resume|cv|kisisel\s*bilgiler(?:im)?|kisisel\s*veriler|kisisel\s*detaylar|iletisim\s*bilgileri|iletisim|contact\s*information|contact\s*details|contact|kontaktdaten|kontakt|coordonnees|contactos|datos\s*personales)$/i,
    ],
  },
  {
    zoneType: 'SUMMARY',
    patterns: [
      /^(?:profil(?:im)?|profesyonel\s*ozet|ozet|hakkimda|kariyer\s*hedefi|hedef|onyazi|on\s*yazi|professional\s*summary|summary|profile|about\s*me|career\s*objective|objective|executive\s*summary|kurzprofil|uber\s*mich|profil\s*professionnel|a\s*propos|perfil\s*profesional|sobre\s*mi|resumen)$/i,
    ],
  },
  {
    zoneType: 'EXPERIENCE',
    patterns: [
      /^(?:is\s*deneyimi|is\s*deneyimleri|is\s*tecrubesi|is\s*tecrubeleri|deneyimler(?:im)?|deneyim|mesleki\s*deneyim|mesleki\s*gecmis|kariyer\s*gecmisi|calisma\s*hayati|istihdam\s*gecmisi|staj\s*ve\s*deneyim|stajlar|staj|profesyonel\s*deneyim|work\s*experience|employment\s*history|career\s*history|work\s*history|professional\s*experience|positions\s*held|practical\s*experience|internships|internship|berufserfahrung|beruflicher\s*werdegang|arbeitserfahrung|praxiserfahrung|experience\s*professionnelle|experiences\s*professionnelles|parcours\s*professionnel|esperienza\s*lavorativa|esperienze\s*lavorative|experiencia\s*laboral|experiencia\s*profesional|trayectoria\s*profesional)$/i,
    ],
  },
  {
    zoneType: 'EDUCATION',
    patterns: [
      /^(?:egitim|egitim\s*bilgileri|egitim\s*gecmisi|egitim\s*durumu|ogrenim|ogrenim\s*bilgileri|ogrenim\s*durumu|akademik\s*egitim|akademik\s*gecmis|akademik\s*bilgiler|egitim\s*ve\s*ogrenim|egitim\s*ve\s*ogretim|egitim\s*ve\s*nitelikler|education|educational\s*background|academic\s*background|academic\s*history|academic\s*qualifications|degrees|studies|academic\s*profile|education\s*training|education\s*and\s*training|ausbildung|bildungsweg|studium|schulbildung|berufsausbildung|formation|formations|etudes|diplomes|formation\s*academique|istruzione|istruzione\s*e\s*formazione|formazione|titoli\s*di\s*studio|educacion|formacion|formacion\s*academica|estudios)$/i,
    ],
  },
  {
    zoneType: 'SKILLS',
    patterns: [
      /^(?:yetkinlikler(?:im)?|yetkinlik|yetenekler(?:im)?|yetenek|beceriler(?:im)?|beceri|uzmanlik\s*alanlari|uzmanlik|teknik\s*beceriler|teknik\s*yetkinlikler|mesleki\s*yetkinlikler|kisisel\s*yetkinlikler|kisisel\s*beceriler|bilgisayar\s*becerileri|araclar|teknolojiler|araclar\s*ve\s*teknolojiler|yazilim\s*becerileri|programlama\s*dilleri|skills|key\s*skills|core\s*competencies|competencies|technical\s*skills|technical\s*proficiencies|areas\s*of\s*expertise|tools\s*technologies|tools|technologies|abilities|proficiencies|expertise|soft\s*skills|hard\s*skills|kenntnisse|fahigkeiten|competences|competencias|habilidades)$/i,
    ],
  },
  {
    zoneType: 'LANGUAGES',
    patterns: [
      /^(?:yabanci\s*diller|diller|dil\s*bilgisi|bilinen\s*diller|languages|foreign\s*languages|language\s*skills|sprachen|sprachenkenntnisse|langues|idiomas)$/i,
    ],
  },
  {
    zoneType: 'CERTIFICATIONS',
    patterns: [
      /^(?:sertifikalar(?:im)?|sertifika|kurslar|kurs\s*ve\s*sertifikalar|egitim\s*ve\s*sertifikalar|seminerler|seminer\s*ve\s*kurslar|belgeler|lisanslar\s*ve\s*sertifikalar|certifications|certificates|licenses\s*and\s*certifications|courses|training\s*and\s*certifications|zertifikate|bescheinigungen|kurse|formations\s*et\s*certifications|certificaciones|cursos)$/i,
    ],
  },
  {
    zoneType: 'REFERENCES',
    patterns: [
      /^(?:referanslar(?:im)?|referans|references|referees|professional\s*references|referenzen|references\s*professionnelles|referencias)$/i,
    ],
  },
  {
    zoneType: 'PROJECTS',
    patterns: [
      /^(?:projeler(?:im)?|proje\s*gecmisi|portfolyo|projects|key\s*projects|portfolio|projekte|projets|proyectos)$/i,
    ],
  },
  {
    zoneType: 'PUBLICATIONS',
    patterns: [
      /^(?:yayinlar(?:im)?|makaleler|patentler|akademik\s*yayinlar|publications|papers|patents|veroeffentlichungen|publications\s*scientifiques|publicaciones)$/i,
    ],
  },
  {
    zoneType: 'VOLUNTEER',
    patterns: [
      /^(?:gonullu\s*calismalar|gonulluluk|sosyal\s*sorumluluk|volunteer\s*experience|volunteering|volunteer\s*work|ehrenamtliche\s*taetigkeit|benevolat|voluntariado)$/i,
    ],
  },
  {
    zoneType: 'INTERESTS',
    patterns: [
      /^(?:hobiler(?:im)?|ilgi\s*alanlari|kisisel\s*ilgi\s*alanlari|hobbies|interests|personal\s*interests|interessen|hobbys|centres\s*d\s*interet|intereses|pasatiempos)$/i,
    ],
  },
];

/**
 * Strips cosmetic bullet symbols, markdown, brackets, and numbers from heading lines.
 */
function cleanHeadingText(line: string): string {
  if (!line) return '';
  return line
    .replace(/^[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:#\d\.\(\)\[\]\/]+/, '')
    .replace(/[\s•*·\->–—👤📱📧🔗🏠★☆▶◀■□◆◇●○▲▼|:#\.\(\)\[\]\/]+$/, '')
    .trim();
}

/**
 * Checks if a line is an explicit section heading.
 */
export function identifySectionHeading(line: string): { zoneType: CvZoneType; confidence: number } | null {
  if (!line || line.length > 70) return null;
  const clean = cleanHeadingText(line);
  if (!clean || clean.length < 2 || clean.length > 50) return null;

  // Single punctuation or numeric line is not a heading
  if (/^[\d\s.,\-_/\\:;]+$/.test(clean)) return null;

  const norm = normalizeTrUniversal(clean);
  const compactNorm = norm.replace(/[^a-z0-9]/g, '');

  for (const rule of HEADING_RULES) {
    for (const pat of rule.patterns) {
      if (pat.test(norm) || pat.test(compactNorm)) {
        return { zoneType: rule.zoneType, confidence: 0.95 };
      }
    }
  }

  // Handle pipe-separated compound headers (e.g. "İŞ DENEYİMİ | EĞİTİM")
  if (line.includes('|')) {
    const parts = line.split('|').map((p) => cleanHeadingText(p)).filter(Boolean);
    for (const part of parts) {
      const partNorm = normalizeTrUniversal(part);
      const partCompact = partNorm.replace(/[^a-z0-9]/g, '');
      for (const rule of HEADING_RULES) {
        for (const pat of rule.patterns) {
          if (pat.test(partNorm) || pat.test(partCompact)) {
            return { zoneType: rule.zoneType, confidence: 0.9 };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Segments the entire raw document text into distinct, non-overlapping semantic zones.
 */
export function segmentCvIntoDocumentZones(
  rawText: string,
  spatialModel?: CvDocumentModel,
): CvDocumentZoningResult {
  const cleanText = normalizeCvText(rawText || '', true);
  const lines = cleanText.split(/\r?\n/).map((l) => l.trim());

  const zones: CvDocumentZone[] = [];
  const zoneMap = new Map<CvZoneType, CvDocumentZone[]>();

  const addZone = (zone: CvDocumentZone) => {
    if (zone.rawLines.length === 0) return;
    zone.text = zone.rawLines.join('\n');
    zones.push(zone);
    const existing = zoneMap.get(zone.zoneType) || [];
    existing.push(zone);
    zoneMap.set(zone.zoneType, existing);
  };

  let currentZoneType: CvZoneType = 'HEADER';
  let currentLines: string[] = [];
  let currentStart = 0;
  let currentHeadingText: string | undefined = undefined;
  let isExplicit = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      if (currentLines.length > 0) currentLines.push('');
      continue;
    }

    const headingInfo = identifySectionHeading(line);
    if (headingInfo) {
      // Flush previous zone
      if (currentLines.some((l) => l.trim().length > 0)) {
        addZone({
          zoneType: currentZoneType,
          rawLines: [...currentLines],
          text: '',
          startLine: currentStart,
          endLine: i - 1,
          headingText: currentHeadingText,
          confidence: currentZoneType === 'HEADER' ? 0.9 : 0.95,
          isExplicitHeading: isExplicit,
        });
      }

      // Start new zone
      currentZoneType = headingInfo.zoneType;
      currentLines = [];
      currentStart = i;
      currentHeadingText = line;
      isExplicit = true;
      continue;
    }

    // Boundary recovery: If inside REFERENCES, check if candidate identity block begins
    if (currentZoneType === 'REFERENCES' && !line.includes('-') && !line.includes('|') && !line.includes('ref@')) {
      const words = line.split(/\s+/).filter(Boolean);
      if (words.length >= 2 && words.length <= 4) {
        const firstNorm = normalizeTrUniversal(words[0]);
        const isGiven = EXTENSIVE_TURKISH_MALE_NAMES.has(firstNorm) || EXTENSIVE_TURKISH_FEMALE_NAMES.has(firstNorm);
        const nextLine = lines[i + 1] || '';
        const nextNextLine = lines[i + 2] || '';
        const hasNextSignal =
          nextLine.includes('@') ||
          /(?:\+?90|0?5\d{2})\s*\d{3}/.test(nextLine) ||
          nextLine.includes('/') ||
          /(?:istanbul|ankara|izmir|bursa|antalya|adana|konya|gaziantep|kocaeli|mersin|diyarbakir|eskisehir|samsun|denizli|sanliurfa|sakarya|malatya|kahramanmaras|erzurum|van|batman|elazig|izmit|manisa|sivas|gebze|kadikoy|besiktas|cankaya|sisli|maltepe|kartal|umraniye|pendik|atasehir|uskudar|bakirkoy|beylikduzu|avcilar|bagcilar|bahcelievler|esenler|fatih|gaziosmanpasa|gungoren|kagithane|kucukcekmece|sariyer|sultangazi|tuzla|zeytinburnu|nilufer|osmangazi|karatas|seyhan|cukurova|muratpasa|kepez|konyaalti|bornova|karsiyaka|konak|buca|bayrakli|cigli|gaziemir)/i.test(
            nextLine,
          ) ||
          /müdür|direktör|uzman|lider|yönetici|mühendis/i.test(nextLine) ||
          nextNextLine.includes('@') ||
          /(?:\+?90|0?5\d{2})\s*\d{3}/.test(nextNextLine) ||
          /müdür|direktör|uzman|lider|yönetici|mühendis/i.test(nextNextLine);
        if (isGiven && hasNextSignal) {
          if (currentLines.some((l) => l.trim().length > 0)) {
            addZone({
              zoneType: currentZoneType,
              rawLines: [...currentLines],
              text: '',
              startLine: currentStart,
              endLine: i - 1,
              headingText: currentHeadingText,
              confidence: 0.95,
              isExplicitHeading: isExplicit,
            });
          }
          currentZoneType = 'HEADER';
          currentLines = [];
          currentStart = i;
          currentHeadingText = undefined;
          isExplicit = false;
        }
      }
    }

    currentLines.push(line);
  }

  // Flush final zone
  if (currentLines.some((l) => l.trim().length > 0)) {
    addZone({
      zoneType: currentZoneType,
      rawLines: [...currentLines],
      text: '',
      startLine: currentStart,
      endLine: lines.length - 1,
      headingText: currentHeadingText,
      confidence: 0.9,
      isExplicitHeading: isExplicit,
    });
  }

  return {
    zones,
    zoneMap,
    headerZone: (zoneMap.get('HEADER') || [])[0],
    contactZone: (zoneMap.get('CONTACT') || [])[0],
    summaryZone: (zoneMap.get('SUMMARY') || [])[0],
    experienceZone: (zoneMap.get('EXPERIENCE') || [])[0],
    educationZone: (zoneMap.get('EDUCATION') || [])[0],
    skillsZone: (zoneMap.get('SKILLS') || [])[0],
    languagesZone: (zoneMap.get('LANGUAGES') || [])[0],
    certificationsZone: (zoneMap.get('CERTIFICATIONS') || [])[0],
    referencesZone: (zoneMap.get('REFERENCES') || [])[0],
    projectsZone: (zoneMap.get('PROJECTS') || [])[0],
    publicationsZone: (zoneMap.get('PUBLICATIONS') || [])[0],
    volunteerZone: (zoneMap.get('VOLUNTEER') || [])[0],
    interestsZone: (zoneMap.get('INTERESTS') || [])[0],
  };
}
