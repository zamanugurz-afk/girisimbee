/** Free-text PII detection/redaction before any OpenAI payload is built. */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE =
  /(?:\+90|0)?[\s.-]*5\d{2}[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}/g;
const ADDRESS_RE =
  /\b(?:mah(?:alle(?:si)?)?|sok(?:ak)?|cad(?:de(?:si)?)?|bulvar(?:ı|i)?|apartman(?:ı|i)?)\b[^,.;\n]{0,40}/gi;

export const CAREER_AI_PII_MASK = '[gizli]';

export function findCareerFreeTextPii(text: string): Array<'email' | 'phone' | 'address'> {
  const found = new Set<'email' | 'phone' | 'address'>();
  if (EMAIL_RE.test(text)) found.add('email');
  EMAIL_RE.lastIndex = 0;
  const phoneHits = text.match(PHONE_RE) ?? [];
  PHONE_RE.lastIndex = 0;
  if (phoneHits.some((hit) => hit.replace(/\D/g, '').length >= 10)) found.add('phone');
  ADDRESS_RE.lastIndex = 0;
  if (ADDRESS_RE.test(text)) found.add('address');
  ADDRESS_RE.lastIndex = 0;
  return Array.from(found);
}

export function containsCareerFreeTextPii(text: string): boolean {
  return findCareerFreeTextPii(text).length > 0;
}

export function redactCareerFreeTextPii(text: string): string {
  EMAIL_RE.lastIndex = 0;
  PHONE_RE.lastIndex = 0;
  ADDRESS_RE.lastIndex = 0;
  return text
    .replace(EMAIL_RE, CAREER_AI_PII_MASK)
    .replace(PHONE_RE, CAREER_AI_PII_MASK)
    .replace(ADDRESS_RE, ` ${CAREER_AI_PII_MASK} `)
    .replace(/\s+/g, ' ')
    .trim();
}

export function prepareTextForCareerAi(text: string, minMeaningful = 8): {
  text: string;
  blocked: boolean;
  hadPii: boolean;
} {
  const source = text ?? '';
  const hadPii = containsCareerFreeTextPii(source);
  const redacted = hadPii ? redactCareerFreeTextPii(source) : source.trim();
  const meaningful = redacted.replace(/\[gizli\]/gi, '').replace(/\s+/g, ' ').trim();
  return {
    text: redacted,
    hadPii,
    blocked: hadPii && meaningful.length < minMeaningful,
  };
}

export function redactCareerAiValue<T>(value: T): T {
  if (typeof value === 'string') {
    return redactCareerFreeTextPii(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactCareerAiValue(item)) as T;
  }
  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      next[key] = redactCareerAiValue(nested);
    }
    return next as T;
  }
  return value;
}
