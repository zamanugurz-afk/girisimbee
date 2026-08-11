/**
 * Central legal / company profile — PHASE 1 placeholders, PHASE 2 real data.
 * Never invent company registry data. Fill only verified values later.
 */

export const LEGAL_COMPANY_PLACEHOLDERS = {
  legalName: '[ŞİRKET TİCARİ UNVANI]',
  tradeName: '[ŞİRKET TİCARET UNVANI / MARKA]',
  taxNumber: '[VERGİ NUMARASI]',
  mersisNumber: '[MERSİS NUMARASI]',
  address: '[ŞİRKET ADRESİ]',
  phone: '[ŞİRKET TELEFONU]',
  email: '[RESMİ E-POSTA ADRESİ]',
  kvkkEmail: '[KVKK E-POSTA ADRESİ]',
  kvkkApplicationAddress: '[KVKK BAŞVURU ADRESİ]',
  kepAddress: '[KEP ADRESİ]',
} as const;

export type LegalCompanyFieldKey = keyof typeof LEGAL_COMPANY_PLACEHOLDERS;

/**
 * Set to true only after real company registry fields are filled below
 * and verified by legal/accounting. Do not invent values.
 */
export const LEGAL_COMPANY_PROFILE_COMPLETE = false;

/**
 * Leave empty until company formation. Empty fields resolve to placeholders
 * in non-public/incomplete mode and block public publish when incomplete.
 */
export const LEGAL_COMPANY_PROFILE = {
  legalName: '',
  tradeName: 'Girisimbee',
  taxNumber: '',
  mersisNumber: '',
  address: '',
  phone: '',
  /** Public support/info mailbox already used on the site — not a registry invent. */
  email: 'destek@girisimbee.com',
  kvkkEmail: '',
  kvkkApplicationAddress: '',
  kepAddress: '',
} as const;

export type LegalCompanyProfile = {
  -readonly [K in keyof typeof LEGAL_COMPANY_PROFILE]: string;
};

export function resolveLegalCompanyField(key: LegalCompanyFieldKey): string {
  const value = LEGAL_COMPANY_PROFILE[key]?.trim() ?? '';
  if (value) return value;
  return LEGAL_COMPANY_PLACEHOLDERS[key];
}

export function getResolvedLegalCompany(): Record<LegalCompanyFieldKey, string> {
  return {
    legalName: resolveLegalCompanyField('legalName'),
    tradeName: resolveLegalCompanyField('tradeName'),
    taxNumber: resolveLegalCompanyField('taxNumber'),
    mersisNumber: resolveLegalCompanyField('mersisNumber'),
    address: resolveLegalCompanyField('address'),
    phone: resolveLegalCompanyField('phone'),
    email: resolveLegalCompanyField('email'),
    kvkkEmail: resolveLegalCompanyField('kvkkEmail'),
    kvkkApplicationAddress: resolveLegalCompanyField('kvkkApplicationAddress'),
    kepAddress: resolveLegalCompanyField('kepAddress'),
  };
}

/** Registry-critical fields that must be non-empty for profileComplete. */
export const LEGAL_COMPANY_REQUIRED_FIELDS: readonly LegalCompanyFieldKey[] = [
  'legalName',
  'taxNumber',
  'mersisNumber',
  'address',
  'phone',
  'email',
  'kvkkEmail',
  'kvkkApplicationAddress',
] as const;

export function getMissingLegalCompanyFields(): LegalCompanyFieldKey[] {
  return LEGAL_COMPANY_REQUIRED_FIELDS.filter(
    (key) => !(LEGAL_COMPANY_PROFILE[key]?.trim()),
  );
}

export function isLegalCompanyProfileFilled(): boolean {
  return getMissingLegalCompanyFields().length === 0;
}
