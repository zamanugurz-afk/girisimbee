/**
 * Supabase listing_views repository.
 * Degrades gracefully when the table is not migrated yet.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingId, ListingViewId, UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { ListingViewRepository } from '@/features/listings/repositories/listing-view.repository';
import type {
  ListingView,
  RecordListingViewInput,
} from '@/features/listings/types/listing-view.types';
import {
  mapListingViewRow,
  toListingViewInsert,
  type ListingViewRow,
} from '@/features/listings/repository/supabase/listing-view.mapper';

const TABLE = 'listing_views';

export class SupabaseListingViewRepository implements ListingViewRepository {
  private missing = false;

  constructor(private readonly supabase: SupabaseClient) {}

  private markMissing(): null {
    this.missing = true;
    return null;
  }

  async insert(
    input: RecordListingViewInput & { id: ListingViewId },
  ): Promise<ListingView> {
    if (this.missing) {
      return {
        id: input.id,
        listingId: input.listingId,
        viewerId: input.viewerId ?? null,
        ipAddress: input.ipAddress ?? null,
        deviceType: input.deviceType ?? 'unknown',
        createdAt: new Date().toISOString(),
      };
    }

    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(
        toListingViewInsert({
          id: input.id,
          listingId: input.listingId,
          viewerId: input.viewerId,
          ipAddress: input.ipAddress,
          deviceType: input.deviceType,
        }),
      )
      .select('*')
      .single();

    if (error) {
      if (isMissingRelationError(error)) {
        this.markMissing();
        return {
          id: input.id,
          listingId: input.listingId,
          viewerId: input.viewerId ?? null,
          ipAddress: input.ipAddress ?? null,
          deviceType: input.deviceType ?? 'unknown',
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }

    return mapListingViewRow(data as ListingViewRow);
  }

  async findRecentByViewer(
    listingId: ListingId,
    viewerId: UserId,
    sinceIso: string,
  ): Promise<ListingView | null> {
    if (this.missing) return null;

    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .eq('viewer_id', viewerId)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) return this.markMissing();
      throw error;
    }
    return data ? mapListingViewRow(data as ListingViewRow) : null;
  }

  async findRecentByIp(
    listingId: ListingId,
    ipAddress: string,
    sinceIso: string,
  ): Promise<ListingView | null> {
    if (this.missing) return null;

    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .eq('ip_address', ipAddress)
      .is('viewer_id', null)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) return this.markMissing();
      throw error;
    }
    return data ? mapListingViewRow(data as ListingViewRow) : null;
  }

  async countByListing(listingId: ListingId): Promise<number> {
    if (this.missing) return 0;

    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listingId);

    if (error) {
      if (isMissingRelationError(error)) {
        this.markMissing();
        return 0;
      }
      throw error;
    }
    return count ?? 0;
  }

  async countUniqueByListing(listingId: ListingId): Promise<number> {
    if (this.missing) return 0;

    const { data, error } = await this.supabase
      .from(TABLE)
      .select('viewer_id, ip_address')
      .eq('listing_id', listingId);

    if (error) {
      if (isMissingRelationError(error)) {
        this.markMissing();
        return 0;
      }
      throw error;
    }

    const keys = new Set<string>();
    for (const row of data ?? []) {
      if (row.viewer_id) keys.add(`u:${row.viewer_id}`);
      else if (row.ip_address) keys.add(`ip:${row.ip_address}`);
    }
    return keys.size;
  }

  async countSince(listingId: ListingId, sinceIso: string): Promise<number> {
    if (this.missing) return 0;

    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listingId)
      .gte('created_at', sinceIso);

    if (error) {
      if (isMissingRelationError(error)) {
        this.markMissing();
        return 0;
      }
      throw error;
    }
    return count ?? 0;
  }
}
