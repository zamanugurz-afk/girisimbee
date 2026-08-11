/**
 * Listing content quality — deterministic title/body normalization + hard blocks.
 * Extends listing-content-policy; does not rewrite meaning or invent copy.
 */

import {
  findProfanity,
  hasExcessiveCaps,
  hasSpamRepetition,
  normalizeForModeration,
  type ContentPolicyIssue,
} from '@/features/listings/lib/listing-content-policy';
import {
  applyCommonTurkishTypos,
  isMeaningfulTextCorrection,
  normalizeTurkishTypography,
  toTurkishSentenceCase,
} from '@/features/listings/lib/turkish-text-autocorrect';

/** Protected brands / acronyms (case preserved after match). */
export const LISTING_TERM_WHITELIST = [
  'AI',
  'API',
  'SaaS',
  'B2B',
  'B2C',
  'CRM',
  'ERP',
  'IoT',
  'NFT',
  'Web3',
  'FinTech',
  'MarTech',
  'EdTech',
  'PropTech',
  'LinkedIn',
  'Instagram',
  'YouTube',
  'Shopify',
  'WordPress',
  'OpenAI',
  'ChatGPT',
  'iPhone',
  'iPad',
  'iOS',
  'Android',
  'KOBİ',
  'e-Ticaret',
  'E-Ticaret',
] as const;

const WHITELIST_LOOKUP = new Map(
  LISTING_TERM_WHITELIST.map((term) => [term.toLocaleLowerCase('tr-TR'), term]),
);

/** Small words kept lowercase in title case (unless first word). */
const TITLE_SMALL_WORDS = new Set([
  've',
  'veya',
  'ile',
  'için',
  'de',
  'da',
  'ki',
  'mi',
  'mı',
  'mu',
  'mü',
  'bir',
]);

const KEYBOARD_SEQUENCES = [
  'qwerty',
  'asdfgh',
  'asdfg',
  'zxcvbn',
  'qwertyuiop',
  'asdfghjkl',
];

const MEANINGLESS_WORDS = new Set([
  'deneme',
  'test',
  'abc',
  'abcd',
  'yok',
  'xxx',
  'aaaa',
  'bbbb',
]);

const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu;

/** Category hint keywords for soft mismatch warnings (slug → tokens). */
const CATEGORY_HINTS: Record<string, string[]> = {
  franchise: ['franchise', 'bayilik', 'bayi', 'franchising'],
  'bayilik-al': ['franchise', 'bayilik', 'bayi', 'franchising'],
  'dijital-ai': ['ai', 'saas', 'yazılım', 'dijital', 'software', 'api', 'uygulama'],
  'ise-al': ['iş ilanı', 'işe alım', 'geliştirici', 'developer', 'çalışan arıyor', 'işçi'],
  'is-bul': ['iş arıyorum', 'cv', 'özgeçmiş', 'kariyer'],
  'yatirim-bul': ['yatırım', 'yatırımcı', 'girişim', 'fon'],
  'yatirim-ariyorum': ['yatırım', 'yatırımcı', 'girişim', 'fon'],
  'ortak-bul': ['ortak', 'ortaklık', 'kurucu'],
};

export type ListingQualityField = 'title' | 'shortDescription' | 'longDescription';

export interface ListingQualitySuggestion {
  field: ListingQualityField;
  original: string;
  suggested: string;
  message: string;
}

export interface ListingQualityResult {
  normalized: {
    title: string;
    shortDescription: string;
    longDescription: string;
  };
  suggestions: ListingQualitySuggestion[];
  /** Hard blocks — must stop publish. */
  blocks: ContentPolicyIssue[];
  /** Soft warnings — do not block. */
  warnings: ContentPolicyIssue[];
  ok: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stripEmojis(input: string): string {
  return input.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
}

/** Collapse !!! ??? ... and spaced punctuation. */
export function normalizePunctuation(input: string): string {
  return input
    .replace(/!(?:\s*!)+/g, '!')
    .replace(/\?(?:\s*\?)+/g, '?')
    .replace(/!{2,}/g, '!')
    .replace(/\?{2,}/g, '?')
    .replace(/\.{4,}/g, '...')
    .replace(/\.{2}(?!\.)/g, '.')
    .replace(/,{2,}/g, ',')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])(?!\s|$)/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Collapse elongated letters: fiiiiirsat → firsat (keep ≤2 repeats). */
