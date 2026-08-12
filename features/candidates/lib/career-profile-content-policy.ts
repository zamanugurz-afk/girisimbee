/**
 * Blocks direct contact / identity leaks in anonymous career summaries.
 */
const FORBIDDEN_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, label: 'e-posta' },
  { re: /(?:\+90|0)?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/, label: 'telefon' },
  { re: /https?:\/\/|www\./i, label: 'web adresi' },
  {
    re: /\b(linkedin|instagram|twitter|x\.com|facebook|github\.com)\b/i,
    label: 'sosyal medya',
  },
];

const COMPANY_HINT =
  /\b(ltd\.?|a\.?\s*ş\.?|aş\.|inc\.|gmbh|şirketi|holding|group)\b/i;

export function findCareerProfileContentViolation(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  for (const { re, label } of FORBIDDEN_PATTERNS) {
    if (re.test(trimmed)) {
      return `Kariyer özetinde ${label} paylaşmayın. İletişim yalnızca talep kabulünden sonra açılır.`;
    }
  }

  if (COMPANY_HINT.test(trimmed)) {
    return 'Firma / şirket adı paylaşmayın. Deneyimi sektör ve rol ile anonim anlatın.';
  }

  return null;
}

export function assertCareerProfileTextsClean(texts: Array<string | null | undefined>): void {
  for (const text of texts) {
    if (!text) continue;
    const violation = findCareerProfileContentViolation(text);
    if (violation) throw new Error(violation);
  }
}
