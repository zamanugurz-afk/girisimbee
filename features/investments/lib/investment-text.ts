/** Local, zero-token text cleanup for investment free text. */

export function polishInvestmentText(value: unknown): string {
  const trimmed = String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!trimmed) return '';
  const capped = trimmed.charAt(0).toLocaleUpperCase('tr-TR') + trimmed.slice(1);
  return /[.!?…]$/u.test(capped) ? capped : capped;
}

export function sentenceCaseInvestment(value: unknown): string {
  const text = polishInvestmentText(value);
  if (!text) return '';
  return /[.!?…]$/u.test(text) ? text : `${text}.`;
}

export function asTrimmedString(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asTrimmedString(item)).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[·,;|]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

export function joinList(values: string[], separator = ', '): string {
  return values.filter(Boolean).join(separator);
}
