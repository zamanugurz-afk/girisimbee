import type { ListingId, ProfileId, UserId } from '@/lib/domain/ids';
import type {
  KvkkConsentItemSnapshot,
  KvkkConsentValues,
} from '@/features/kvkk/constants/kvkk-consent-policy';

export type KvkkConsentRecordId = string & { readonly __brand: 'KvkkConsentRecordId' };

export type KvkkConsentSource = 'candidate_listing_publish';

export interface KvkkConsentRecord {
  id: KvkkConsentRecordId;
  userId: UserId;
  profileId: ProfileId;
  listingId: ListingId | null;
  source: KvkkConsentSource;
  consentVersion: string;
  consentItems: KvkkConsentItemSnapshot[];
  consents: KvkkConsentValues;
  allAccepted: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  consentedAt: string;
  createdAt: string;
}

export interface CreateKvkkConsentRecordInput {
  userId: UserId;
  profileId: ProfileId;
  listingId?: ListingId | null;
  source?: KvkkConsentSource;
  consentVersion: string;
  consentItems: KvkkConsentItemSnapshot[];
  consents: KvkkConsentValues;
  allAccepted: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  consentedAt?: string;
}

export interface KvkkConsentRecordFilter {
  userId?: UserId;
  profileId?: ProfileId;
  listingId?: ListingId;
  source?: KvkkConsentSource;
}

/** Documentary evidence payload suitable for legal / audit export. */
export interface KvkkConsentEvidenceDocument {
  documentType: 'KVKK_ONAY_KAYIT_BELGESI';
  documentTitle: string;
  generatedAt: string;
  recordId: KvkkConsentRecordId;
  consentedAt: string;
  consentVersion: string;
  source: KvkkConsentSource;
  subject: {
    userId: UserId;
    profileId: ProfileId;
  };
  listingId: ListingId | null;
  client: {
    ipAddress: string | null;
    userAgent: string | null;
  };
  items: KvkkConsentItemSnapshot[];
  consents: KvkkConsentValues;
  attestation: string;
}
