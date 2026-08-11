/**
 * Deterministic Turkish text auto-correction for listing fields.
 * Safe typography + common spelling fixes — not full grammar NLP.
 */

import { toTurkishTitleCase } from '@/features/listings/lib/listing-content-policy';

/** High-confidence common misspellings → correct form (lowercase keys). */
const COMMON_TYPO_MAP: Record<string, string> = {
  degil: 'değil',
  degıl: 'değil',
  icin: 'için',
  ıcin: 'için',
  seyi: 'şeyi',
  seyin: 'şeyin',
  sey: 'şey',
  suanki: 'şuanki',
  'su an': 'şu an',
  herkez: 'herkes',
  herkeş: 'herkes',
  yalniz: 'yalnız',
  yalnizca: 'yalnızca',
  yanliz: 'yalnız',
  yanlız: 'yalnız',
  calisma: 'çalışma',
  calisiyoruz: 'çalışıyoruz',
  calisan: 'çalışan',
  goster: 'göster',
  gosteren: 'gösteren',
  dusuk: 'düşük',
  yuksek: 'yüksek',
  buyume: 'büyüme',
  buyuk: 'büyük',
  kucuk: 'küçük',
  urun: 'ürün',
  urunler: 'ürünler',
  sirket: 'şirket',
  sirketimiz: 'şirketimiz',
  isletme: 'işletme',
  isbirligi: 'işbirliği',
  isbirliği: 'işbirliği',
  girisim: 'girişim',
  girisimci: 'girişimci',
  yatirim: 'yatırım',
  yatirimci: 'yatırımcı',
  ortalik: 'ortaklık',
  ortaklik: 'ortaklık',
  basvuru: 'başvuru',
  basvurun: 'başvurun',
  deneyim: 'deneyim',
  tecrube: 'tecrübe',
  mucsteri: 'müşteri',
  musteri: 'müşteri',
  musteriler: 'müşteriler',
  kazanc: 'kazanç',
  karlı: 'kârlı',
  karlilik: 'kârlılık',
  guvenilir: 'güvenilir',
  guvenli: 'güvenli',
  ozellik: 'özellik',
  ozellikle: 'özellikle',
  onemli: 'önemli',
  oncelik: 'öncelik',
  iletisim: 'iletişim',
  iletisime: 'iletişime',
  basari: 'başarı',
  basarili: 'başarılı',
  firsat: 'fırsat',
  firsatlar: 'fırsatlar',
  imkan: 'imkân',
  imkanlar: 'imkânlar',
  sektor: 'sektör',
  sektorde: 'sektörde',
  teknolojimiz: 'teknolojimiz',
  gelistirme: 'geliştirme',
  gelistiriyoruz: 'geliştiriyoruz',
  olusturma: 'oluşturma',
  olusturuyoruz: 'oluşturuyoruz',
  istanbul: 'İstanbul',
  istanbulda: "İstanbul'da",
  istanbula: "İstanbul'a",
  ankara: 'Ankara',
  ankarada: "Ankara'da",
  izmir: 'İzmir',
  izmirde: "İzmir'de",
  turkiye: 'Türkiye',
  turkiyede: "Türkiye'de",
  ariyoruz: 'arıyoruz',
  ariyor: 'arıyor',
  yatirimcilar: 'yatırımcılar',
  girisimimize: 'girişimimize',
  platformumuz: 'platformumuz',
  cozum: 'çözüm',
  cozumleri: 'çözümleri',
  cozumler: 'çözümler',
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Collapse whitespace, normalize quotes/dashes, trim. */
export function normalizeTurkishTypography(input: string): string {
  return input
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])(?!\s|$)/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Apply common typo map with word boundaries (case-aware). */
export function applyCommonTurkishTypos(input: string): string {
  let result = input;
  const entries = Object.entries(COMMON_TYPO_MAP).sort((a, b) => b[0].length - a[0].length);

  for (const [wrong, right] of entries) {
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegExp(wrong)})(?=[^\\p{L}\\p{N}]|$)`, 'giu');
    result = result.replace(re, (full, prefix: string, matched: string) => {
      const corrected = matchCase(matched, right);
      return `${prefix}${corrected}`;
    });
  }
  return result;
}

function matchCase(source: string, target: string): string {
  if (!source) return target;
  if (source === source.toLocaleUpperCase('tr-TR') && source.length > 1) {
    return target.toLocaleUpperCase('tr-TR');
  }
  if (source[0] === source[0].toLocaleUpperCase('tr-TR')) {
    return target.charAt(0).toLocaleUpperCase('tr-TR') + target.slice(1);
  }
  return target;
}

/** Capitalize sentence starts after . ! ? and newlines. */
export function toTurkishSentenceCase(input: string): string {
  const text = input.trim();
  if (!text) return text;

  return text.replace(/(^|[.!?…]\s+|\n+)(\p{L})/gu, (full, boundary: string, letter: string) => {
    return `${boundary}${letter.toLocaleUpperCase('tr-TR')}`;
  });
}

export type TurkishAutoCorrectMode = 'title' | 'body';

/**
 * Auto-correct listing text for Turkish writing conventions.
 * Prefer listing-content-quality.normalizeListingTitle / normalizeListingDescription for full pipeline.
 * - title: typography + typos + Title Case
 * - body: typography + typos + sentence case
 */
export function autoCorrectTurkishText(
  input: string,
  mode: TurkishAutoCorrectMode = 'body',
): string {
  if (!input.trim()) return input.trim();

  let next = normalizeTurkishTypography(input);
  next = next
    .replace(/!{2,}/g, '!')
    .replace(/\?{2,}/g, '?')
    .replace(/\.{4,}/g, '...')
    .replace(/(\p{L})\1{2,}/gu, '$1$1');
  next = applyCommonTurkishTypos(next);

  if (mode === 'title') {
    return toTurkishTitleCase(next).replace(/[.!…,;:]+$/g, '').trim();
  }

  next = toTurkishSentenceCase(next);
  if (/\p{L}/u.test(next) && !/[.!?…]"?$/.test(next)) {
    next = `${next}.`;
  }
  return next.trim();
}

export function didAutoCorrectChange(before: string, after: string): boolean {
  return before.trim() !== after.trim();
}

/**
 * Collapse whitespace + NFC + drop trailing sentence punctuation so we can
 * ignore cosmetic-only "corrections" (e.g. only adding a final period).
 */
export function stripCosmeticTextDelta(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?…]+$/u, '');
}

/**
 * True when the normalized suggestion changes wording/casing/typos — not just
 * trailing punctuation or invisible whitespace.
 */
export function isMeaningfulTextCorrection(before: string, after: string): boolean {
  if (before === after) return false;
  if (before.trim() === after.trim()) return false;
  return stripCosmeticTextDelta(before) !== stripCosmeticTextDelta(after);
}

