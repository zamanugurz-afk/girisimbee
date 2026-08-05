/**
 * MVP product strategy: free ecosystem, no monetization.
 * Set to true when premium features are ready to launch.
 */
export const ENABLE_PREMIUM = false;

export function isPremiumEnabled(): boolean {
  return ENABLE_PREMIUM;
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