export function collapseElongatedLetters(input: string): string {
  return input.replace(/(\p{L})\1{2,}/gu, '$1$1');
}

function titleCaseWord(word: string, index: number): string {
  if (!word) return word;

  // Preserve & and slash tokens mixed with letters: "fintech&ai" already split
  const parts = word.split(/([/&+-])/);
  return parts
    .map((part) => {
      if (!part || /^[/&+-]$/.test(part)) return part;
      const lower = part.toLocaleLowerCase('tr-TR');
      const known = WHITELIST_LOOKUP.get(lower);
      if (known) return known;

      if (index > 0 && TITLE_SMALL_WORDS.has(lower)) {
        return lower;
      }

      // Keep all-caps short tokens that look like acronyms (2–5), excluding small words
      if (
        /^[A-Z0-9]{2,5}$/.test(part)
        && part === part.toUpperCase()
        && !TITLE_SMALL_WORDS.has(lower)
      ) {
        return part;
      }

      // iPhone-style: starts with lowercase latin then uppercase
      if (/^[a-z][A-Z]/.test(part)) return part;

      return lower.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
    })
    .join('');
}

/**
 * Turkish title case with whitelist + small-word handling.
 * "AI VE SAAS YATIRIM FIRSATI" → "AI ve SaaS Yatırım Fırsatı"
 */
export function normalizeListingTitleCase(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return trimmed;

  return trimmed
    .split(' ')
    .filter(Boolean)
    .map((word, index) => titleCaseWord(word, index))
    .join(' ');
}

/** Titles: no trailing . ! … ; keep single trailing ? for questions. */
export function stripTitleTrailingPunctuation(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/\?\s*$/.test(trimmed)) {
    return trimmed.replace(/[!.,;:\s]+$/g, '').replace(/\?+\s*$/g, '?').trim();
  }
  return trimmed.replace(/[.!…,;:\s]+$/g, '').trim();
}

export function normalizeListingTitle(input: string): string {
  if (!input.trim()) return '';
  let next = stripEmojis(input);
  // Collapse bangs before typography inserts spaces between them
  next = next.replace(/!{2,}/g, '!').replace(/\?{2,}/g, '?');
  next = normalizeTurkishTypography(next);
  next = collapseElongatedLetters(next);
  next = applyCommonTurkishTypos(next);
  next = normalizeListingTitleCase(next);
  next = normalizePunctuation(next);
  next = stripTitleTrailingPunctuation(next);
  next = next.replace(/\s+/g, ' ').trim();
  return next;
}

/**
 * Light clause break when missing punctuation between clauses.
 * Does not invent meaning — only inserts ". " before a likely new sentence.
 */
export function insertMissingSentenceBreaks(input: string): string {
  let next = input;
  // "...iyoruz yatırımımızı" → "...iyoruz. Yatırımımızı"
  next = next.replace(
    /(\p{L}{3,}(?:yoruz|iyoruz|ıyoruz|üyoruz|mekteyiz|maktayız|yoruz))\s+(\p{Ll})/gu,
    (_, end: string, letter: string) =>
      `${end}. ${letter.toLocaleUpperCase('tr-TR')}`,
  );
  // istanbulda → leave to typo map; ensure sentence start cap
  return next;
}

export function normalizeListingDescription(input: string): string {
  if (!input.trim()) return '';
  let next = normalizeTurkishTypography(input);
  next = normalizePunctuation(next);
  next = collapseElongatedLetters(next);
  next = applyCommonTurkishTypos(next);
  next = insertMissingSentenceBreaks(next);
  next = toTurkishSentenceCase(next);
  // Ensure ends with sentence punctuation if it has letters
  if (/\p{L}/u.test(next) && !/[.!?…]"?$/.test(next)) {
    next = `${next}.`;
  }
  return next.trim();
}

