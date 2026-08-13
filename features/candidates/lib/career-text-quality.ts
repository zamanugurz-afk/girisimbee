/**
 * Controlled free-text quality checks for Kariyer Kartı fields.
 * Rejects empty/whitespace/gibberish without blocking real Turkish phrases.
 */

const PROFANITY_RE =
  /\b(amk|aq|oç|oc|siktir|sikerim|piç|orospu|göt|yarrak|amına|amina|mal\s*herif)\b/i;

const KEYBOARD_GIBBERISH = /^(?:asdf+|qwer+|zxcv+|şifğü+|fghj+|hjkl+)(?:\s|$)/i;

export type CareerTextQualityOptions = {
  minLength?: number;
  maxLength?: number;
  fieldLabel?: string;
  /** When false, empty after trim is allowed (optional fields). Default true. */
  required?: boolean;
};

export function normalizeCareerTextWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Soft title-case for short professional labels (roles, education fields).
 * Does not rewrite long prose paragraphs.
 */
export function suggestTitleCaseTr(value: string): string {
  const trimmed = normalizeCareerTextWhitespace(value);
  if (!trimmed || trimmed.length > 80) return trimmed;
  return trimmed
    .split(' ')
    .map((word) => {
      if (!word) return word;
      const lower = word.toLocaleLowerCase('tr-TR');
      return lower.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
    })
    .join(' ');
}

export function findCareerTextQualityIssue(
  raw: string | null | undefined,
  options: CareerTextQualityOptions = {},
): string | null {
  const label = options.fieldLabel ?? 'Alan';
  const required = options.required !== false;
  const minLength = options.minLength ?? (required ? 1 : 0);
  const maxLength = options.maxLength ?? 2000;
  const value = typeof raw === 'string' ? raw : '';
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? `${label} zorunludur.` : null;
  }

  if (trimmed.length < minLength) {
    return `${label} en az ${minLength} karakter olmalıdır.`;
  }

  if (trimmed.length > maxLength) {
    return `${label} en fazla ${maxLength} karakter olabilir.`;
  }

  // Whitespace-only already handled; reject punctuation-only / symbol spam
  const lettersOrDigits = trimmed.replace(/[\s\p{P}\p{S}]/gu, '');
  if (!lettersOrDigits) {
    return `${label} yalnızca noktalama veya boşluk olamaz.`;
  }

  // Repeated same character (aaaaaaa / ........ / 11111111)
  if (/^(.)\1{5,}$/u.test(trimmed.replace(/\s/g, ''))) {
    return `${label} anlamsız tekrar içeren bir metin olamaz.`;
  }

  // Long run of the same character inside the string
  if (/(.)\1{7,}/u.test(trimmed)) {
    return `${label} aşırı tekrarlanan karakter içeriyor.`;
  }

  // Excessive emoji density
  const emojiMatches = trimmed.match(/\p{Extended_Pictographic}/gu) ?? [];
  if (emojiMatches.length >= 6 || (trimmed.length <= 12 && emojiMatches.length >= 3)) {
    return `${label} aşırı emoji içeremez.`;
  }

  const compact = trimmed.replace(/\s/g, '').toLocaleLowerCase('tr-TR');

  if (
    KEYBOARD_GIBBERISH.test(trimmed)
    || /^(?:asd|qwe|zxc|dfgh){2,}$/i.test(compact)
    || /^(asdfg?h?|qwerty|zxcvbn|sifre|password)$/i.test(compact)
  ) {
    return `${label} anlamlı bir metin olmalıdır.`;
  }

  // Short latin keyboard smash without vowels (e.g. bnmkl)
  if (
    compact.length >= 5
    && compact.length <= 12
    && /^[a-z]+$/.test(compact)
    && !/[aeiou]/.test(compact)
    && !/[aeıioöuü]/.test(compact)
  ) {
    return `${label} anlamlı bir metin olmalıdır.`;
  }

  if (PROFANITY_RE.test(trimmed)) {
    return `${label} uygunsuz ifade içeremez.`;
  }

  return null;
}

export function assertCareerTextQuality(
  texts: Array<{ value: string | null | undefined; options?: CareerTextQualityOptions }>,
): void {
  for (const item of texts) {
    const issue = findCareerTextQualityIssue(item.value, item.options);
    if (issue) throw new Error(issue);
  }
}
