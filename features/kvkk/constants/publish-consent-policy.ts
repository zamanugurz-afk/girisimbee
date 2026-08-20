/**
 * Publish-time consent policy for all listing categories (phone-primary contact).
 * Job-seeker CV consents remain in kvkk-consent-policy.ts.
 *
 * clarificationText = bilgilendirme (aydınlatma), not explicit consent.
 */

export const PUBLISH_CONSENT_VERSION = '2026-08-20';

export const PUBLISH_CONSENT_KEYS = [
  'clarificationText',
  'phoneDisplay',
  'thirdPartyHrSharing',
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
    label: 'Telefon ve iletişim açık rızası',
    description:
      'Doğrulanmış telefon numaramın bu ilanda iletişim amacıyla kullanılmasına ve iletişime geçilmesine açık rıza veriyorum.',
  },
  {
    key: 'thirdPartyHrSharing',
    label: '3. Taraf İK profesyonelleri ve işverenlerle paylaşım açık rızası',
    description:
      'Özgeçmişimin, kariyer profilimin ve iletişim bilgilerimin iş fırsatlarının değerlendirilmesi ve uygun pozisyonlarla eşleştirilmem amacıyla 3. taraf işverenler, kurumsal insan kaynakları profesyonelleri ve yetkili istihdam danışmanları ile paylaşılmasına açık rıza veriyorum.',
  },
  {
    key: 'explicitConsent',
    label: 'İlan yayınlama ve kullanıcı sözleşmesi onayı',
    description:
      'İlanımın yayınlanması ve kişisel verilerimin belirtilen amaçlarla işlenmesine açık rıza veriyor, kullanıcı sözleşmesini kabul ediyorum.',
  },
] as const;

export type PublishConsentValues = Record<PublishConsentKey, boolean>;

export const EMPTY_PUBLISH_CONSENTS: PublishConsentValues = {
  clarificationText: false,
  phoneDisplay: false,
  thirdPartyHrSharing: false,
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