export function isMeaninglessContent(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const noSpace = trimmed.replace(/\s+/g, '');
  if (WHITELIST_LOOKUP.has(noSpace.toLocaleLowerCase('tr-TR'))) return false;
  if (LISTING_TERM_WHITELIST.some((t) => t.toLocaleLowerCase('tr-TR') === noSpace.toLocaleLowerCase('tr-TR'))) {
    return false;
  }

  const moderated = normalizeForModeration(trimmed);
  if (!moderated) {
    // only symbols / emoji
    return true;
  }

  if (MEANINGLESS_WORDS.has(moderated) || KEYBOARD_SEQUENCES.some((k) => moderated.includes(k))) {
    return true;
  }

  // Only digits
  if (/^\d+$/.test(noSpace)) return true;
  // Only same letter
  if (/^(\p{L})\1{4,}$/u.test(noSpace)) return true;
  // Only punctuation/symbols
  if (!/\p{L}|\p{N}/u.test(trimmed)) return true;

  const words = moderated.split(/\s+/).filter(Boolean);
  const letters = moderated.replace(/[^a-z0-9ğüşıöç]/gi, '');

  // Very short nonsense (but allow AI, B2B etc. via whitelist above)
  if (letters.length > 0 && letters.length <= 3 && !WHITELIST_LOOKUP.has(letters)) {
    if (!/[aeıioöuü]/i.test(letters)) return true;
  }

  if (letters.length < 6) return false;

  const unique = new Set(letters.split(''));
  const uniqueRatio = unique.size / letters.length;

  // Real Turkish prose repeats letters — unique/length falls naturally as text grows.
  // Only treat low diversity as nonsense on short blobs, or extreme collapse on long ones.
  if (words.length <= 2 && letters.length < 40 && uniqueRatio < 0.28) {
    return true;
  }
  if (letters.length < 24 && uniqueRatio < 0.28) {
    return true;
  }
  // e.g. "aaaaaaaaaaaaaaaaaaaa" / "abababababab"
  if (unique.size <= 3 && letters.length >= 12) {
    return true;
  }

  return false;
}

export function hasTitleEmojis(text: string): boolean {
  return EMOJI_RE.test(text);
}

export function hasExcessiveEmojis(text: string): boolean {
  const matches = text.match(EMOJI_RE);
  return (matches?.length ?? 0) >= 5;
}

export function detectCategoryMismatch(
  categorySlug: string | null | undefined,
  title: string,
): ContentPolicyIssue | null {
  if (!categorySlug || !title.trim()) return null;
  const hints = CATEGORY_HINTS[categorySlug];
  if (!hints?.length) return null;

  const hay = normalizeForModeration(title);
  const ownHit = hints.some((h) => hay.includes(normalizeForModeration(h)));
  if (ownHit) return null;

  // Soft warn only when title strongly matches a *different* category family
  for (const [slug, tokens] of Object.entries(CATEGORY_HINTS)) {
    if (slug === categorySlug) continue;
    const hit = tokens.some((t) => hay.includes(normalizeForModeration(t)));
    if (hit) {
      return {
        code: 'category_mismatch',
        severity: 'suspicious',
        field: 'title',
        message:
          'Seçtiğiniz kategori ile ilan başlığınız arasında uyumsuzluk olabilir. Lütfen kategori seçiminizi kontrol edin.',
      };
    }
  }
  return null;
}

function pushBlock(
  issues: ContentPolicyIssue[],
  issue: ContentPolicyIssue,
) {
  issues.push(issue);
}

/**
 * Critical quality checks after optional normalization.
 * Profanity message never echoes the matched term.
 */
export function validateListingQualityHard(input: {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
}): ContentPolicyIssue[] {
  const issues: ContentPolicyIssue[] = [];
  const fields: Array<{ key: ListingQualityField; value: string }> = [
    { key: 'title', value: input.title ?? '' },
    { key: 'shortDescription', value: input.shortDescription ?? '' },
    { key: 'longDescription', value: input.longDescription ?? '' },
  ];

  for (const { key, value } of fields) {
    if (!value.trim()) continue;

    if (findProfanity(value)) {
      pushBlock(issues, {
        code: 'profanity',
        severity: 'block',
        field: key,
        message:
          'İlanınızda uygun olmayan bir ifade bulundu. Lütfen metninizi düzenleyerek tekrar deneyin.',
      });
    }

    if (isMeaninglessContent(value)) {
      pushBlock(issues, {
        code: 'meaningless',
        severity: 'block',
        field: key,
        message:
          key === 'title'
            ? 'İlan başlığı anlamlı bir içerik içermelidir.'
            : 'İlan açıklaması anlamlı bir içerik içermelidir.',
      });
    }

    if (hasSpamRepetition(value) || hasExcessiveCaps(value)) {
      pushBlock(issues, {
        code: 'spam_repeat',
        severity: 'block',
        field: key,
        message:
          'Metinde aşırı tekrar veya spam görünümü tespit edildi. Lütfen düzenleyin.',
      });
    }

    if (key === 'title' && hasTitleEmojis(value)) {
      // Soft: titles get emoji stripped on normalize; if still present after normalize, block
      pushBlock(issues, {
        code: 'title_emoji',
        severity: 'block',
        field: 'title',
        message: 'Başlıkta emoji kullanılamaz.',
      });
    }

    if (key !== 'title' && hasExcessiveEmojis(value)) {
      pushBlock(issues, {
        code: 'spam_repeat',
        severity: 'block',
        field: key,
        message: 'Açıklamada aşırı emoji kullanımı profesyonel görünümü bozar. Lütfen azaltın.',
      });
    }
  }

  return issues;
}

