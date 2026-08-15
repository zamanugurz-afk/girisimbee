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

/** Treat 10, 10% and %10 as the same claim; keep 2.500.000 aligned with 2500000. */
function canonicalNumericKeys(token: string): string[] {
  const noPct = token.replace(/%/g, '');
  const keys = new Set<string>([token, noPct]);
  if (/^\d{1,3}(\.\d{3})+$/.test(noPct)) {
    keys.add(noPct.replace(/\./g, ''));
  }
  if (noPct.includes(',')) {
    keys.add(noPct.replace(',', '.'));
  }
  return [...keys];
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
  const allowed = new Set<string>();
  for (const token of extractNumericTokens(evidence)) {
    for (const key of canonicalNumericKeys(token)) allowed.add(key);
  }
  return extractNumericTokens(output).some(
    (token) => !canonicalNumericKeys(token).some((key) => allowed.has(key)),
  );
}

export function groundedTextOrEmpty(output: string, evidence: string): string {
  const text = output.trim();
  if (!text) return '';
  return hasUngroundedNumbers(text, evidence) ? '' : text;
}

export function groundedList(items: string[], evidence: string): string[] {
  return items.filter((item) => item.trim() && !hasUngroundedNumbers(item, evidence));
}
