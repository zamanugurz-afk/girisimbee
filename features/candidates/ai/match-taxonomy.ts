import { MANUAL_OPTION, isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';

function fold(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strips common Turkish noun / role suffixes for flexible root matching. */
function stemTr(word: string): string {
  let s = fold(word);
  s = s.replace(/(leri|lari|ler|lar|lik|lik|luk|luk)$/g, '');
  s = s.replace(/(si|si|su|su)$/g, '');
  s = s.replace(/(i|i|u|u)$/g, '');
  s = s.replace(/(ci|ci|cu|cu)$/g, '');
  return s;
}

function tokens(value: string): string[] {
  return fold(value)
    .split(' ')
    .filter((token) => token.length >= 2);
}

function stems(value: string): string[] {
  return tokens(value).map(stemTr).filter((s) => s.length >= 2);
}

const MANAGER_KEYWORDS = new Set([
  'mudur',
  'yonetici',
  'direktor',
  'baskan',
  'lider',
  'sef',
  'supervizor',
  'head',
  'lead',
  'manager',
  'director',
]);

const JUNIOR_KEYWORDS = new Set([
  'stajyer',
  'asistan',
  'yardimci',
  'giris',
  'baslangic',
  'mezun',
  'eleman',
  'temsilci',
]);

function hasKeyword(stemList: string[], keywordSet: Set<string>): boolean {
  return stemList.some((s) => keywordSet.has(s) || Array.from(keywordSet).some((k) => s.includes(k)));
}

/**
 * Intelligently rank catalog options against free text with Turkish stemming & role seniority alignment.
 */
export function matchTaxonomyOptions(
  text: string,
  catalog: string[],
  limit = 5,
): string[] {
  const query = fold(text);
  if (query.length < 2) return [];
  const queryTokens = tokens(text);
  const queryStems = stems(text);
  if (queryTokens.length === 0 || queryStems.length === 0) return [];

  const queryIsManager = hasKeyword(queryStems, MANAGER_KEYWORDS);
  const queryIsJunior = !queryIsManager && hasKeyword(queryStems, JUNIOR_KEYWORDS);

  const scored = catalog
    .filter((option) => option && !isManualCareerOption(option) && option !== MANUAL_OPTION)
    .map((option) => {
      const folded = fold(option);
      if (!folded) return { option, score: 0 };
      if (folded === query) return { option, score: 120 };

      const optionTokens = tokens(option);
      const optionStems = stems(option);

      // Exact stem match
      if (queryStems.join(' ') === optionStems.join(' ')) {
        return { option, score: 110 };
      }

      // Exact token presence check (e.g. "crm", "satis", "yonetim")
      const exactTokenMatch = queryTokens.some(
        (token) => optionTokens.includes(token) && token.length >= 3,
      );

      // Compute token & stem overlaps
      const stemOverlap = queryStems.filter((qs) =>
        optionStems.some((os) => os === qs || os.includes(qs) || qs.includes(os)),
      ).length;

      if (stemOverlap === 0 && !exactTokenMatch) return { option, score: 0 };

      const ratio = stemOverlap / Math.max(queryStems.length, optionStems.length);
      let baseScore = exactTokenMatch
        ? Math.max(55, Math.round(ratio * 80))
        : Math.round(ratio * 80);

      // Full containment bonus
      if (folded.includes(query) || query.includes(folded)) {
        baseScore = Math.max(baseScore, 85);
      }

      // If all query stems are present in candidate
      if (stemOverlap === queryStems.length && queryStems.length > 1) {
        baseScore = Math.max(baseScore, 90);
      }

      // Seniority Alignment Boost / Penalty
      const optionIsManager = hasKeyword(optionStems, MANAGER_KEYWORDS);
      const optionIsJunior = hasKeyword(optionStems, JUNIOR_KEYWORDS);

      if (queryIsManager) {
        if (optionIsManager) {
          baseScore += 30; // Boost managerial roles
        } else if (optionIsJunior) {
          baseScore -= 50; // Heavily demote entry/rep roles when query has Manager
        }
      } else if (queryIsJunior) {
        if (optionIsJunior) {
          baseScore += 20;
        } else if (optionIsManager) {
          baseScore -= 30;
        }
      }

      return { option, score: baseScore };
    })
    .filter((row) => row.score >= 50)
    .sort((a, b) => b.score - a.score || a.option.localeCompare(b.option, 'tr'));

  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of scored) {
    if (seen.has(row.option)) continue;
    seen.add(row.option);
    out.push(row.option);
    if (out.length >= limit) break;
  }
  return out;
}
