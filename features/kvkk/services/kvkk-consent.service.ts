import type { ListingId, ProfileId, UserId } from '@/lib/domain/ids';
import { NotFoundError, ValidationError } from '@/lib/domain/errors';
import {
  KVKK_CONSENT_VERSION,
  areAllKvkkConsentsAccepted,
  buildKvkkConsentItemSnapshots,
  normalizeKvkkConsents,
} from '@/features/kvkk/constants/kvkk-consent-policy';
import type { KvkkConsentRepository } from '@/features/kvkk/repositories/kvkk-consent.repository';
import type {
  KvkkConsentEvidenceDocument,
  KvkkConsentRecord,
  KvkkConsentRecordFilter,
  KvkkConsentRecordId,
  KvkkConsentSource,
} from '@/features/kvkk/types/kvkk-consent.types';
import { buildKvkkConsentEvidence } from '@/features/kvkk/lib/build-kvkk-evidence';

export interface RecordKvkkConsentInput {
  userId: UserId;
  profileId: ProfileId;
  listingId?: ListingId | null;
  consents: Record<string, boolean> | null | undefined;
  source?: KvkkConsentSource;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class KvkkConsentService {
  constructor(private readonly repo: KvkkConsentRepository) {}

  async recordListingPublishConsent(input: RecordKvkkConsentInput): Promise<KvkkConsentRecord> {
    if (!areAllKvkkConsentsAccepted(input.consents)) {
      throw new ValidationError('Tüm KVKK onay kutularını işaretlemeniz gerekmektedir.', {
        kvkkConsents: ['Tüm KVKK onay kutularını işaretlemeniz gerekmektedir.'],
      });
    }

    const consents = normalizeKvkkConsents(input.consents);
    const consentItems = buildKvkkConsentItemSnapshots(consents);

    return this.repo.create({
      userId: input.userId,
      profileId: input.profileId,
      listingId: input.listingId ?? null,
      source: input.source ?? 'candidate_listing_publish',
      consentVersion: KVKK_CONSENT_VERSION,
      consentItems,
      consents,
      allAccepted: true,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
  }

  getById(id: KvkkConsentRecordId) {
    return this.repo.findById(id);
  }

  listForListing(listingId: ListingId) {
    return this.repo.findByListingId(listingId);
  }

  listForProfile(profileId: ProfileId) {
    return this.repo.findByProfileId(profileId);
  }

  listForUser(userId: UserId) {
    return this.repo.findByUserId(userId);
  }

  findMany(filter: KvkkConsentRecordFilter, pagination?: { page?: number; limit?: number }) {
    return this.repo.findMany(filter, pagination);
  }

  async getEvidence(id: KvkkConsentRecordId): Promise<KvkkConsentEvidenceDocument> {
    const record = await this.repo.findById(id);
    if (!record) throw new NotFoundError('KvkkConsentRecord', id);
    return buildKvkkConsentEvidence(record);
  }

  async getEvidenceForListing(listingId: ListingId): Promise<KvkkConsentEvidenceDocument | null> {
    const records = await this.repo.findByListingId(listingId);
    const latest = records[0];
    if (!latest) return null;
    return buildKvkkConsentEvidence(latest);
  }
}
