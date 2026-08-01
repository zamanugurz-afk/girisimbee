import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult } from '@/lib/domain/pagination';
import type { ListingId, ProfileId, UserId } from '@/lib/domain/ids';
import type { KvkkConsentRepository } from '@/features/kvkk/repositories/kvkk-consent.repository';
import type {
  CreateKvkkConsentRecordInput,
  KvkkConsentRecord,
  KvkkConsentRecordFilter,
  KvkkConsentRecordId,
} from '@/features/kvkk/types/kvkk-consent.types';
import { createKvkkConsentRecordEntity } from '@/features/kvkk/repository/supabase/kvkk-consent.mapper';

export class MockKvkkConsentRepository implements KvkkConsentRepository {
  private records = new Map<KvkkConsentRecordId, KvkkConsentRecord>();

  async create(input: CreateKvkkConsentRecordInput): Promise<KvkkConsentRecord> {
    const entity = createKvkkConsentRecordEntity(input);
    this.records.set(entity.id, entity);
    return entity;
  }

  async findById(id: KvkkConsentRecordId): Promise<KvkkConsentRecord | null> {
    return this.records.get(id) ?? null;
  }

  async findByListingId(listingId: ListingId): Promise<KvkkConsentRecord[]> {
    return [...this.records.values()]
      .filter((r) => r.listingId === listingId)
      .sort((a, b) => b.consentedAt.localeCompare(a.consentedAt));
  }

  async findByProfileId(profileId: ProfileId): Promise<KvkkConsentRecord[]> {
    return [...this.records.values()]
      .filter((r) => r.profileId === profileId)
      .sort((a, b) => b.consentedAt.localeCompare(a.consentedAt));
  }

  async findByUserId(userId: UserId): Promise<KvkkConsentRecord[]> {
    return [...this.records.values()]
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.consentedAt.localeCompare(a.consentedAt));
  }

  async findMany(
    filter: KvkkConsentRecordFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<KvkkConsentRecord>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.records.values()];
    if (filter.userId) results = results.filter((r) => r.userId === filter.userId);
    if (filter.profileId) results = results.filter((r) => r.profileId === filter.profileId);
    if (filter.listingId) results = results.filter((r) => r.listingId === filter.listingId);
    if (filter.source) results = results.filter((r) => r.source === filter.source);
    results.sort((a, b) => b.consentedAt.localeCompare(a.consentedAt));
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }
}
