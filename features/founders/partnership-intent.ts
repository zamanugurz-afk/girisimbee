/**
 * Partnership browse/create intent — stored in listing.customFields.partnershipIntent.
 * Missing or unknown values resolve to seeking (legacy Ortak Arıyorum listings).
 */
export const PARTNERSHIP_INTENTS = ['seeking', 'joining'] as const;

export type PartnershipIntent = (typeof PARTNERSHIP_INTENTS)[number];

export const DEFAULT_PARTNERSHIP_INTENT: PartnershipIntent = 'seeking';

export const PARTNERSHIP_INTENT_QUERY = 'intent';

export type PartnershipIntentSource = {
  customFields?: Record<string, unknown> | null;
  partnershipIntent?: unknown;
} | null | undefined;

export function isPartnershipIntent(value: unknown): value is PartnershipIntent {
  return value === 'seeking' || value === 'joining';
}

export function parsePartnershipIntentParam(value: unknown): PartnershipIntent | undefined {
  return isPartnershipIntent(value) ? value : undefined;
}

/** Canonical resolver — use this everywhere instead of reading customFields directly. */
export function resolvePartnershipIntent(source?: PartnershipIntentSource): PartnershipIntent {
  if (!source) return DEFAULT_PARTNERSHIP_INTENT;
  if (isPartnershipIntent(source.partnershipIntent)) return source.partnershipIntent;
  const stored = source.customFields?.partnershipIntent;
  return isPartnershipIntent(stored) ? stored : DEFAULT_PARTNERSHIP_INTENT;
}

export function partnershipBrowseHref(intent: PartnershipIntent = DEFAULT_PARTNERSHIP_INTENT): string {
  return `/partners?${PARTNERSHIP_INTENT_QUERY}=${intent}`;
}

export function partnershipCreateHref(intent: PartnershipIntent = DEFAULT_PARTNERSHIP_INTENT): string {
  return `/ilan/olustur?category=ortak-bul&${PARTNERSHIP_INTENT_QUERY}=${intent}`;
}

export function partnershipIntentLabel(intent: PartnershipIntent): string {
  return intent === 'joining' ? 'Ortak Olmak İstiyorum' : 'Ortak Arıyorum';
}

export function partnershipDetailHeadline(intent: PartnershipIntent): string {
  return intent === 'joining'
    ? 'Bu kullanıcı bir girişime ortak olmak istiyor.'
    : 'Bu girişim bir ortak arıyor.';
}

export function partnershipBrowseCopy(intent: PartnershipIntent) {
  if (intent === 'joining') {
    return {
      title: partnershipIntentLabel(intent),
      description: 'Bir girişime ortak olmak isteyen profilleri inceleyin.',
      seoTitle: 'Ortak Olmak İstiyorum | Girisimbee',
      seoDescription: 'Uzmanlığını sunan ortaklık profillerini keşfedin.',
      emptyTitle: 'Henüz size uygun bir ortaklık profili bulamadık.',
      emptyDescription: 'Yayınlanan profiller burada listelenir.',
      emptyCtaLabel: 'Profilimi yayınla',
      resultNoun: 'profil',
    };
  }
  return {
    title: partnershipIntentLabel(intent),
    description: 'Girişimi için ortak arayan ilanları inceleyin.',
    seoTitle: 'Ortak Arıyorum — Ortaklık İlanları | Girisimbee',
    seoDescription: 'Kurucu ortak ve iş ortaklığı fırsatları.',
    emptyTitle: 'Henüz yayınlanmış bir ortaklık fırsatı bulunmuyor.',
    emptyDescription: 'Yayınlanan ortaklık ilanları burada listelenir.',
    emptyCtaLabel: 'Ortaklık ilanı oluştur',
    resultNoun: 'ilan',
  };
}

export function partnershipCreatePageCopy(intent: PartnershipIntent) {
  if (intent === 'joining') {
    return {
      title: partnershipIntentLabel(intent),
      description: 'Uzmanlığınızı sunun, size uygun girişimlerle buluşun.',
    };
  }
  return {
    title: partnershipIntentLabel(intent),
    description: 'Girişiminiz için doğru ortağı bulun.',
  };
}
