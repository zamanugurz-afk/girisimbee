/**
 * Reject AI claims that introduce numbers/percents absent from the provided evidence.
 * Intentionally simple: do not try to parse every Turkish numeral.
 */

const NUMERIC_TOKEN_RE =
  /(?:%\s*)?\d+(?:[.,]\d+)?(?:\s*%|\s*yüzde)?|\b(?:yüzde)\s*\d+(?:[.,]\d+)?/gi;

function normalizeNumericToken(raw: string): string {
  return raw
    .toLocaleLowerCase('tr-TR')
    .replace(/yüzde/g, '%')
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/%/g, '%');
}

export function extractNumericTokens(text: string): string[] {
  const hits = text.match(NUMERIC_TOKEN_RE) ?? [];
  NUMERIC_TOKEN_RE.lastIndex = 0;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    const token = normalizeNumericToken(hit);
    if (!token || seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}

export function hasUngroundedNumbers(output: string, evidence: string): boolean {
  if (!output.trim()) return false;
  const allowed = new Set(extractNumericTokens(evidence));
  return extractNumericTokens(output).some((token) => !allowed.has(token));
}

export function groundedTextOrEmpty(output: string, evidence: string): string {
  const text = output.trim();
  if (!text) return '';
  return hasUngroundedNumbers(text, evidence) ? '' : text;
}

export function groundedList(items: string[], evidence: string): string[] {
  return items.filter((item) => item.trim() && !hasUngroundedNumbers(item, evidence));
}