export function buildListingQualitySuggestions(input: {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
}): ListingQualitySuggestion[] {
  const suggestions: ListingQualitySuggestion[] = [];

  const title = input.title ?? '';
  if (title.trim()) {
    const suggested = normalizeListingTitle(title);
    if (isMeaningfulTextCorrection(title, suggested)) {
      suggestions.push({
        field: 'title',
        original: title,
        suggested,
        message: 'İlan başlığınızı daha okunabilir hale getirdik.',
      });
    }
  }

  for (const field of ['shortDescription', 'longDescription'] as const) {
    const value = input[field] ?? '';
    if (!value.trim()) continue;
    const suggested = normalizeListingDescription(value);
    if (isMeaningfulTextCorrection(value, suggested)) {
      suggestions.push({
        field,
        original: value,
        suggested,
        message: 'Metniniz bazı yazım kurallarına göre düzenlendi.',
      });
    }
  }

  return suggestions;
}

export function evaluateListingContentQuality(input: {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  categorySlug?: string | null;
  /** When true, validate against normalized copies (publish path). */
  applyNormalization?: boolean;
}): ListingQualityResult {
  const rawTitle = input.title ?? '';
  const rawShort = input.shortDescription ?? '';
  const rawLong = input.longDescription ?? '';

  const normalized = {
    title: rawTitle.trim() ? normalizeListingTitle(rawTitle) : '',
    shortDescription: rawShort.trim() ? normalizeListingDescription(rawShort) : '',
    longDescription: rawLong.trim() ? normalizeListingDescription(rawLong) : '',
  };

  const suggestions = buildListingQualitySuggestions({
    title: rawTitle,
    shortDescription: rawShort,
    longDescription: rawLong,
  });

  const checkAgainst = input.applyNormalization
    ? normalized
    : {
        title: rawTitle,
        shortDescription: rawShort,
        longDescription: rawLong,
      };

  // For hard checks at publish: use normalized so emoji titles pass after strip
  const blocks = validateListingQualityHard(
    input.applyNormalization
      ? normalized
      : {
          // Still block raw profanity/meaningless even before normalize
          title: rawTitle,
          shortDescription: rawShort,
          longDescription: rawLong,
        },
  );

  // If not applying normalization yet, title emojis become suggestion not block
  const filteredBlocks = input.applyNormalization
    ? blocks
    : blocks.filter((b) => b.code !== 'title_emoji' && b.code !== 'title_case');

  // Re-check spam on normalized when applying
  const publishBlocks = input.applyNormalization
    ? validateListingQualityHard(normalized)
    : filteredBlocks;

  const warnings: ContentPolicyIssue[] = [];
  const mismatch = detectCategoryMismatch(input.categorySlug, checkAgainst.title || rawTitle);
  if (mismatch) warnings.push(mismatch);

  if (!input.applyNormalization && hasExcessiveEmojis(rawLong || rawShort)) {
    warnings.push({
      code: 'spam_repeat',
      severity: 'suspicious',
      field: 'longDescription',
      message: 'Açıklamada çok fazla emoji var; azaltmanızı öneririz.',
    });
  }

  const finalBlocks = input.applyNormalization ? publishBlocks : filteredBlocks;

  return {
    normalized,
    suggestions,
    blocks: finalBlocks,
    warnings,
    ok: finalBlocks.length === 0,
  };
}

/** Convenience aliases matching the product brief. */
export const normalizeTitle = normalizeListingTitle;
export const normalizeDescription = normalizeListingDescription;
export const validateMeaninglessContent = isMeaninglessContent;
export const validateProfanity = (text: string) => Boolean(findProfanity(text));
export const validateSpam = (text: string) =>
  hasSpamRepetition(text) || hasExcessiveCaps(text) || hasExcessiveEmojis(text);
export const validateListingContent = evaluateListingContentQuality;
