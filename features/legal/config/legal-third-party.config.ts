/**
 * Third-party processors — factual inventory for legal config.
 * Regions / DPA status marked pending until verified. Do not invent.
 */

export type TransferStatus = 'not_applicable' | 'pending_verification' | 'configured';

export type ThirdPartyServiceRecord = {
  id: string;
  name: string;
  purpose: string;
  dataCategories: readonly string[];
  region: string;
  transferMechanism: string;
  dpaStatus: TransferStatus;
  standardContractStatus: TransferStatus;
  evidencePath?: string;
};

export const LEGAL_THIRD_PARTY_SERVICES: readonly ThirdPartyServiceRecord[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    purpose: 'Kimlik doğrulama, veritabanı, dosya depolama, oturum yönetimi',
    dataCategories: [
      'hesap',
      'profil',
      'ilan',
      'CV/belge',
      'consent kayıtları',
      'teknik log',
    ],
    region: 'Doğrulanacak',
    transferMechanism: 'Doğrulanacak (KVKK m.9 / standart sözleşme aday)',
    dpaStatus: 'pending_verification',
    standardContractStatus: 'pending_verification',
    evidencePath: 'lib/supabase/*',
  },
  {
    id: 'google_oauth',
    name: 'Google OAuth (Supabase Auth üzerinden)',
    purpose: 'Kimlik doğrulama (giriş)',
    dataCategories: ['e-posta', 'ad/soyad (Google profilinden)', 'OAuth token meta'],
    region: 'Doğrulanacak',
    transferMechanism: 'Doğrulanacak',
    dpaStatus: 'pending_verification',
    standardContractStatus: 'pending_verification',
    evidencePath: 'features/authentication/services/supabase-auth.service.ts',
  },
  {
    id: 'iyzico',
    name: 'iyzico',
    purpose: 'Ödeme tahsilatı (kart verisi iyzico tarafında işlenir)',
    dataCategories: ['ödeme işlemi meta', 'sipariş referansı', 'iletişim (gerekirse)'],
    region: 'Doğrulanacak',
    transferMechanism: 'Doğrulanacak',
    dpaStatus: 'pending_verification',
    standardContractStatus: 'pending_verification',
    evidencePath: 'lib/payments/providers/iyzico.ts',
  },
  {
    id: 'resend',
    name: 'Resend',
    purpose: 'İşlemsel e-posta gönderimi',
    dataCategories: ['e-posta adresi', 'e-posta içeriği'],
    region: 'Doğrulanacak',
    transferMechanism: 'Doğrulanacak',
    dpaStatus: 'pending_verification',
    standardContractStatus: 'pending_verification',
    evidencePath: 'lib/email/send.ts',
  },
  {
    id: 'hosting',
    name: 'Vercel / Netlify (hosting)',
    purpose: 'Uygulama barındırma ve dağıtım',
    dataCategories: ['HTTP istek logları', 'deploy meta'],
    region: 'Doğrulanacak',
    transferMechanism: 'Doğrulanacak',
    dpaStatus: 'pending_verification',
    standardContractStatus: 'pending_verification',
  },
] as const;

/** Commercial electronic message stack — infrastructure ready, IYS not configured. */
export const LEGAL_COMMERCIAL_MESSAGE_STATUS = {
  infrastructureReady: true,
  iysConfigured: false,
  /** Hard gate: do not send marketing until IYS + company policy say so. */
  marketingSendEnabled: false,
} as const;
