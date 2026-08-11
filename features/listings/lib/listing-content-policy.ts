/**
 * Listing content policy — formatting, spam, contact leaks, competitors, profanity.
 * Hard blocks reject the form. Soft "suspicious" flags feed the admin review queue.
 * Profanity terms come from admin-managed mock store (with built-in defaults).
 */

import {
  getActiveProfanityTerms,
} from '@/features/admin/content-policy/mock/profanity-words.mock';

/** Turkish title case: "martı döner ortak arıyor" → "Martı Döner Ortak Arıyor" */
export function toTurkishTitleCase(input: string): string {
  // Prefer quality layer (whitelist + small words) when available — inline fallback keeps policy pure.
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLocaleLowerCase('tr-TR');
      if (!lower) return lower;
      const small = new Set(['ve', 'veya', 'ile', 'için', 'de', 'da', 'ki']);
      const whitelist: Record<string, string> = {
        ai: 'AI',
        api: 'API',
        saas: 'SaaS',
        b2b: 'B2B',
        b2c: 'B2C',
        crm: 'CRM',
        erp: 'ERP',
        iot: 'IoT',
        nft: 'NFT',
        web3: 'Web3',
        fintech: 'FinTech',
        linkedin: 'LinkedIn',
        openai: 'OpenAI',
        chatgpt: 'ChatGPT',
        iphone: 'iPhone',
        kobi: 'KOBİ',
      };
      if (whitelist[lower]) return whitelist[lower];
      if (index > 0 && small.has(lower)) return lower;
      return lower.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
    })
    .join(' ');
}

export function isTurkishTitleCase(input: string): boolean {
  const normalized = input.trim().replace(/\s+/g, ' ');
  if (!normalized) return false;
  return normalized === toTurkishTitleCase(normalized);
}

/** Collapse common obfuscation for matching. */
export function normalizeForModeration(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[@]/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/[^a-z0-9ğüşıöç\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const NSFW_FILENAME_HINTS = [
  'porn',
  'porno',
  'xxx',
  'nude',
  'naked',
  'nsfw',
  'sex',
  'erotik',
  'escort',
  'onlyfans',
] as const;

const COMPETITOR_TERMS = [
  'sahibinden',
  'letgo',
  'hepsiemlak',
  'emlakjet',
  'hurriyetemlak',
  'arabam com',
  'arabam.com',
  'linkedin üzerinden yazin',
  'instagramdan yazin',
  'ig den yazin',
] as const;

const CALL_ME_RE =
  /\b(?:beni\s*ara|ara\s*beni|numaram|numarami|whats?app(?:'?tan)?\s*(?:yaz|ara)|wp\s*(?:yaz|ara|hat)|telegram(?:'?dan)?\s*yaz|dm\s*(?:at|yaz)|mesaj\s*at(?:ın|in)?|özelden\s*yaz|dışarıdan\s*(?:ara|yaz))\b/i;

const EMAIL_RE =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const PHONE_RE =
  /(?:\+90[\s\-.]*)?0?5\d{2}[\s\-.]?\d{3}[\s\-.]?\d{2}[\s\-.]?\d{2}\b|(?:\+90[\s\-.]*)?0[2-4]\d{2}[\s\-.]?\d{3}[\s\-.]?\d{2}[\s\-.]?\d{2}\b/;

const URL_RE =
  /(?:https?:\/\/|www\.)[^\s]+|(?:t\.me|wa\.me|bit\.ly|tinyurl\.com)\/[^\s]+/i;

const SOCIAL_HANDLE_RE =
  /(?:^|\s)@[a-zA-Z0-9._]{3,}\b/;

/** Min image constraints (client-side). */
export const LISTING_IMAGE_MIN_WIDTH = 640;
export const LISTING_IMAGE_MIN_HEIGHT = 360;
/** Allowed aspect ratio band (width / height). */
export const LISTING_IMAGE_MIN_ASPECT = 0.5;
export const LISTING_IMAGE_MAX_ASPECT = 2.6;

export type ContentPolicyIssueCode =
  | 'title_case'
  | 'excessive_caps'
  | 'spam_repeat'
  | 'profanity'
  | 'contact_email'
  | 'contact_phone'
  | 'contact_url'
  | 'contact_social'
  | 'competitor'
  | 'call_me'
  | 'duplicate'
  | 'unsafe_image_name'
  | 'image_dimensions'
  | 'meaningless'
  | 'title_emoji'
  | 'category_mismatch';

export type ContentPolicySeverity = 'block' | 'suspicious';

export interface ContentPolicyIssue {
  code: ContentPolicyIssueCode;
  message: string;
  severity: ContentPolicySeverity;
  field?: 'title' | 'shortDescription' | 'longDescription' | 'images' | 'tags';
}

export function findProfanity(text: string, terms?: string[]): string | null {
  const list = terms ?? getActiveProfanityTerms();
  const normalized = ` ${normalizeForModeration(text)} `;
  for (const term of list) {
    const needle = normalizeForModeration(term);
    if (!needle) continue;
    if (needle.length <= 3) {
      if (normalized.includes(` ${needle} `)) return term.trim();
      continue;
    }
    if (normalized.includes(` ${needle} `) || normalized.includes(needle)) {
      return term.trim();
    }
  }
  return null;
}

export function hasExcessiveCaps(text: string): boolean {
  const letters = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿĞğÜüŞşİıÖöÇç]/g, '');
  if (letters.length < 8) return false;
  const upper = letters.replace(/[^A-ZĞÜŞİÖÇ]/g, '').length;
  return upper / letters.length >= 0.7;
}

