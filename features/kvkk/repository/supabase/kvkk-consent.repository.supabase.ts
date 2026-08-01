import type { SupabaseClient } from '@supabase/supabase-js';
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
import {
  createKvkkConsentRecordEntity,
  mapKvkkConsentRecordRow,
  toKvkkConsentRecordInsert,
  type KvkkConsentRecordRow,
} from '@/features/kvkk/repository/supabase/kvkk-consent.mapper';

const TABLE = 'marketplace_kvkk_consent_records';

export class SupabaseKvkkConsentRepository implements KvkkConsentRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(input: CreateKvkkConsentRecordInput): Promise<KvkkConsentRecord> {
    const entity = createKvkkConsentRecordEntity(input);
    const row = toKvkkConsentRecordInsert({
      ...input,
      id: entity.id,
      createdAt: entity.createdAt,
      consentedAt: entity.consentedAt,
    });
    const { data, error } = await this.supabase.from(TABLE).insert(row).select('*').single();
    if (error) throw error;
    return mapKvkkConsentRecordRow(data as KvkkConsentRecordRow);
  }

  async findById(id: KvkkConsentRecordId): Promise<KvkkConsentRecord | null> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapKvkkConsentRecordRow(data as KvkkConsentRecordRow) : null;
  }

  async findByListingId(listingId: ListingId): Promise<KvkkConsentRecord[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .order('consented_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapKvkkConsentRecordRow(row as KvkkConsentRecordRow));
  }

  async findByProfileId(profileId: ProfileId): Promise<KvkkConsentRecord[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('profile_id', profileId)
      .order('consented_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapKvkkConsentRecordRow(row as KvkkConsentRecordRow));
  }

  async findByUserId(userId: UserId): Promise<KvkkConsentRecord[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('consented_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapKvkkConsentRecordRow(row as KvkkConsentRecordRow));
  }

  async findMany(
    filter: KvkkConsentRecordFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<KvkkConsentRecord>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;

    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.profileId) query = query.eq('profile_id', filter.profileId);
    if (filter.listingId) query = query.eq('listing_id', filter.listingId);
    if (filter.source) query = query.eq('source', filter.source);

    const { data, error, count } = await query
      .order('consented_at', { ascending: false })
      .range(start, end);
    if (error) throw error;

    return paginatedResult(
      (data ?? []).map((row) => mapKvkkConsentRecordRow(row as KvkkConsentRecordRow)),
      count ?? 0,
      page,
      limit,
    );
  }
}
