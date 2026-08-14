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

function tokens(value: string): string[] {
  return fold(value)
    .split(' ')
    .filter((token) => token.length >= 3);
}

/**
 * Rank existing catalog options against free text. Does not invent options.
 */
export function matchTaxonomyOptions(
  text: string,
  catalog: string[],
  limit = 5,
): string[] {
  const query = fold(text);
  if (query.length < 3) return [];
  const queryTokens = tokens(text);
  if (queryTokens.length === 0) return [];

  const scored = catalog
    .filter((option) => option && !isManualCareerOption(option) && option !== MANUAL_OPTION)
    .map((option) => {
      const folded = fold(option);
      if (!folded) return { option, score: 0 };
      if (folded === query) return { option, score: 100 };
      if (folded.includes(query) || query.includes(folded)) return { option, score: 80 };
      const optionTokens = tokens(option);
      const overlap = queryTokens.filter((token) => optionTokens.includes(token)).length;
      if (overlap === 0) return { option, score: 0 };
      const exactToken = queryTokens.some((token) => optionTokens.includes(token) && token.length >= 3);
      const ratio = overlap / Math.max(queryTokens.length, optionTokens.length);
      const score = exactToken ? Math.max(55, Math.round(ratio * 70)) : Math.round(ratio * 70);
      return { option, score };
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