export function hasSpamRepetition(text: string): boolean {
  if (/(.)\1{4,}/u.test(text)) return true;
  if (/([!?.]){4,}/.test(text)) return true;
  // Case-insensitive word spam: "Yatırım yatırım yatırım yatırım"
  if (/(\b[\p{L}\p{N}]+\b)(?:\s+\1){3,}/iu.test(text)) return true;
  return false;
}

export function findCompetitorMention(text: string): string | null {
  const normalized = normalizeForModeration(text);
  for (const term of COMPETITOR_TERMS) {
    if (normalized.includes(normalizeForModeration(term))) return term;
  }
  return null;
}

export function findContactLeaks(text: string): ContentPolicyIssue[] {
  const issues: ContentPolicyIssue[] = [];
  if (!text.trim()) return issues;

  if (EMAIL_RE.test(text)) {
    issues.push({
      code: 'contact_email',
      severity: 'block',
      message: 'Açıklamada e-posta adresi paylaşmayın. İletişim platform üzerinden yapılmalıdır.',
    });
  }
  if (PHONE_RE.test(text)) {
    issues.push({
      code: 'contact_phone',
      severity: 'block',
      message: 'Açıklamada telefon numarası paylaşmayın. İletişim platform üzerinden yapılmalıdır.',
    });
  }
  if (URL_RE.test(text)) {
    issues.push({
      code: 'contact_url',
      severity: 'block',
      message: 'Açıklamada dış bağlantı paylaşmayın.',
    });
  }
  if (SOCIAL_HANDLE_RE.test(text)) {
    issues.push({
      code: 'contact_social',
      severity: 'block',
      message: 'Açıklamada sosyal medya kullanıcı adı (@…) paylaşmayın.',
    });
  }
  if (CALL_ME_RE.test(text)) {
    issues.push({
      code: 'call_me',
      severity: 'block',
      message: '“Beni ara / WhatsApp yaz” gibi platform dışı iletişim kalıpları kullanılamaz.',
    });
  }
  return issues;
}

export function assertSafeListingImageName(fileName: string): ContentPolicyIssue | null {
  const normalized = normalizeForModeration(fileName);
  for (const hint of NSFW_FILENAME_HINTS) {
    if (normalized.includes(hint)) {
      return {
        code: 'unsafe_image_name',
        severity: 'block',
        field: 'images',
        message:
          'Görsel adı uygunsuz içerik izlenimi veriyor. Lütfen başka bir görsel yükleyin.',
      };
    }
  }
  return null;
}

export function assertListingImageDimensions(
  width: number,
  height: number,
): ContentPolicyIssue | null {
  if (width < LISTING_IMAGE_MIN_WIDTH || height < LISTING_IMAGE_MIN_HEIGHT) {
    return {
      code: 'image_dimensions',
      severity: 'block',
      field: 'images',
      message: `Görsel en az ${LISTING_IMAGE_MIN_WIDTH}×${LISTING_IMAGE_MIN_HEIGHT} piksel olmalıdır.`,
    };
  }
  const aspect = width / height;
  if (aspect < LISTING_IMAGE_MIN_ASPECT || aspect > LISTING_IMAGE_MAX_ASPECT) {
    return {
      code: 'image_dimensions',
      severity: 'block',
      field: 'images',
      message: 'Görsel oranı çok dar veya çok geniş. Daha dengeli bir görsel yükleyin.',
    };
  }
  return null;
}

export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Görsel okunamadı'));
    };
    img.src = url;
  });
}

