/**
 * Publish-time consent policy for all listing categories (phone-primary contact).
 * Job-seeker CV consents remain in kvkk-consent-policy.ts.
 *
 * clarificationText = bilgilendirme (aydınlatma), not explicit consent.
 */

export const PUBLISH_CONSENT_VERSION = '2026-08-10';

export const PUBLISH_CONSENT_KEYS = [
  'clarificationText',
  'phoneDisplay',
  'explicitConsent',
] as const;

export type PublishConsentKey = (typeof PUBLISH_CONSENT_KEYS)[number];

export interface PublishConsentPolicyItem {
  key: PublishConsentKey;
  label: string;
  description: string;
}

export const PUBLISH_CONSENT_POLICY_ITEMS: readonly PublishConsentPolicyItem[] = [
  {
    key: 'clarificationText',
    label: 'Aydınlatma metni bilgilendirmesi',
    description:
      'KVKK aydınlatma metnini okudum. Bu bir bilgilendirmedir; açık rıza değildir.',
  },
  {
    key: 'phoneDisplay',
    label: 'Telefon görünürlüğü açık rızası',
    description:
      'Doğrulanmış telefon numaramın bu ilanda iletişim amacıyla görüntülenmesine ve aranmasına açık rıza veriyorum. Birincil iletişim telefon üzerindendir; platform içi mesajlaşma ürün yapılandırmasına bağlıdır.',
  },
  {
    key: 'explicitConsent',
    label: 'İlan yayınlama açık rızası',
    description:
      'İlanımın yayınlanması ve iletişim amacıyla belirtilen kişisel verilerimin işlenmesine açık rıza veriyorum. Rızamı geri çekebilirim.',
  },
] as const;

export type PublishConsentValues = Record<PublishConsentKey, boolean>;

export const EMPTY_PUBLISH_CONSENTS: PublishConsentValues = {
  clarificationText: false,
  phoneDisplay: false,
  explicitConsent: false,
};

export function normalizePublishConsents(
  value: Record<string, boolean> | null | undefined,
): PublishConsentValues {
  const next = { ...EMPTY_PUBLISH_CONSENTS };
  if (!value) return next;
  for (const key of PUBLISH_CONSENT_KEYS) {
    next[key] = value[key] === true;
  }
  return next;
}

export function areAllPublishConsentsAccepted(
  value: Record<string, boolean> | null | undefined,
): boolean {
  const normalized = normalizePublishConsents(value);
  return PUBLISH_CONSENT_KEYS.every((key) => normalized[key]);
}

export interface PublishConsentItemSnapshot extends PublishConsentPolicyItem {
  accepted: boolean;
}

export function buildPublishConsentItemSnapshots(
  value: Record<string, boolean> | null | undefined,
): PublishConsentItemSnapshot[] {
  const normalized = normalizePublishConsents(value);
  return PUBLISH_CONSENT_POLICY_ITEMS.map((item) => ({
    ...item,
    accepted: normalized[item.key],
  }));
}
