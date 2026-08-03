/**
 * Supabase marketplace_listing_placements repository.
 * Maps package_slug / starts_at / ends_at onto placement_type / started_at / expires_at.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingId, ListingPlacementId, UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { ListingPlacementStatus } from '@/features/monetization/types/listing-placement.types';
import type { ListingPlacementRepository } from '@/features/monetization/repositories/listing-placement.repository';
import type {
  ListingPlacementRecord,
  PlacementType,
} from '@/features/monetization/types/listing-placement-record.types';
import {
  mapMarketplaceListingPlacementRow,
  type MarketplaceListingPlacementRow,
} from '@/features/monetization/repository/supabase/listing-placement.mapper';

const TABLE = 'marketplace_listing_placements';
const LISTINGS_TABLE = 'marketplace_listings';

export class SupabaseListingPlacementRepository implements ListingPlacementRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: ListingPlacementId): Promise<ListingPlacementRecord | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data
      ? mapMarketplaceListingPlacementRow(data as MarketplaceListingPlacementRow)
      : null;
  }

  private async listingIdsForUser(userId: UserId): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(LISTINGS_TABLE)
      .select('id')
      .eq('owner_id', userId)
      .is('deleted_at', null);
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) => String(row.id));
  }

  async listByUserId(userId: UserId): Promise<ListingPlacementRecord[]> {
    const listingIds = await this.listingIdsForUser(userId);
    if (listingIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }

    return (data ?? []).map((row) =>
      mapMarketplaceListingPlacementRow(
        row as MarketplaceListingPlacementRow,
        userId,
      ),
    );
  }

  async listByUserIdAndType(
    userId: UserId,
    placementType: PlacementType,
  ): Promise<ListingPlacementRecord[]> {
    const all = await this.listByUserId(userId);
    return all.filter((row) => row.placementType === placementType);
  }

  async updateStatus(
    id: ListingPlacementId,
    status: ListingPlacementStatus,
  ): Promise<ListingPlacementRecord> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapMarketplaceListingPlacementRow(data as MarketplaceListingPlacementRow);
  }

  async updateExpiresAt(
    id: ListingPlacementId,
    expiresAt: string,
    status?: ListingPlacementStatus,
  ): Promise<ListingPlacementRecord> {
    const patch: Record<string, unknown> = {
      ends_at: expiresAt,
      updated_at: new Date().toISOString(),
    };
    if (status) patch.status = status;

    const { data, error } = await this.supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapMarketplaceListingPlacementRow(data as MarketplaceListingPlacementRow);
  }

  async expireOverdue(nowIso = new Date().toISOString()): Promise<number> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ status: 'expired', updated_at: nowIso })
      .in('status', ['active', 'pending'])
      .lte('ends_at', nowIso)
      .select('id');

    if (error) {
      if (isMissingRelationError(error)) return 0;
      throw error;
    }
    return data?.length ?? 0;
  }

  async listActiveByListingId(
    listingId: ListingId,
  ): Promise<ListingPlacementRecord[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .eq('status', 'active');
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) =>
      mapMarketplaceListingPlacementRow(row as MarketplaceListingPlacementRow),
    );
  }
}