function pushTextQualityIssues(
  text: string,
  field: ContentPolicyIssue['field'],
  issues: ContentPolicyIssue[],
) {
  if (hasExcessiveCaps(text)) {
    issues.push({
      code: 'excessive_caps',
      severity: 'block',
      field,
      message: 'Metinde aşırı büyük harf kullanımı yasaktır (ör. HEPSİ BÜYÜK).',
    });
  }
  if (hasSpamRepetition(text)) {
    issues.push({
      code: 'spam_repeat',
      severity: 'block',
      field,
      message: 'Tekrarlayan karakter veya kelime spam’i kullanılamaz (ör. !!!!, aaaaa).',
    });
  }
  const competitor = findCompetitorMention(text);
  if (competitor) {
    issues.push({
      code: 'competitor',
      severity: 'suspicious',
      field,
      message: 'Rakip platform veya dış kanal referansı şüpheli olarak işaretlendi.',
    });
  }
}

export function validateListingTitle(title: string): ContentPolicyIssue[] {
  const issues: ContentPolicyIssue[] = [];
  const trimmed = title.trim();
  if (!trimmed) return issues;

  // Title-case mismatches are soft: blur suggests + publish normalizes.
  // Still block extreme ALL CAPS / spam / profanity here.
  pushTextQualityIssues(trimmed, 'title', issues);

  const bad = findProfanity(trimmed);
  if (bad) {
    issues.push({
      code: 'profanity',
      severity: 'block',
      field: 'title',
      message:
        'İlanınızda uygun olmayan bir ifade bulundu. Lütfen metninizi düzenleyerek tekrar deneyin.',
    });
  }

  issues.push(
    ...findContactLeaks(trimmed).map((issue) => ({ ...issue, field: 'title' as const })),
  );

  return issues;
}

export function validateListingTextBody(
  text: string,
  field: 'shortDescription' | 'longDescription' | 'tags',
): ContentPolicyIssue[] {
  const issues: ContentPolicyIssue[] = [];
  if (!text.trim()) return issues;

  pushTextQualityIssues(text, field, issues);

  const bad = findProfanity(text);
  if (bad) {
    issues.push({
      code: 'profanity',
      severity: 'block',
      field,
      message:
        'İlanınızda uygun olmayan bir ifade bulundu. Lütfen metninizi düzenleyerek tekrar deneyin.',
    });
  }

  issues.push(...findContactLeaks(text).map((issue) => ({ ...issue, field })));
  return issues;
}

/** Fingerprint for duplicate detection (title + short description). */
export function listingTextFingerprint(title: string, shortDescription: string): string {
  return normalizeForModeration(`${title} ${shortDescription}`);
}

export function validateListingContentPolicy(input: {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  tags?: string[];
  imageFileNames?: string[];
  /** Existing fingerprints to compare for duplicates (same owner / platform). */
  existingFingerprints?: string[];
}): ContentPolicyIssue[] {
  const issues: ContentPolicyIssue[] = [];

  if (input.title) issues.push(...validateListingTitle(input.title));
  if (input.shortDescription) {
    issues.push(...validateListingTextBody(input.shortDescription, 'shortDescription'));
  }
  if (input.longDescription) {
    issues.push(...validateListingTextBody(input.longDescription, 'longDescription'));
  }
  if (input.tags?.length) {
    issues.push(...validateListingTextBody(input.tags.join(' '), 'tags'));
  }
  for (const name of input.imageFileNames ?? []) {
    const hit = assertSafeListingImageName(name);
    if (hit) issues.push(hit);
  }

  if (
    input.title &&
    input.shortDescription &&
    input.existingFingerprints?.length
  ) {
    const fp = listingTextFingerprint(input.title, input.shortDescription);
    if (fp.length >= 24 && input.existingFingerprints.includes(fp)) {
      issues.push({
        code: 'duplicate',
        severity: 'block',
        field: 'title',
        message: 'Aynı başlık ve açıklamaya sahip bir ilan zaten mevcut.',
      });
    }
  }

  return issues;
}

export function contentPolicyIssuesToFieldErrors(
  issues: ContentPolicyIssue[],
  options?: { includeSuspicious?: boolean },
): Record<string, string> {
  const includeSuspicious = options?.includeSuspicious ?? false;
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    if (issue.severity === 'suspicious' && !includeSuspicious) continue;
    const key =
      issue.field === 'title'
        ? 'title'
        : issue.field === 'shortDescription'
          ? 'shortDescription'
          : issue.field === 'longDescription'
            ? 'longDescription'
            : issue.field === 'images'
              ? 'images'
              : issue.field === 'tags'
                ? 'tags'
                : 'title';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function collectSuspiciousFlags(issues: ContentPolicyIssue[]): ContentPolicyIssueCode[] {
  return [...new Set(issues.filter((i) => i.severity === 'suspicious').map((i) => i.code))];
}
