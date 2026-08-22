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

export function findCareerProfileContactViolation(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  for (const { re, label } of FORBIDDEN_PATTERNS) {
    if (re.test(trimmed)) {
      return `Kariyer özetinde ${label} paylaşmayın. İletişim yalnızca talep kabulünden sonra açılır.`;
    }
  }

  return null;
}

export function findCareerProfileContentViolation(
  text: string,
  options: { checkCompany?: boolean } = { checkCompany: false },
): string | null {
  const contactViolation = findCareerProfileContactViolation(text);
  if (contactViolation) return contactViolation;

  if (options.checkCompany) {
    const COMPANY_HINT = /\b(ltd\.?|a\.?\s*ş\.?|aş\.|inc\.|gmbh)\b/i;
    if (COMPANY_HINT.test(text.trim())) {
      return 'Firma / şirket adı paylaşmayın. Deneyimi sektör ve rol ile anonim anlatın.';
    }
  }

  return null;
}

/**
 * Ensures candidate texts contain no private contact leaks (email, phone, direct url).
 * Company names from CV are preserved for verified employers and anonymized on public card.
 */
export function assertCareerProfileTextsClean(texts: Array<string | null | undefined>): void {
  for (const text of texts) {
    if (!text) continue;
    const violation = findCareerProfileContactViolation(text);
    if (violation) throw new Error(violation);
  }
}
