/**
 * Publish-time consent policy for all listing categories (phone-only contact V1).
 * Job-seeker CV consents remain in kvkk-consent-policy.ts.
 */

export const PUBLISH_CONSENT_VERSION = '2026-08-04';

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
    label: 'Aydınlatma metni onayı',
    description:
      'Kişisel verilerin işlenmesine ilişkin aydınlatma metnini okudum ve anladım.',
  },
  {
    key: 'phoneDisplay',
    label: 'Telefon paylaşım izni',
    description:
      'Doğrulanmış telefon numaramın bu ilanda iletişim amacıyla görüntülenmesine ve aranmasına izin veriyorum. Platform üzerinden mesajlaşma yoktur.',
  },
  {
    key: 'explicitConsent',
    label: 'Açık rıza onayı',
    description:
      'Kişisel verilerimin bu ilanın yayınlanması ve iletişim amacıyla işlenmesine açık rıza veriyorum.',
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
