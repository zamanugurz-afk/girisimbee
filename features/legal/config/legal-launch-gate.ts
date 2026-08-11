import {
  LEGAL_COMPANY_PROFILE_COMPLETE,
  getMissingLegalCompanyFields,
  isLegalCompanyProfileFilled,
} from '@/features/legal/config/legal-company.config';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import { LEGAL_THIRD_PARTY_SERVICES } from '@/features/legal/config/legal-third-party.config';
import { LEGAL_COMMERCIAL_MESSAGE_STATUS } from '@/features/legal/config/legal-third-party.config';

export type LegalLaunchCheck = {
  ok: boolean;
  code: 'LEGAL_READY' | 'LEGAL_CONFIGURATION_INCOMPLETE';
  missingCompanyFields: string[];
  pendingThirdPartyTransfers: string[];
  flags: {
    companyProfileCompleteFlag: boolean;
    companyFieldsFilled: boolean;
    documentsVersioned: boolean;
    thirdPartyTransfersVerified: boolean;
    iysConfigured: boolean;
    marketingSendEnabled: boolean;
  };
};

/**
 * Technical launch gate — company-specific and provider DPA items remain pending
 * until verified. Do not set LEGAL_READY without real company + transfer verification.
 */
export function checkLegalConfiguration(): LegalLaunchCheck {
  const missingCompanyFields = getMissingLegalCompanyFields();
  const companyFieldsFilled = isLegalCompanyProfileFilled();
  const documentsVersioned = Object.values(LEGAL_DOCUMENT_VERSIONS).every(
    (doc) => Boolean(doc.version) && doc.status === 'active',
  );
  const pendingThirdPartyTransfers = LEGAL_THIRD_PARTY_SERVICES.filter(
    (s) =>
      s.dpaStatus === 'pending_verification'
      || s.standardContractStatus === 'pending_verification'
      || s.region === 'Doğrulanacak',
  ).map((s) => s.id);

  const thirdPartyTransfersVerified = pendingThirdPartyTransfers.length === 0;
  const companyOk = LEGAL_COMPANY_PROFILE_COMPLETE && companyFieldsFilled;

  const ok =
    companyOk
    && documentsVersioned
    && thirdPartyTransfersVerified
    && (LEGAL_COMMERCIAL_MESSAGE_STATUS.iysConfigured
      || !LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled);

  return {
    ok,
    code: ok ? 'LEGAL_READY' : 'LEGAL_CONFIGURATION_INCOMPLETE',
    missingCompanyFields,
    pendingThirdPartyTransfers,
    flags: {
      companyProfileCompleteFlag: LEGAL_COMPANY_PROFILE_COMPLETE,
      companyFieldsFilled,
      documentsVersioned,
      thirdPartyTransfersVerified,
      iysConfigured: LEGAL_COMMERCIAL_MESSAGE_STATUS.iysConfigured,
      marketingSendEnabled: LEGAL_COMMERCIAL_MESSAGE_STATUS.marketingSendEnabled,
    },
  };
}

export function isLegalPublicPublishAllowed(): boolean {
  // Allow incomplete legal pages outside production, or when explicitly opted in.
  if (process.env.LEGAL_ALLOW_INCOMPLETE === '1') return true;
  if (process.env.NODE_ENV !== 'production') return true;
  return checkLegalConfiguration().flags.companyProfileCompleteFlag
    && checkLegalConfiguration().flags.companyFieldsFilled;
}

export function containsLegalPlaceholder(text: string): boolean {
  return /\[ŞİRKET|\[VERGİ|\[MERSİS|\[KEP|\[ADRES|\[KVKK|\[RESMİ/i.test(text);
}
