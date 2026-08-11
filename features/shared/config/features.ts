/**
 * Monetization readiness.
 *
 * - ENABLE_PREMIUM: shows package UI (Standart / Vitrin / Acil + paid categories).
 * - PREMIUM_LIVE_PAYMENTS: when false (default), package payment auto-passes via
 *   client simulation so QA can publish without a PSP.
 *   Set NEXT_PUBLIC_PREMIUM_LIVE_PAYMENTS=true when iyzico/etc is wired.
 */
export const ENABLE_PREMIUM = true;

export function isPremiumEnabled(): boolean {
  return ENABLE_PREMIUM;
}

/** Real checkout — keep false until payment provider is live. */
export const PREMIUM_LIVE_PAYMENTS =
  process.env.NEXT_PUBLIC_PREMIUM_LIVE_PAYMENTS === 'true';

export function isPremiumLivePayments(): boolean {
  return PREMIUM_LIVE_PAYMENTS;
}

export const PREMIUM_NAV_LABELS = ['Fiyatlandırma', 'Paketler', 'Premium'] as const;
export const PREMIUM_FOOTER_LABELS = ['Fiyatlandırma', 'Paketler', 'Premium'] as const;

export function filterPremiumLabels<T extends string>(labels: readonly T[]): T[] {
  if (isPremiumEnabled()) return [...labels];
  const blocked = new Set<string>(PREMIUM_FOOTER_LABELS);
  return labels.filter((label) => !blocked.has(label));
}

export const MVP_COPY = {
  communicationNote:
    'İlan sahipleriyle iletişim telefon üzerinden yapılır — platform içi mesajlaşma yoktur.',
  joinCta: 'Ücretsiz Katıl',
  postCta: 'İlan Ver',
} as const;
