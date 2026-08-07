/** Current KVKK consent policy version — bump when copy/legal text changes. */
export const KVKK_CONSENT_VERSION = '2026-08-01';

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
    label: 'CV paylaşım izni',
    description:
      'Özgeçmişimin ilan sahipleri ve platform tarafından görüntülenmesine izin veriyorum.',
  },
  {
    key: 'thirdPartySharing',
    label: 'Üçüncü taraf paylaşım izni',
    description:
      'Verilerimin iş ortakları ve hizmet sağlayıcılarla paylaşılmasına izin veriyorum.',
  },
  {
    key: 'employerSharing',
    label: 'İşveren paylaşım izni',
    description:
      'Profil ve CV bilgilerimin ilgili işverenlerle paylaşılmasına izin veriyorum.',
  },
  {
    key: 'clarificationText',
    label: 'Aydınlatma metni onayı',
    description:
      'Kişisel verilerin işlenmesine ilişkin aydınlatma metnini okudum ve anladım.',
  },
  {
    key: 'explicitConsent',
    label: 'Açık rıza onayı',
    description:
      'Kişisel verilerimin belirtilen amaçlarla işlenmesine açık rıza veriyorum.',
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
