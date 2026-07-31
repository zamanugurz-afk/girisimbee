/**
 * Supabase favorite repository — marketplace_favorites.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError, ConflictError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { FavoriteId, UserId, ListingId } from '@/lib/domain/ids';
import type { Favorite, CreateFavoriteInput, UpdateFavoriteInput, FavoriteFilter } from '@/features/favorites/types/favorite.types';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import { createFavorite } from '@/features/favorites/factories/favorite.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';

const TABLE = 'marketplace_favorites';

function emptyFavoritePage(pagination?: PaginationParams): PaginatedResult<Favorite> {
  const { page, limit } = normalizePagination(pagination);
  return paginatedResult([], 0, page, limit);
}

interface FavoriteRow {
  id: string;
  user_id: string;
  listing_id: string;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapFavoriteRow(row: FavoriteRow): Favorite {
  return {
    id: row.id as FavoriteId,
    userId: row.user_id as UserId,
    listingId: row.listing_id as ListingId,
    status: row.status as Favorite['status'],
    note: row.note,
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export class SupabaseFavoriteRepository implements FavoriteRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: FavoriteId, filter?: RepositoryFilter): Promise<Favorite | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapFavoriteRow(data as FavoriteRow) : null;
  }

  async findByUserAndListing(userId: UserId, listingId: ListingId): Promise<Favorite | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapFavoriteRow(data as FavoriteRow) : null;
  }

  async findMany(filter: FavoriteFilter, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.userId) query = query.eq('user_id', filter.userId);
    if (filter.listingId) query = query.eq('listing_id', filter.listingId);
    if (filter.status) query = query.eq('status', filter.status);
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) {
      if (isMissingRelationError(error)) return emptyFavoritePage(pagination);
      throw error;
    }
    return paginatedResult((data ?? []).map((r) => mapFavoriteRow(r as FavoriteRow)), count ?? 0, page, limit);
  }

  async paginate(filter: FavoriteFilter, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: FavoriteFilter, pagination?: PaginationParams): Promise<PaginatedResult<Favorite>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: FavoriteFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async countByListingId(listingId: ListingId): Promise<number> {
    try {
      return await this.count({ listingId, status: 'active' });
    } catch (error) {
      if (isMissingRelationError(error)) return 0;
      throw error;
    }
  }

  async exists(id: FavoriteId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) {
      if (isMissingRelationError(error)) return false;
      throw error;
    }
    return (count ?? 0) > 0;
  }

  async create(input: CreateFavoriteInput): Promise<Favorite> {
    const existing = await this.findByUserAndListing(input.userId, input.listingId);
    if (existing) throw new ConflictError('Favorite already exists');
    const favorite = createFavorite(input);
    const { data, error } = await this.supabase.from(TABLE).insert({
      id: favorite.id,
      user_id: favorite.userId,
      listing_id: favorite.listingId,
      status: favorite.status,
      note: favorite.note,
    }).select('*').single();
    if (error) throw error;
    return mapFavoriteRow(data as FavoriteRow);
  }

  async update(id: FavoriteId, input: UpdateFavoriteInput): Promise<Favorite> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.note !== undefined) row.note = input.note;
    if (input.status !== undefined) row.status = input.status;
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Favorite', id);
    return mapFavoriteRow(data as FavoriteRow);
  }

  async softDelete(id: FavoriteId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .update({ status: 'deleted', deleted_at: now(), updated_at: now() })
      .eq('id', id);
    if (error) throw error;
  }

  async delete(id: FavoriteId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: FavoriteId): Promise<Favorite> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status: 'active', deleted_at: null, updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Favorite', id);
    return mapFavoriteRow(data as FavoriteRow);
  }
}
