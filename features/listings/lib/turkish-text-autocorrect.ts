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
  urunu: 'ürünü',
  urunumuz: 'ürünümüz',
  urunler: 'ürünler',
  urunlerimiz: 'ürünlerimiz',
  sirket: 'şirket',
  sirketimiz: 'şirketimiz',
  sirketimizde: 'şirketimizde',
  isletme: 'işletme',
  isbirligi: 'işbirliği',
  isbirliği: 'işbirliği',
  girisim: 'girişim',
  girisimi: 'girişimi',
  girisimimiz: 'girişimimiz',
  girisimimize: 'girişimimize',
  girisimci: 'girişimci',
  yatirim: 'yatırım',
  yatirimi: 'yatırımı',
  yatirimimiz: 'yatırımımız',
  yatirimci: 'yatırımcı',
  yatirimcilar: 'yatırımcılar',
  ortalik: 'ortaklık',
  ortaklik: 'ortaklık',
  ortakligimiz: 'ortaklığımız',
  ortagimiz: 'ortağımız',
  basvuru: 'başvuru',
  basvurun: 'başvurun',
  deneyim: 'deneyim',
  tecrube: 'tecrübe',
  mucsteri: 'müşteri',
  musteri: 'müşteri',
  musteriler: 'müşteriler',
  musterilerimiz: 'müşterilerimiz',
  musterilerimize: 'müşterilerimize',
  kazanc: 'kazanç',
  karlı: 'kârlı',
  karlilik: 'kârlılık',
  guvenilir: 'güvenilir',
  guvenli: 'güvenli',
  guvenlik: 'güvenlik',
  ozellik: 'özellik',
  ozellikler: 'özellikler',
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
  sektorunde: 'sektöründe',
  sektorundeki: 'sektöründeki',
  teknoloji: 'teknoloji',
  teknolojimiz: 'teknolojimiz',
  teknolojik: 'teknolojik',
  gelistirme: 'geliştirme',
  gelistiriyoruz: 'geliştiriyoruz',
  olusturma: 'oluşturma',
  olusturuyoruz: 'oluşturuyoruz',
  buyuyoruz: 'büyüyoruz',
  hedefliyoruz: 'hedefliyoruz',
  bekliyoruz: 'bekliyoruz',
  uretiyoruz: 'üretiyoruz',
  saglamak: 'sağlamak',
  saglayacak: 'sağlayacak',
  degerlendiriyoruz: 'değerlendiriyoruz',
  asama: 'aşama',
  asamasi: 'aşaması',
  asamasinda: 'aşamasında',
  asamasindayiz: 'aşamasındayız',
  firmamiz: 'firmamız',
  firmamizda: 'firmamızda',
  firmamizdan: 'firmamızdan',
  projemiz: 'projemiz',
  projemizde: 'projemizde',
  projemizi: 'projemizi',
  ekip: 'ekip',
  ekibimiz: 'ekibimiz',
  ekibimize: 'ekibimize',
  vizyon: 'vizyon',
  vizyonumuz: 'vizyonumuz',
  misyon: 'misyon',
  misyonumuz: 'misyonumuz',
  hizmet: 'hizmet',
  hizmetler: 'hizmetler',
  hizmetlerimiz: 'hizmetlerimiz',
  cozum: 'çözüm',
  cozumleri: 'çözümleri',
  cozumler: 'çözümler',
  cozumlerimiz: 'çözümlerimiz',
  platformumuz: 'platformumuz',
  ariyoruz: 'arıyoruz',
  ariyor: 'arıyor',
  istanbul: 'İstanbul',
  istanbulda: "İstanbul'da",
  istanbula: "İstanbul'a",
  ankara: 'Ankara',
  ankarada: "Ankara'da",
  izmir: 'İzmir',
  izmirde: "İzmir'de",
  turkiye: 'Türkiye',
  turkiyede: "Türkiye'de",
  turkiyenin: "Türkiye'nin",
};

