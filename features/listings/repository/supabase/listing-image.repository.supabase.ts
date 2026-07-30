/**
 * Supabase listing image repository — marketplace_listing_images.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingId } from '@/lib/domain/ids';
import type { ListingImage } from '@/features/listings/types/listing-engine.types';
import type { ListingImageRepository } from '@/features/listings/repository/listing-image.repository';

const TABLE = 'marketplace_listing_images';

interface ImageRow {
  id: string;
  listing_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

function mapImageRow(row: ImageRow): ListingImage {
  return {
    id: row.id,
    listingId: row.listing_id as ListingId,
    url: row.url,
    alt: row.alt,
    sortOrder: row.sort_order,
  };
}

export class SupabaseListingImageRepository implements ListingImageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByListingId(listingId: ListingId): Promise<ListingImage[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('listing_id', listingId)
      .order('sort_order');
    if (error) throw error;
    return (data ?? []).map((row) => mapImageRow(row as ImageRow));
  }

  async setForListing(
    listingId: ListingId,
    images: Omit<ListingImage, 'id' | 'listingId'>[],
  ): Promise<ListingImage[]> {
    await this.deleteByListingId(listingId);
    if (!images.length) return [];
    const rows = images.map((img, i) => ({
      listing_id: listingId,
      url: img.url,
      alt: img.alt ?? null,
      sort_order: img.sortOrder ?? i,
    }));
    const { data, error } = await this.supabase.from(TABLE).insert(rows).select('*');
    if (error) throw error;
    return (data ?? []).map((row) => mapImageRow(row as ImageRow));
  }

  async deleteByListingId(listingId: ListingId): Promise<void> {
    const { error } = await this.supabase.from(TABLE).delete().eq('listing_id', listingId);
    if (error) throw error;
  }
}
