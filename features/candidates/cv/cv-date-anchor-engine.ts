/**
 * Universal Date Anchor Engine (CV Extraction 4.0)
 * Resolves full date ranges, standalone dates, month-year combinations,
 * OCR split month names (A ustos, Kas im, etc.), and current job indicators.
 */

export interface ParsedDateAnchor {
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  isCurrent: boolean;
  rawSnippet: string;
  confidence: number;
}

const MONTH_NORMALIZATION_MAP: Record<string, number> = {
  // Turkish full & short
  ocak: 1, oca: 1, 'oc ak': 1, 'oc.': 1,
  subat: 2, sub: 2, 's ubat': 2, 'sub.': 2,
  mart: 3, mar: 3, 'mar.': 3,
  nisan: 4, nis: 4, 'nis an': 4, 'nis.': 4,
  mayis: 5, may: 5, 'may is': 5, 'may.': 5,
  haziran: 6, haz: 6, 'haz iran': 6, 'haz.': 6,
  temmuz: 7, tem: 7, 'tem muz': 7, 'tem.': 7,
  agustos: 8, agu: 8, 'a ustos': 8, 'ag ustos': 8, 'agu.': 8,
  eylul: 9, eyl: 9, 'eyl ul': 9, 'ey lul': 9, 'eyl.': 9,
  ekim: 10, eki: 10, 'eki m': 10, 'ek im': 10, 'eki.': 10,
  kasim: 11, kas: 11, 'kas im': 11, 'ka sim': 11, 'kas.': 11,
  aralik: 12, ara: 12, 'ara lik': 12, 'ar alik': 12, 'ara.': 12,
  // English full & short
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3,
  april: 4, apr: 4,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

const PRESENT_INDICATOR_REGEX =
  /\b(?:gunumuz|gunumuze|devam|devam\s*ediyor|halen|su\s*an|present|current|ongoing|now|to\s*date|actuel)\b/i;

export function normalizeTrForDate(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^\w\s\.\/\-–—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses all variants of date anchors from unstructured line text.
 */
export function extractDateAnchor(rawText: string): ParsedDateAnchor | null {
  if (!rawText || rawText.trim().length === 0) return null;

  const text = normalizeTrForDate(rawText);

  // 1. Month Name + Year Range: e.g. "Ocak 2020 - Mart 2024" or "Kas im 2019 - Devam ediyor"
  const monthYearRangeRegex =
    /([a-z\.\s]{3,10})\s+(19\d\d|20\d\d)\s*(?:[-–—\/toilaile]+|\s+to\s+)\s*(?:([a-z\.\s]{3,10})\s+(19\d\d|20\d\d)|(gunumuz|devam|halen|present|current|now))/i;
  const myrMatch = text.match(monthYearRangeRegex);
  if (myrMatch) {
    const startMName = myrMatch[1].trim();
    const startY = parseInt(myrMatch[2], 10);
    const startM = MONTH_NORMALIZATION_MAP[startMName];

    let endY: number | undefined;
    let endM: number | undefined;
    let isCurrent = false;

    if (myrMatch[5] || PRESENT_INDICATOR_REGEX.test(myrMatch[0])) {
      isCurrent = true;
      endY = new Date().getFullYear();
    } else if (myrMatch[4]) {
      endY = parseInt(myrMatch[4], 10);
      const endMName = myrMatch[3]?.trim();
      if (endMName) endM = MONTH_NORMALIZATION_MAP[endMName];
    }

    if (startY >= 1970 && startY <= 2040) {
      return {
        startYear: startY,
        startMonth: startM,
        endYear: endY,
        endMonth: endM,
        isCurrent,
        rawSnippet: myrMatch[0].trim(),
        confidence: 0.98,
      };
    }
  }

  // 2. Numeric MM.YYYY / MM/YYYY Range: e.g. "01.2020 - 05.2024" or "09/2021 - Present"
  const numMonthYearRangeRegex =
    /\b(0?[1-9]|1[0-2])[\.\/](19\d\d|20\d\d)\s*(?:[-–—\/toilaile]+|\s+to\s+)\s*(?:(0?[1-9]|1[0-2])[\.\/](19\d\d|20\d\d)|(gunumuz|devam|halen|present|current|now))\b/i;
  const nmyMatch = text.match(numMonthYearRangeRegex);
  if (nmyMatch) {
    const startM = parseInt(nmyMatch[1], 10);
    const startY = parseInt(nmyMatch[2], 10);
    let endY: number | undefined;
    let endM: number | undefined;
    let isCurrent = false;

    if (nmyMatch[5] || PRESENT_INDICATOR_REGEX.test(nmyMatch[0])) {
      isCurrent = true;
      endY = new Date().getFullYear();
    } else if (nmyMatch[4]) {
      endM = parseInt(nmyMatch[3], 10);
      endY = parseInt(nmyMatch[4], 10);
    }

    if (startY >= 1970 && startY <= 2040) {
      return {
        startYear: startY,
        startMonth: startM,
        endYear: endY,
        endMonth: endM,
        isCurrent,
        rawSnippet: nmyMatch[0].trim(),
        confidence: 0.96,
      };
    }
  }

  // 3. Year to Year Range: e.g. "2020 - 2024", "2020 – Günümüz", "2019/2023"
  const yearRangeRegex =
    /\b(19\d\d|20\d\d)\s*(?:[-–—\/toilaile]+|\s+to\s+)\s*(19\d\d|20\d\d|gunumuz|devam|halen|present|current|now)\b/i;
  const yrMatch = text.match(yearRangeRegex);
  if (yrMatch) {
    const startY = parseInt(yrMatch[1], 10);
    const endRaw = yrMatch[2].toLowerCase().trim();
    const isCurrent = PRESENT_INDICATOR_REGEX.test(endRaw);
    const endY = isCurrent ? new Date().getFullYear() : parseInt(endRaw, 10);

    if (startY >= 1970 && startY <= 2040) {
      return {
        startYear: startY,
        endYear: isNaN(endY) ? undefined : endY,
        isCurrent,
        rawSnippet: yrMatch[0].trim(),
        confidence: 0.95,
      };
    }
  }

  // 4. Single Month + Year (Starting date or standalone graduation date): e.g. "Ocak 2020", "09.2023"
  const singleMonthYearRegex =
    /(?:^|\s)(?:([a-z\.\s]{3,10})|(0?[1-9]|1[0-2])[\.\/])\s*(19\d\d|20\d\d)(?:\s|$)/i;
  const smyMatch = text.match(singleMonthYearRegex);
  if (smyMatch) {
    const startMName = smyMatch[1]?.trim();
    const startMNum = smyMatch[2] ? parseInt(smyMatch[2], 10) : undefined;
    const month = startMNum || (startMName ? MONTH_NORMALIZATION_MAP[startMName] : undefined);
    const year = parseInt(smyMatch[3], 10);

    if (year >= 1970 && year <= 2040) {
      return {
        startYear: year,
        startMonth: month,
        endYear: year,
        isCurrent: false,
        rawSnippet: smyMatch[0].trim(),
        confidence: 0.85,
      };
    }
  }

  // 5. Standalone 4-digit Year: e.g. "(2020)" or "2019"
  const singleYearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
  if (singleYearMatch) {
    const year = parseInt(singleYearMatch[1], 10);
    if (year >= 1970 && year <= 2040) {
      return {
        startYear: year,
        endYear: year,
        isCurrent: false,
        rawSnippet: singleYearMatch[0].trim(),
        confidence: 0.75,
      };
    }
  }

  return null;
}
