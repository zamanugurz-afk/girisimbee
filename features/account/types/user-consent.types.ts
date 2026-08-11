import type { UserConsentId, UserId } from '@/lib/domain/ids';

export interface UserConsent {
  id: UserConsentId;
  userId: UserId;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  kvkkAccepted: boolean;
  cookiesAccepted: boolean;
  marketingAccepted: boolean;
  smsAccepted: boolean;
  emailAccepted: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  termsVersion?: string | null;
  privacyVersion?: string | null;
  kvkkAckVersion?: string | null;
  cookiesVersion?: string | null;
  marketingWithdrawnAt?: string | null;
  smsWithdrawnAt?: string | null;
  emailWithdrawnAt?: string | null;
}

export type CreateUserConsentInput = {
  userId: UserId;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  kvkkAccepted: boolean;
  cookiesAccepted: boolean;
  marketingAccepted?: boolean;
  smsAccepted?: boolean;
  emailAccepted?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  termsVersion?: string | null;
  privacyVersion?: string | null;
  kvkkAckVersion?: string | null;
  cookiesVersion?: string | null;
  marketingWithdrawnAt?: string | null;
  smsWithdrawnAt?: string | null;
  emailWithdrawnAt?: string | null;
};

export type RecordLegalAcceptanceInput = {
  userId: UserId;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  kvkkAcknowledged: boolean;
  cookiesAcknowledged: boolean;
  termsVersion: string;
  privacyVersion: string;
  kvkkAckVersion: string;
  cookiesVersion: string;
  source?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Preserve optional marketing prefs from latest row when re-recording. */
  marketingAccepted?: boolean;
  smsAccepted?: boolean;
  emailAccepted?: boolean;
};

export type UpdateOptionalConsentsInput = {
  userId: UserId;
  marketingAccepted?: boolean;
  smsAccepted?: boolean;
  emailAccepted?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  source?: string;
};
