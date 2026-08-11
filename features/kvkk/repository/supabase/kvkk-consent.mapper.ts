import type { ListingId } from '@/lib/domain/ids';
import type { KvkkConsentValues } from '@/features/kvkk/constants/kvkk-consent-policy';
import type {
  ConsentAuditItemSnapshot,
  CreateKvkkConsentRecordInput,
  KvkkConsentRecord,
  KvkkConsentRecordId,
  KvkkConsentSource,
} from '@/features/kvkk/types/kvkk-consent.types';
import { ids } from '@/lib/domain/ids';

export interface KvkkConsentRecordRow {
  id: string;
  user_id: string;
  profile_id: string;
  listing_id: string | null;
  source: string;
  consent_version: string;
  consent_items: ConsentAuditItemSnapshot[];
  consents: KvkkConsentValues | Record<string, boolean>;
  all_accepted: boolean;
  ip_address: string | null;
  user_agent: string | null;
  consented_at: string;
  created_at: string;
}

export function mapKvkkConsentRecordRow(row: KvkkConsentRecordRow): KvkkConsentRecord {
  return {
    id: row.id as KvkkConsentRecordId,
    userId: ids.user(row.user_id),
    profileId: ids.profile(row.profile_id),
    listingId: row.listing_id ? ids.listing(row.listing_id) : null,
    source: row.source as KvkkConsentSource,
    consentVersion: row.consent_version,
    consentItems: row.consent_items ?? [],
    consents: row.consents,
    allAccepted: row.all_accepted,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    consentedAt: row.consented_at,
    createdAt: row.created_at,
  };
}

export function toKvkkConsentRecordInsert(
  input: CreateKvkkConsentRecordInput & { id: KvkkConsentRecordId; createdAt: string; consentedAt: string },
): Record<string, unknown> {
  return {
    id: input.id,
    user_id: input.userId,
    profile_id: input.profileId,
    listing_id: input.listingId ?? null,
    source: input.source ?? 'candidate_listing_publish',
    consent_version: input.consentVersion,
    consent_items: input.consentItems,
    consents: input.consents,
    all_accepted: input.allAccepted,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    consented_at: input.consentedAt,
    created_at: input.createdAt,
  };
}

export function createKvkkConsentRecordEntity(
  input: CreateKvkkConsentRecordInput,
): KvkkConsentRecord {
  const nowIso = new Date().toISOString();
  return {
    id: crypto.randomUUID() as KvkkConsentRecordId,
    userId: input.userId,
    profileId: input.profileId,
    listingId: (input.listingId ?? null) as ListingId | null,
    source: input.source ?? 'candidate_listing_publish',
    consentVersion: input.consentVersion,
    consentItems: input.consentItems,
    consents: input.consents,
    allAccepted: input.allAccepted,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    consentedAt: input.consentedAt ?? nowIso,
    createdAt: nowIso,
  };
}
