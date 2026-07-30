import { supabase } from '@/lib/supabase';
import type {
  FavoriteDTO,
  FavoriteResponse,
  FavoriteCreate,
  FavoriteUpdate,
  FavoriteFilter,
} from '@/types';

export class FavoriteService {
  private table = 'favorites';

  async getAll(filter?: FavoriteFilter): Promise<FavoriteResponse[]> {
    let q = supabase
      .from(this.table)
      .select('*, listing:listings(*, product:products(*), provider:providers(*))');
    if (filter?.listing_id) q = q.eq('listing_id', filter.listing_id);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as FavoriteResponse[]) ?? [];
  }

  async toggle(listingId: string, notes?: string): Promise<boolean> {
    const existing = await supabase
      .from(this.table)
      .select('id')
      .eq('listing_id', listingId)
      .maybeSingle();

    if (existing.data) {
      const { error } = await supabase.from(this.table).delete().eq('id', existing.data.id);
      if (error) throw new Error(error.message);
      return false;
    }

    const { error } = await supabase
      .from(this.table)
      .insert({ listing_id: listingId, notes: notes ?? null });
    if (error) throw new Error(error.message);
    return true;
  }

  async create(input: FavoriteCreate): Promise<FavoriteDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({ listing_id: input.listing_id, notes: input.notes ?? null })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FavoriteDTO;
  }

  async update(id: string, input: FavoriteUpdate): Promise<FavoriteDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FavoriteDTO;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async isFavorite(listingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.table)
      .select('id')
      .eq('listing_id', listingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async getFavoriteIds(): Promise<string[]> {
    const { data, error } = await supabase.from(this.table).select('listing_id');
    if (error) throw new Error(error.message);
    return (data as { listing_id: string }[])?.map((r) => r.listing_id) ?? [];
  }
}

export const favoriteService = new FavoriteService();
