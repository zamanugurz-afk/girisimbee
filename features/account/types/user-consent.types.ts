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
};
