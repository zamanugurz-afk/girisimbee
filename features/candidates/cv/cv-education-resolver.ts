import type { RawExtractedEducation } from './cv.types';
import type { CvDocumentBlock } from './cv-document-model';
import { normalizeTrUniversal, parseUniversalDateRange } from './cv-universal-normalizer';

const UNIVERSITY_KEYWORDS =
  /(üniversite|universite|university|fakülte|fakulte|enstitü|enstitu|college|yüksekokul|yuksekokul|lise)/i;

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
