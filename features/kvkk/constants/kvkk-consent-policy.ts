/** Current KVKK consent policy version — bump when copy/legal text changes. */
export const KVKK_CONSENT_VERSION = '2026-08-10';

export const KVKK_CONSENT_KEYS = [
  'cvSharing',
  'thirdPartySharing',
  'employerSharing',
  'clarificationText',
  'explicitConsent',
] as const;

export type KvkkConsentKey = (typeof KVKK_CONSENT_KEYS)[number];

export interface KvkkConsentPolicyItem {
  key: KvkkConsentKey;
  label: string;
  description: string;
}

/** Canonical consent copy shown in UI and frozen into audit snapshots. */
export const KVKK_CONSENT_POLICY_ITEMS: readonly KvkkConsentPolicyItem[] = [
  {
    key: 'cvSharing',
    label: 'CV paylaşım açık rızası',
    description:
      'Özgeçmişimin ilgili ilan sahipleri tarafından görüntülenmesine açık rıza veriyorum. CV’de özel nitelikli kişisel veri paylaşmamaya özen göstereceğimi biliyorum.',
  },
  {
    key: 'thirdPartySharing',
    label: 'Üçüncü taraf paylaşım açık rızası',
    description:
      'İş arayan sürecinin yürütülmesi için gerekli hizmet sağlayıcılarla sınırlı paylaşımına açık rıza veriyorum (genel/belirsiz rıza değildir).',
  },
  {
    key: 'employerSharing',
    label: 'İşveren paylaşım açık rızası',
    description:
      'Profil ve CV bilgilerimin ilgili işverenlerle paylaşılmasına açık rıza veriyorum.',
  },
  {
    key: 'clarificationText',
    label: 'Aydınlatma metni bilgilendirmesi',
    description:
      'KVKK aydınlatma metnini okudum. Bu bir bilgilendirmedir; açık rıza değildir.',
  },
  {
    key: 'explicitConsent',
    label: 'Açık rıza (ilan yayınlama amaçları)',
    description:
      'Yukarıda işaretlediğim amaçlarla kişisel verilerimin işlenmesine açık rıza veriyorum. Rızamı geri çekebilirim.',
  },
] as const;

export type KvkkConsentValues = Record<KvkkConsentKey, boolean>;

export const EMPTY_KVKK_CONSENTS: KvkkConsentValues = {
  cvSharing: false,
  thirdPartySharing: false,
  employerSharing: false,
  clarificationText: false,
  explicitConsent: false,
};

export function normalizeKvkkConsents(
  value: Record<string, boolean> | null | undefined,
): KvkkConsentValues {
  const next = { ...EMPTY_KVKK_CONSENTS };
  if (!value) return next;
  for (const key of KVKK_CONSENT_KEYS) {
    next[key] = value[key] === true;
  }
  return next;
}

export function areAllKvkkConsentsAccepted(
  value: Record<string, boolean> | null | undefined,
): boolean {
  const normalized = normalizeKvkkConsents(value);
  return KVKK_CONSENT_KEYS.every((key) => normalized[key]);
}

export interface KvkkConsentItemSnapshot extends KvkkConsentPolicyItem {
  accepted: boolean;
}

export function buildKvkkConsentItemSnapshots(
  value: Record<string, boolean> | null | undefined,
): KvkkConsentItemSnapshot[] {
  const normalized = normalizeKvkkConsents(value);
  return KVKK_CONSENT_POLICY_ITEMS.map((item) => ({
    ...item,
    accepted: normalized[item.key],
  }));
}
