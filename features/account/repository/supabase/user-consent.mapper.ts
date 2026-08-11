import { ids } from '@/lib/domain/ids';
import type {
  CreateUserConsentInput,
  UserConsent,
} from '@/features/account/types/user-consent.types';

export interface UserConsentRow {
  id: string;
  user_id: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  kvkk_accepted: boolean;
  cookies_accepted: boolean;
  marketing_accepted: boolean;
  sms_accepted: boolean;
  email_accepted: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  terms_version?: string | null;
  privacy_version?: string | null;
  kvkk_ack_version?: string | null;
  cookies_version?: string | null;
  marketing_withdrawn_at?: string | null;
  sms_withdrawn_at?: string | null;
  email_withdrawn_at?: string | null;
}

export function mapUserConsentRow(row: UserConsentRow): UserConsent {
  return {
    id: ids.userConsent(row.id),
    userId: ids.user(row.user_id),
    termsAccepted: row.terms_accepted,
    privacyAccepted: row.privacy_accepted,
    kvkkAccepted: row.kvkk_accepted,
    cookiesAccepted: row.cookies_accepted,
    marketingAccepted: row.marketing_accepted,
    smsAccepted: row.sms_accepted,
    emailAccepted: row.email_accepted,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
    termsVersion: row.terms_version ?? null,
    privacyVersion: row.privacy_version ?? null,
    kvkkAckVersion: row.kvkk_ack_version ?? null,
    cookiesVersion: row.cookies_version ?? null,
    marketingWithdrawnAt: row.marketing_withdrawn_at ?? null,
    smsWithdrawnAt: row.sms_withdrawn_at ?? null,
    emailWithdrawnAt: row.email_withdrawn_at ?? null,
  };
}

export function createUserConsentEntity(input: CreateUserConsentInput): UserConsent {
  const now = new Date().toISOString();
  return {
    id: ids.userConsent(crypto.randomUUID()),
    userId: input.userId,
    termsAccepted: input.termsAccepted,
    privacyAccepted: input.privacyAccepted,
    kvkkAccepted: input.kvkkAccepted,
    cookiesAccepted: input.cookiesAccepted,
    marketingAccepted: input.marketingAccepted ?? false,
    smsAccepted: input.smsAccepted ?? false,
    emailAccepted: input.emailAccepted ?? false,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: now,
    termsVersion: input.termsVersion ?? null,
    privacyVersion: input.privacyVersion ?? null,
    kvkkAckVersion: input.kvkkAckVersion ?? null,
    cookiesVersion: input.cookiesVersion ?? null,
    marketingWithdrawnAt: input.marketingWithdrawnAt ?? null,
    smsWithdrawnAt: input.smsWithdrawnAt ?? null,
    emailWithdrawnAt: input.emailWithdrawnAt ?? null,
  };
}

export function toUserConsentInsert(entity: UserConsent) {
  return {
    id: entity.id,
    user_id: entity.userId,
    terms_accepted: entity.termsAccepted,
    privacy_accepted: entity.privacyAccepted,
    kvkk_accepted: entity.kvkkAccepted,
    cookies_accepted: entity.cookiesAccepted,
    marketing_accepted: entity.marketingAccepted,
    sms_accepted: entity.smsAccepted,
    email_accepted: entity.emailAccepted,
    ip_address: entity.ipAddress,
    user_agent: entity.userAgent,
    created_at: entity.createdAt,
    terms_version: entity.termsVersion ?? null,
    privacy_version: entity.privacyVersion ?? null,
    kvkk_ack_version: entity.kvkkAckVersion ?? null,
    cookies_version: entity.cookiesVersion ?? null,
    marketing_withdrawn_at: entity.marketingWithdrawnAt ?? null,
    sms_withdrawn_at: entity.smsWithdrawnAt ?? null,
    email_withdrawn_at: entity.emailWithdrawnAt ?? null,
  };
}
