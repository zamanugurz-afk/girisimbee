import type { RawExtractedEducation } from './cv.types';
import type { CvDocumentBlock } from './cv-document-model';
import { normalizeTrUniversal, parseUniversalDateRange } from './cv-universal-normalizer';

const UNIVERSITY_KEYWORDS =
  /(üniversite|universite|university|fakülte|fakulte|enstitü|enstitu|college|yüksekokul|yuksekokul|lise|odtü|itü|boun)/i;

const DEGREE_LEVEL_PATTERNS = [
  { level: 'Doktora', regex: /(doktora|ph\.?d|doctorate)/i },
  { level: 'Yüksek Lisans', regex: /(yüksek\s*lisans|yuksek\s*lisans|master|m\.?sc|m\.?ba)/i },
  { level: 'Lisans', regex: /(lisans|bachelor|b\.?sc|b\.?a|lisans\s*derecesi)/i },
  { level: 'Ön Lisans', regex: /(ön\s*lisans|on\s*lisans|associate)/i },
  { level: 'Lise', regex: /(lise|anadolu\s*lisesi|fen\s*lisesi|kolej)/i },
];

/**
 * Resolves structured education entries from spatial blocks or plain text.
 */
export function resolveEducationBlocks(
  blocksOrText: CvDocumentBlock[] | string,
): RawExtractedEducation[] {
  const lines =
    typeof blocksOrText === 'string'
      ? blocksOrText.split(/\r?\n/)
      : blocksOrText.map((b) => b.text.trim()).filter(Boolean);

  const educationList: RawExtractedEducation[] = [];
  let currentEdu: Partial<RawExtractedEducation> | null = null;

  function flushEdu() {
    if (currentEdu && (currentEdu.school || currentEdu.field)) {
      educationList.push({
        school: currentEdu.school?.trim(),
        field: currentEdu.field?.trim(),
        level: currentEdu.level || 'Lisans',
        graduationYear: currentEdu.graduationYear,
      });
    }
    currentEdu = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const dateMatch = parseUniversalDateRange(line);
    const startYear = dateMatch?.startYear ?? null;
    const endYear = dateMatch?.endYear ?? null;

    // Check degree level
    let matchedLevel: string | undefined;
    for (const d of DEGREE_LEVEL_PATTERNS) {
      if (d.regex.test(line)) {
        matchedLevel = d.level;
        break;
      }
    }

    // Check single-line compound education (e.g. "İstanbul Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2018")
    if (UNIVERSITY_KEYWORDS.test(line) && (line.includes('-') || line.includes('|') || line.includes(','))) {
      const parts = line.split(/[-|]/).map((p) => p.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
      if (parts.length >= 2) {
        flushEdu();
        let school = '';
        let field = '';
        for (const p of parts) {
          if (UNIVERSITY_KEYWORDS.test(p) && !school) {
            school = p;
          } else if (!parseUniversalDateRange(p) && !school) {
            school = p;
          } else if (!parseUniversalDateRange(p) && !field) {
            field = p.replace(/\([^)]*\)/g, '').trim();
          }
        }
        currentEdu = {
          school: school || parts[0],
          field: field || (parts[1] ? parts[1].replace(/\([^)]*\)/g, '').trim() : undefined),
          level: matchedLevel || 'Lisans',
          graduationYear: endYear || startYear,
        };
        continue;
      }
    }

    if (UNIVERSITY_KEYWORDS.test(line)) {
      flushEdu();
      currentEdu = {
        school: line.replace(/^[•\-\*]\s*/, '').trim(),
        level: matchedLevel,
        graduationYear: endYear || startYear,
      };
      continue;
    }

    if (currentEdu) {
      if (matchedLevel && !currentEdu.level) {
        currentEdu.level = matchedLevel;
      }
      if (!currentEdu.graduationYear && (endYear || startYear)) {
        currentEdu.graduationYear = endYear || startYear;
      }
      if (!currentEdu.field && !UNIVERSITY_KEYWORDS.test(line) && line.length < 50) {
        currentEdu.field = line.replace(/^[•\-\*]\s*/, '').trim();
      }
    } else if (matchedLevel || startYear) {
      currentEdu = {
        level: matchedLevel,
        graduationYear: endYear || startYear,
      };
    }
  }

  flushEdu();
  return educationList;
}
