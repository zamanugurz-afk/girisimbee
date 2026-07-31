import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { MATCH_STATUS_TRANSITIONS } from '@/lib/domain/marketplace-enums';
import type { MatchId, ProfileId, ListingId } from '@/lib/domain/ids';
import type { Match, MatchFilter, CreateMatchInput, UpdateMatchInput } from '@/features/matching/types/match.types';
import type { MatchRepository } from '@/features/matching/repositories/match.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createMatch } from '@/features/matching/factories/match.factory';
import { mapMatchRow, toMatchRow, type MatchRow } from '@/features/matching/repository/supabase/match.mapper';
import { ids } from '@/lib/domain/ids';

const TABLE = 'marketplace_matches';

export class SupabaseMatchRepository implements MatchRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: MatchId, _filter?: RepositoryFilter): Promise<Match | null> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapMatchRow(data as MatchRow) : null;
  }

  private applyFilter(query: ReturnType<SupabaseClient['from']>, filter: MatchFilter) {
    let q = query.select('*', { count: 'exact' });
    if (filter.moduleKey) q = q.eq('module_key', filter.moduleKey);
    if (filter.listingId) q = q.eq('listing_id', filter.listingId);
    if (filter.initiatorProfileId) q = q.eq('initiator_profile_id', filter.initiatorProfileId);
    if (filter.targetProfileId) q = q.eq('target_profile_id', filter.targetProfileId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      q = q.in('status', statuses);
    }
    return q;
  }

  async findMany(filter: MatchFilter, pagination?: PaginationParams): Promise<PaginatedResult<Match>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    const { data, error, count } = await this.applyFilter(this.supabase.from(TABLE), filter)
      .order('created_at', { ascending: false })
      .range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapMatchRow(r as MatchRow)), count ?? 0, page, limit);
  }

  async paginate(filter: MatchFilter, pagination?: PaginationParams): Promise<PaginatedResult<Match>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: MatchFilter, pagination?: PaginationParams): Promise<PaginatedResult<Match>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: MatchFilter): Promise<number> {
    const { count, error } = await this.applyFilter(this.supabase.from(TABLE), filter);
    if (error) throw error;
    return count ?? 0;
  }

  async exists(id: MatchId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateMatchInput): Promise<Match> {
    const entity = createMatch({ ...input, id: ids.match(crypto.randomUUID()) });
    const row = { id: entity.id, ...toMatchRow(entity) };
    const { data, error } = await this.supabase.from(TABLE).insert(row).select('*').single();
    if (error) throw error;
    return mapMatchRow(data as MatchRow);
  }

  async update(id: MatchId, input: UpdateMatchInput): Promise<Match> {
    const row = { ...toMatchRow(input), updated_at: now() };
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Match', id);
    return mapMatchRow(data as MatchRow);
  }

  async softDelete(id: MatchId): Promise<void> {
    const { error } = await this.supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  async delete(id: MatchId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: MatchId): Promise<Match> {
    const match = await this.findById(id);
    if (!match) throw new NotFoundError('Match', id);
    return match;
  }

  async findForProfile(profileId: ProfileId): Promise<Match[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .or(`initiator_profile_id.eq.${profileId},target_profile_id.eq.${profileId}`);
    if (error) throw error;
    return (data ?? []).map((r) => mapMatchRow(r as MatchRow));
  }

  async findForListing(listingId: ListingId): Promise<Match[]> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('listing_id', listingId);
    if (error) throw error;
    return (data ?? []).map((r) => mapMatchRow(r as MatchRow));
  }

  async transitionStatus(id: MatchId, status: Match['status']): Promise<Match> {
    const match = await this.findById(id);
    if (!match) throw new NotFoundError('Match', id);
    if (!canTransition(MATCH_STATUS_TRANSITIONS, match.status, status)) {
      throw new InvalidTransitionError(match.status, status);
    }
    return this.update(id, {
      status,
      contactedAt: status === 'contacted' ? now() : match.contactedAt,
    });
  }
}
