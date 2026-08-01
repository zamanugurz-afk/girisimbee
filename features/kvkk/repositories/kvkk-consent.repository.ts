import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type {
  CreateKvkkConsentRecordInput,
  KvkkConsentRecord,
  KvkkConsentRecordFilter,
  KvkkConsentRecordId,
} from '@/features/kvkk/types/kvkk-consent.types';
import type { ListingId, ProfileId, UserId } from '@/lib/domain/ids';

export interface KvkkConsentRepository {
  create(input: CreateKvkkConsentRecordInput): Promise<KvkkConsentRecord>;
  findById(id: KvkkConsentRecordId): Promise<KvkkConsentRecord | null>;
  findByListingId(listingId: ListingId): Promise<KvkkConsentRecord[]>;
  findByProfileId(profileId: ProfileId): Promise<KvkkConsentRecord[]>;
  findByUserId(userId: UserId): Promise<KvkkConsentRecord[]>;
  findMany(
    filter: KvkkConsentRecordFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<KvkkConsentRecord>>;
}
