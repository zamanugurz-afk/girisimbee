/**
 * Supabase favorite_listings repository.
 * Falls back to marketplace_favorites when favorite_listings is not migrated yet.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingId, UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { FavoriteListingRepository } from '@/features/favorites/repositories/favorite-listing.repository';
import type {
  AddFavoriteListingInput,
  FavoriteListing,
} from '@/features/favorites/types/favorite-listing.types';
import {
  mapFavoriteListingRow,
  toFavoriteListingInsert,
  type FavoriteListingRow,
} from '@/features/favorites/repository/supabase/favorite-listing.mapper';

const PRIMARY_TABLE = 'favorite_listings';
const FALLBACK_TABLE = 'marketplace_favorites';

type ResolvedTable = typeof PRIMARY_TABLE | typeof FALLBACK_TABLE;

export class SupabaseFavoriteListingRepository implements FavoriteListingRepository {
  private resolvedTable: ResolvedTable | 'none' | null = null;

  constructor(private readonly supabase: SupabaseClient) {}

  private async resolveTable(): Promise<ResolvedTable | null> {
    if (this.resolvedTable === 'none') return null;
    if (this.resolvedTable) return this.resolvedTable;

    const primary = await this.supabase
      .from(PRIMARY_TABLE)
      .select('user_id')
      .limit(1);
    if (!primary.error) {
      this.resolvedTable = PRIMARY_TABLE;
      return this.resolvedTable;
    }
    if (!isMissingRelationError(primary.error)) {
      throw primary.error;
    }

    const fallback = await this.supabase
      .from(FALLBACK_TABLE)
      .select('user_id')
      .limit(1);
    if (!fallback.error || !isMissingRelationError(fallback.error)) {
      this.resolvedTable = FALLBACK_TABLE;
      return this.resolvedTable;
    }

    this.resolvedTable = 'none';
    return null;
  }

  async listByUser(userId: UserId): Promise<FavoriteListing[]> {
    const table = await this.resolveTable();
    if (!table) return [];

    let query = this.supabase
      .from(table)
      .select('user_id, listing_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (table === FALLBACK_TABLE) {
      query = query.eq('status', 'active').is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) =>
      mapFavoriteListingRow(row as FavoriteListingRow),
    );
  }

  async exists(userId: UserId, listingId: ListingId): Promise<boolean> {
    const table = await this.resolveTable();
    if (!table) return false;

    let query = this.supabase
      .from(table)
      .select('listing_id')
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (table === FALLBACK_TABLE) {
      query = query.eq('status', 'active').is('deleted_at', null);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return false;
      throw error;
    }
    return Boolean(data);
  }

  async add(input: AddFavoriteListingInput): Promise<FavoriteListing> {
    const existing = await this.exists(input.userId, input.listingId);
    if (existing) {
      const rows = await this.listByUser(input.userId);
      const found = rows.find((row) => row.listingId === input.listingId);
      if (found) return found;
    }

    const table = await this.resolveTable();
    if (!table) {
      return {
        userId: input.userId,
        listingId: input.listingId,
        createdAt: new Date().toISOString(),
      };
    }

    if (table === PRIMARY_TABLE) {
      const { data, error } = await this.supabase
        .from(table)
        .insert(toFavoriteListingInsert(input))
        .select('user_id, listing_id, created_at')
        .single();
      if (error) {
        if (isMissingRelationError(error)) {
          return {
            userId: input.userId,
            listingId: input.listingId,
            createdAt: new Date().toISOString(),
          };
        }
        throw error;
      }
      return mapFavoriteListingRow(data as FavoriteListingRow);
    }

    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from(table)
      .insert({
        id: crypto.randomUUID(),
        user_id: input.userId,
        listing_id: input.listingId,
        status: 'active',
        note: null,
        created_at: now,
        updated_at: now,
      })
      .select('user_id, listing_id, created_at')
      .single();
    if (error) throw error;
    return mapFavoriteListingRow(data as FavoriteListingRow);
  }

  async remove(userId: UserId, listingId: ListingId): Promise<void> {
    const table = await this.resolveTable();
    if (!table) return;

    if (table === PRIMARY_TABLE) {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);
      if (error && !isMissingRelationError(error)) throw error;
      return;
    }

    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from(table)
      .update({ status: 'deleted', deleted_at: now, updated_at: now })
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .is('deleted_at', null);
    if (error && !isMissingRelationError(error)) throw error;
  }
}