const KNOWN_ACRONYMS_AND_TERMS: Record<string, string> = {
  mvp: 'MVP',
  ai: 'AI',
  saas: 'SaaS',
  b2b: 'B2B',
  b2c: 'B2C',
  d2c: 'D2C',
  api: 'API',
  cto: 'CTO',
  ceo: 'CEO',
  cfo: 'CFO',
  coo: 'COO',
  cmo: 'CMO',
  cpo: 'CPO',
  ml: 'ML',
  llm: 'LLM',
  aws: 'AWS',
  gcp: 'GCP',
  pos: 'POS',
  ui: 'UI',
  ux: 'UX',
  'ui/ux': 'UI/UX',
  seo: 'SEO',
  sem: 'SEM',
  hr: 'HR',
  ik: 'İK',
  sql: 'SQL',
  php: 'PHP',
  css: 'CSS',
  html: 'HTML',
  pmp: 'PMP',
  qa: 'QA',
  kosgeb: 'KOSGEB',
  tübitak: 'TÜBİTAK',
  tubitak: 'TÜBİTAK',
  tl: 'TL',
  usd: 'USD',
  eur: 'EUR',
  kobi: 'KOBİ',
  erp: 'ERP',
  crm: 'CRM',
  roi: 'ROI',
  cac: 'CAC',
  ltv: 'LTV',
  arr: 'ARR',
  mrr: 'MRR',
  sdk: 'SDK',
  devops: 'DevOps',
  nosql: 'NoSQL',
  fintech: 'FinTech',
  edtech: 'EdTech',
  healthtech: 'HealthTech',
  iot: 'IoT',
  ios: 'iOS',
  android: 'Android',
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const VALID_DOUBLE_CONSONANT_STEMS = new Set([
  'madde', 'cadde', 'ciddi', 'kuvvet', 'şiddet', 'millet', 'cennet', 'lezzet',
  'hürriyet', 'bakkal', 'tüccar', 'hassas', 'şeffaf', 'ittifak', 'istatistik',
  'teşekkür', 'dikkat', 'hakkı', 'hissi', 'zammı', 'affı', 'sırrı', 'hattı',
  'tıbbı', 'reddi', 'hazzı', 'zannı', 'külli', 'elli', 'belli', 'maddi',
]);

/**
 * Trim stutter / double consonants at the end of words or inside Turkish suffixes.
 * E.g. "aşamasındadd" → "aşamasında", "firmamızz" → "firmamız", "girisimimizze" → "girisimimize".
 */
export function fixTurkishConsonantStutters(input: string): string {
  if (!input) return input;

  let text = input;

  // 1. Suffix ending with extra consonant stutters (e.g. aşamasındadd → aşamasında, projemizdedd → projemizde)
  text = text.replace(
    /(\p{L}+(?:da|de|ta|te|nda|nde|na|ne|ya|ye|la|le|dan|den|tan|ten|ndan|nden|ca|ce|ça|çe))([bcçdfgğhjklmnprsştvyz])\2+\b/giu,
    '$1',
  );

  // 2. Double consonants before single vowel suffix (e.g. girisimimizze → girisimimize, olanlarra → olanlara)
  text = text.replace(
    /(\p{L}{2,})([bcçdfgğhjklmnprsştvyz])\2([aeıioöuü])\b/giu,
    (match, prefix, char, vowel) => {
      const lower = match.toLocaleLowerCase('tr-TR');
      if (VALID_DOUBLE_CONSONANT_STEMS.has(lower)) return match;
      return `${prefix}${char}${vowel}`;
    },
  );

  // 3. Trailing double consonant at end of word (e.g. firmamızz → firmamız, yatırımm → yatırım, içinn → için)
  text = text.replace(
    /(\p{L}+[aeıioöuü][bcçdfgğhjklmnprsştvyz]*?)([bcçdfgğhjklmnprsştvyz])\2+\b/giu,
    (full, stem: string, consonant: string) => {
      if (stem.length < 2) return full;
      return `${stem}${consonant}`;
    },
  );

  return text;
}

/**
 * Normalize acronyms and known industry terms into their canonical case.
 * E.g. "Mvp" → "MVP", "saas" → "SaaS", "b2b'ye" → "B2B'ye".
 */
export function normalizeAcronymsAndTerms(input: string): string {
  let result = input;
  const entries = Object.entries(KNOWN_ACRONYMS_AND_TERMS).sort((a, b) => b[0].length - a[0].length);

  for (const [key, canonical] of entries) {
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegExp(key)})(?=['’‘][\\p{L}]+|[^\\p{L}\\p{N}]|$)`, 'giu');
    result = result.replace(re, (full, prefix: string) => `${prefix}${canonical}`);
  }
  return result;
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
  next = fixTurkishConsonantStutters(next);
  next = applyCommonTurkishTypos(next);
  next = normalizeAcronymsAndTerms(next);

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

