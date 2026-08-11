import type { ListingId, ProfileId, UserId } from '@/lib/domain/ids';
import type {
  KvkkConsentItemSnapshot,
  KvkkConsentValues,
} from '@/features/kvkk/constants/kvkk-consent-policy';
import type { PublishConsentItemSnapshot } from '@/features/kvkk/constants/publish-consent-policy';

export type KvkkConsentRecordId = string & { readonly __brand: 'KvkkConsentRecordId' };

export type KvkkConsentSource = 'candidate_listing_publish' | 'listing_publish';

/** Audit item snapshot — candidate KVKK and/or generic publish-consent policies. */
export type ConsentAuditItemSnapshot = KvkkConsentItemSnapshot | PublishConsentItemSnapshot;

export interface KvkkConsentRecord {
  id: KvkkConsentRecordId;
  userId: UserId;
  profileId: ProfileId;
  listingId: ListingId | null;
  source: KvkkConsentSource;
  consentVersion: string;
  consentItems: ConsentAuditItemSnapshot[];
  /** Candidate KVKK keys and/or publish-consent keys (JSONB). */
  consents: KvkkConsentValues | Record<string, boolean>;
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
  consentItems: ConsentAuditItemSnapshot[];
  consents: KvkkConsentValues | Record<string, boolean>;
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
  items: ConsentAuditItemSnapshot[];
  consents: KvkkConsentValues | Record<string, boolean>;
  attestation: string;
}
