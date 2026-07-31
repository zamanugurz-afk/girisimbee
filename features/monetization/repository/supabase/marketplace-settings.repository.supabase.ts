/**
 * Supabase marketplace settings repository.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import type { MarketplaceSettings } from '@/features/monetization/types/listing-package.types';
import type { MarketplaceSettingsRepository } from '@/features/monetization/repositories/marketplace-settings.repository';

const TABLE = 'marketplace_settings';
const ROW_ID = 'global';

interface SettingsRow {
  id: string;
  free_listing_limit: number;
  current_published_count: number;
  updated_at: string;
}

function mapRow(row: SettingsRow): MarketplaceSettings {
  return {
    id: 'global',
    freeListingLimit: row.free_listing_limit,
    currentPublishedCount: row.current_published_count,
    updatedAt: row.updated_at,
  };
}

export class SupabaseMarketplaceSettingsRepository implements MarketplaceSettingsRepository {
  constructor(private supabase: SupabaseClient) {}

  async get(): Promise<MarketplaceSettings> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('id', ROW_ID).maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        id: 'global',
        freeListingLimit: 100,
        currentPublishedCount: 0,
        updatedAt: now(),
      };
    }
    return mapRow(data as SettingsRow);
  }

  async updateFreeListingLimit(limit: number): Promise<MarketplaceSettings> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update({ free_listing_limit: limit, updated_at: now() })
      .eq('id', ROW_ID)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as SettingsRow);
  }

  async incrementPublishedCount(): Promise<MarketplaceSettings> {
    const current = await this.get();
    try {
      const { data, error } = await this.supabase
        .from(TABLE)
        .update({
          current_published_count: current.currentPublishedCount + 1,
          updated_at: now(),
        })
        .eq('id', ROW_ID)
        .select('*')
        .single();
      if (error) throw error;
      return mapRow(data as SettingsRow);
    } catch (error) {
      const supabaseError = error as { message?: string; details?: string; code?: string };
      console.error('[Supabase] marketplace_settings incrementPublishedCount failed — table:', TABLE);
      console.error('error.message:', supabaseError.message);
      console.error('error.details:', supabaseError.details);
      console.error('error.code:', supabaseError.code);
      return current;
    }
  }
}
