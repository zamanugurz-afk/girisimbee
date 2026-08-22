import type { RawExtractedExperience } from './cv.types';
import type { CvDocumentBlock } from './cv-document-model';
import { normalizeTrUniversal, parseUniversalDateRange } from './cv-universal-normalizer';
import { UNIVERSAL_ROLE_ALIASES } from './cv-universal-dictionary';

const KNOWN_COMPANY_SUFFIX_REGEX =
  /(?:a\.?\s*ş\.?|ltd\.?\s*şti\.?|holding|group|grup|danışmanlık|sanayi|ticaret|teknoloji|bilişim|hizmetleri|bankası|sigorta|hastanesi|belediyesi|bakanlığı|müdürlüğü|inc\.?|corp\.?|llc|gmbh|co\.?|ltd\.?)$/i;

/**
 * Resolves structured work experience items from spatial blocks or plain text.
 */
export function resolveExperienceBlocks(
  blocksOrText: CvDocumentBlock[] | string,
): RawExtractedExperience[] {
  if (typeof blocksOrText === 'string') {
    return extractExperiencesFromLines(blocksOrText.split(/\r?\n/));
  }

  if (blocksOrText.length === 0) return [];

  const rawLines = blocksOrText.map((b) => b.text.trim()).filter(Boolean);
  return extractExperiencesFromLines(rawLines);
}

/**
 * Procedural yet robust multi-pattern experience line analyzer.
 */
function extractExperiencesFromLines(lines: string[]): RawExtractedExperience[] {
  const experiences: RawExtractedExperience[] = [];
  let currentExp: Partial<RawExtractedExperience> | null = null;
  const currentBullets: string[] = [];

  function flushCurrent() {
    if (currentExp && (currentExp.company || currentExp.role)) {
      experiences.push({
        company: currentExp.company?.trim(),
        role: currentExp.role?.trim(),
        startYear: currentExp.startYear,
        endYear: currentExp.endYear,
        isCurrent: currentExp.isCurrent,
        responsibilities: currentBullets.join('\n').trim() || currentExp.responsibilities || '',
        durationYears:
          currentExp.startYear && currentExp.endYear
            ? Math.max(1, currentExp.endYear - currentExp.startYear)
            : undefined,
      });
    }
    currentExp = null;
    currentBullets.length = 0;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const dateInfo = parseUniversalDateRange(line);

    if (dateInfo?.startYear) {
      const prevLine1 = i > 0 ? lines[i - 1].trim() : '';
      const prevLine2 = i > 1 ? lines[i - 2].trim() : '';

      const lineWithoutDate = line
        .replace(/\b(19\d\d|20\d\d)[\s\/\.\-–—]+(19\d\d|20\d\d|günümüz|devam|present|current)\b/gi, '')
        .replace(/[()]/g, '')
        .trim();

      flushCurrent();

      let detectedCompany = '';
      let detectedRole = '';

      if (lineWithoutDate.includes('|') || lineWithoutDate.includes(' - ') || lineWithoutDate.includes(' – ')) {
        const parts = lineWithoutDate.split(/[|–—\-]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (isLikelyRole(parts[0])) {
            detectedRole = parts[0];
            detectedCompany = isLikelyCity(parts[1]) ? '' : parts[1];
          } else if (isLikelyRole(parts[1])) {
            detectedRole = parts[1];
            detectedCompany = isLikelyCity(parts[0]) ? '' : parts[0];
          } else {
            detectedCompany = isLikelyCity(parts[0]) ? '' : parts[0];
            if (!detectedCompany && !isLikelyCity(parts[1])) {
              detectedCompany = parts[1];
            }
          }
        }
      }

      if (!detectedRole && prevLine1 && isLikelyRole(prevLine1)) {
        detectedRole = prevLine1;
        if (!detectedCompany && prevLine2 && !parseUniversalDateRange(prevLine2)?.startYear && !prevLine2.startsWith('•')) {
          detectedCompany = prevLine2;
        }
      } else if (!detectedRole && prevLine2 && isLikelyRole(prevLine2)) {
        detectedRole = prevLine2;
        if (!detectedCompany && prevLine1 && !parseUniversalDateRange(prevLine1)?.startYear && !prevLine1.startsWith('•')) {
          detectedCompany = prevLine1;
        }
      } else if (!detectedRole && prevLine1 && !parseUniversalDateRange(prevLine1)?.startYear && !prevLine1.startsWith('•')) {
        if (prevLine1.includes('|') || prevLine1.includes(' - ') || prevLine1.includes(' – ')) {
          const parts = prevLine1.split(/[|–—\-]/).map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            if (isLikelyRole(parts[0])) {
              detectedRole = parts[0];
              if (!detectedCompany) detectedCompany = parts[1];
            } else if (isLikelyRole(parts[1])) {
              detectedRole = parts[1];
              if (!detectedCompany) detectedCompany = parts[0];
            }
          }
        } else if (!detectedCompany) {
          detectedCompany = prevLine1;
        }
      }

      currentExp = {
        company: detectedCompany,
        role: detectedRole,
        startYear: dateInfo.startYear,
        endYear: dateInfo.endYear,
        isCurrent: Boolean(dateInfo.isCurrent),
      };
      continue;
    }

    if (currentExp) {
      if (!currentExp.role && isLikelyRole(line)) {
        currentExp.role = line;
      } else if (!currentExp.company && KNOWN_COMPANY_SUFFIX_REGEX.test(line)) {
        currentExp.company = line;
      } else if (
        line.startsWith('•') ||
        line.startsWith('-') ||
        line.startsWith('*') ||
        line.length > 25
      ) {
        currentBullets.push(line.replace(/^[•\-\*]\s*/, ''));
      }
    }
  }

  flushCurrent();
  return experiences;
}

function isLikelyCity(text: string): boolean {
  const norm = normalizeTrUniversal(text);
  return /^(?:adana|adiyaman|afyonkarahisar|agri|amasya|ankara|antalya|artvin|aydin|balikesir|bilecik|bingol|bitlis|bolu|burdur|bursa|canakkale|cankiri|corum|denizli|diyarbakir|edirne|elazig|erzincan|erzurum|eskisehir|gaziantep|giresun|gumushane|hakkari|hatay|isparta|mersin|istanbul|izmir|kars|kastamonu|kayseri|kirklareli|kirsehir|kocaeli|konya|kutahya|malatya|manisa|kahramanmaras|mardin|mugla|mus|nevsehir|nigde|ordu|rize|sakarya|samsun|siirt|sinop|sivas|tekirdag|tokat|trabzon|tunceli|sanliurfa|usak|van|yozgat|zonguldak|aksaray|bayburt|karaman|kirikkale|batman|sirnak|bartin|ardahan|igdir|yalova|karabuk|kilis|osmaniye|duzce)$/i.test(
    norm,
  );
}

function isLikelyRole(text: string): boolean {
  const norm = normalizeTrUniversal(text);
  if (!norm || norm.length > 60) return false;
  if (isLikelyCity(norm)) return false;

  for (const alias of Object.keys(UNIVERSAL_ROLE_ALIASES || {})) {
    if (norm === alias || norm.includes(alias)) return true;
  }

  return /(mühendis|uzman|yönetici|müdür|developer|engineer|lead|specialist|danışman|asistan|temsilci|şef|koordinatör|stajyer|direktör|tasarımcı|tekniker|teknisyen|öğretmen|avukat|doktor|operatör|sorumlu)/i.test(
    norm,
  );
}
