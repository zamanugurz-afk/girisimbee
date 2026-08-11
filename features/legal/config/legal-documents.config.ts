export type LegalDocumentKey =
  | 'user_terms'
  | 'privacy'
  | 'kvkk_clarification'
  | 'explicit_consent_phone'
  | 'explicit_consent_cv'
  | 'explicit_consent_third_party'
  | 'explicit_consent_employer'
  | 'cookie_policy'
  | 'contact_communication';

export type LegalDocumentMeta = {
  key: LegalDocumentKey;
  version: string;
  title: string;
  route: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'retired';
};

/** Active document versions — bump when legal copy changes. */
export const LEGAL_DOCUMENT_VERSIONS: Record<LegalDocumentKey, LegalDocumentMeta> = {
  user_terms: {
    key: 'user_terms',
    version: 'USER_TERMS_V1',
    title: 'Kullanıcı Sözleşmesi',
    route: '/yasal/kullanici-sozlesmesi',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  privacy: {
    key: 'privacy',
    version: 'PRIVACY_V1',
    title: 'Gizlilik Politikası',
    route: '/yasal/gizlilik',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  kvkk_clarification: {
    key: 'kvkk_clarification',
    version: 'KVKK_V1',
    title: 'KVKK Aydınlatma Metni',
    route: '/yasal/kvkk-aydinlatma',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  explicit_consent_phone: {
    key: 'explicit_consent_phone',
    version: 'CONSENT_PHONE_V1',
    title: 'Açık Rıza — Telefon Görünürlüğü',
    route: '/yasal/acik-riza',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  explicit_consent_cv: {
    key: 'explicit_consent_cv',
    version: 'CONSENT_CV_V1',
    title: 'Açık Rıza — CV Paylaşımı',
    route: '/yasal/acik-riza',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  explicit_consent_third_party: {
    key: 'explicit_consent_third_party',
    version: 'CONSENT_THIRD_PARTY_V1',
    title: 'Açık Rıza — Üçüncü Taraf Paylaşımı',
    route: '/yasal/acik-riza',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  explicit_consent_employer: {
    key: 'explicit_consent_employer',
    version: 'CONSENT_EMPLOYER_V1',
    title: 'Açık Rıza — İşveren Paylaşımı',
    route: '/yasal/acik-riza',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  cookie_policy: {
    key: 'cookie_policy',
    version: 'COOKIE_V1',
    title: 'Çerez Politikası',
    route: '/yasal/cerez',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
  contact_communication: {
    key: 'contact_communication',
    version: 'CONTACT_COMMUNICATION_V1',
    title: 'İletişim ve Mesajlaşma Kullanım Koşulları',
    route: '/yasal/iletisim-mesajlasma',
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10',
    status: 'active',
  },
};

export const LEGAL_SIGNUP_DOCUMENT_KEYS = [
  'user_terms',
  'privacy',
  'kvkk_clarification',
  'cookie_policy',
] as const;
