/** Turkish/English phrases that reduce listing trust when detected in title or description. */
export const TRUST_SUSPICIOUS_PHRASES = [
  'acil',
  'son fiyat',
  'boş mu',
  'oku',
  ' wp',
  'wp ',
  'whatsapp',
  'iban',
  'kapora',
  'havale',
  'eft',
] as const;

/** Invoice-related keywords (positive signal). */
export const TRUST_INVOICE_KEYWORDS = ['fatura', 'faturalı', 'invoice'] as const;

/** Warranty-related keywords (positive signal). */
export const TRUST_WARRANTY_KEYWORDS = ['garanti', 'garantili', 'warranty'] as const;

/** Original box keywords (positive signal). */
export const TRUST_BOX_KEYWORDS = ['kutu', 'kutulu', 'orijinal kutu', 'original box'] as const;

/** Hard-reject scam combinations (case-insensitive substring match). */
export const TRUST_SCAM_REJECTION_RULES: ReadonlyArray<{
  id: string;
  requires: readonly string[];
  reason: string;
}> = [
  {
    id: 'iban-transfer',
    requires: ['iban', 'havale'],
    reason: 'IBAN and bank transfer requested — common scam pattern.',
  },
  {
    id: 'iban-eft',
    requires: ['iban', 'eft'],
    reason: 'IBAN and EFT requested — common scam pattern.',
  },
  {
    id: 'iban-deposit',
    requires: ['iban', 'kapora'],
    reason: 'IBAN and deposit requested — common scam pattern.',
  },
  {
    id: 'whatsapp-deposit',
    requires: ['whatsapp', 'kapora'],
    reason: 'WhatsApp contact with deposit request — high scam risk.',
  },
  {
    id: 'wp-deposit',
    requires: [' wp', 'kapora'],
    reason: 'WhatsApp contact with deposit request — high scam risk.',
  },
  {
    id: 'urgent-deposit',
    requires: ['acil', 'kapora'],
    reason: 'Urgent sale with deposit request — high scam risk.',
  },
];
