/**
 * Retention categories — legal hold / retention criteria.
 * Periods are policy placeholders until counsel confirms exact durations.
 */

export type RetentionCategory =
  | 'account_profile'
  | 'listings'
  | 'consent_evidence'
  | 'security_logs'
  | 'payment_meta'
  | 'messaging'
  | 'support_tickets';

export type RetentionPolicy = {
  category: RetentionCategory;
  criteria: string;
  /** ISO-8601 duration hint or prose — not auto-enforced yet. */
  periodHint: string;
  legalHold: boolean;
  autoPurgeOnAccountDelete: boolean;
};

export const LEGAL_RETENTION_POLICIES: readonly RetentionPolicy[] = [
  {
    category: 'account_profile',
    criteria: 'Üyelik + hesap silme talebi sonrası silme/anonimleştirme',
    periodHint: 'Silme talebinden sonra makul işlem süresi; yasal saklama istisnaları hariç',
    legalHold: false,
    autoPurgeOnAccountDelete: true,
  },
  {
    category: 'listings',
    criteria: 'İlan sahibi silme / moderasyon / hesap silme',
    periodHint: 'Hesap silmede ilanlar soft-delete; hukuki ihtilaf varsa hold',
    legalHold: false,
    autoPurgeOnAccountDelete: true,
  },
  {
    category: 'consent_evidence',
    criteria: 'İspat yükümlülüğü / zamanaşımı',
    periodHint: 'Hukuki ispat için gerekli süre (hukukçu teyidi bekleniyor)',
    legalHold: true,
    autoPurgeOnAccountDelete: false,
  },
  {
    category: 'security_logs',
    criteria: 'Güvenlik olayları ve hesap erişim kayıtları',
    periodHint: 'Güvenlik ve ispat için sınırlı süre',
    legalHold: true,
    autoPurgeOnAccountDelete: false,
  },
  {
    category: 'payment_meta',
    criteria: 'Mali mevzuat / faturalama',
    periodHint: 'İlgili mali saklama süreleri (hukukçu/muhasebe teyidi)',
    legalHold: true,
    autoPurgeOnAccountDelete: false,
  },
  {
    category: 'messaging',
    criteria: 'Kullanıcı iletişimi (özellik aktifse)',
    periodHint: 'Hesap silmede silme veya anonimleştirme; ihtilaf hold',
    legalHold: false,
    autoPurgeOnAccountDelete: true,
  },
  {
    category: 'support_tickets',
    criteria: 'Destek talepleri',
    periodHint: 'Destek süreci + ispat',
    legalHold: false,
    autoPurgeOnAccountDelete: false,
  },
] as const;
