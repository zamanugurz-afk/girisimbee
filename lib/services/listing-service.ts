import { supabase } from '@/lib/supabase';
import type {
  ListingDTO,
  ListingResponse,
  ListingCreate,
  ListingUpdate,
  ListingFilter,
} from '@/types';

export class ListingService {
  private table = 'listings';

  private buildQuery(filter?: ListingFilter) {
    let q = supabase
      .from(this.table)
      .select(
        '*, provider:providers(*), product:products(*, category:categories(*)), seller:sellers(*), ai_analysis:ai_analysis(*)',
      );

    if (filter?.provider_id) q = q.eq('provider_id', filter.provider_id);
    if (filter?.product_id) q = q.eq('product_id', filter.product_id);
    if (filter?.category_id) {
      q = q.eq('product.category_id', filter.category_id);
    }
    if (filter?.city) q = q.eq('city', filter.city);
    if (filter?.district) q = q.eq('district', filter.district);
    if (filter?.condition && filter.condition !== 'all') q = q.eq('condition', filter.condition);
    if (filter?.min_price !== null && filter?.min_price !== undefined) q = q.gte('price', filter.min_price);
    if (filter?.max_price !== null && filter?.max_price !== undefined) q = q.lte('price', filter.max_price);
    if (filter?.is_active !== undefined) q = q.eq('is_active', filter.is_active);
    if (filter?.exclude_deleted !== false) q = q.is('deleted_at', null);
    if (filter?.search) {
      q = q.or(
        `title.ilike.%${filter.search}%,description.ilike.%${filter.search}%,district.ilike.%${filter.search}%`,
      );
    }

    return q;
  }

  async getAll(filter?: ListingFilter, limit = 100, offset = 0): Promise<ListingResponse[]> {
    let q = this.buildQuery(filter);
    q = q.range(offset, offset + limit - 1);

    switch (filter?.sort) {
      case 'lowest-price':
        q = q.order('price', { ascending: true });
        break;
      case 'newest':
        q = q.order('listing_date', { ascending: false });
        break;
      case 'highest-ai':
        q = q.order('ai_analysis.opportunity_score', { ascending: false });
        break;
      case 'highest-opportunity':
        q = q.order('ai_analysis.opportunity_score', { ascending: false });
        break;
      case 'biggest-discount':
        q = q.order('price', { ascending: true });
        break;
      default:
        q = q.order('last_seen_at', { ascending: false });
    }

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data as ListingResponse[]) ?? [];
  }

  async getById(id: string): Promise<ListingResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select(
        '*, provider:providers(*), product:products(*, category:categories(*)), seller:sellers(*), ai_analysis:ai_analysis(*)',
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ListingResponse | null;
  }

  async getByExternalId(providerId: string, externalId: string): Promise<ListingDTO | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('provider_id', providerId)
      .eq('external_listing_id', externalId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ListingDTO | null;
  }

  async upsert(input: ListingCreate): Promise<ListingDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .upsert(
        {
          ...input,
          image_urls: input.image_urls ?? [],
          currency: input.currency ?? 'TRY',
          district: input.district ?? '',
          city: input.city ?? 'Istanbul',
          condition: input.condition ?? 'used',
        },
        { onConflict: 'provider_id,external_listing_id' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ListingDTO;
  }

  async create(input: ListingCreate): Promise<ListingDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({
        ...input,
        image_urls: input.image_urls ?? [],
        currency: input.currency ?? 'TRY',
        district: input.district ?? '',
        city: input.city ?? 'Istanbul',
        condition: input.condition ?? 'used',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ListingDTO;
  }

  async update(id: string, input: ListingUpdate): Promise<ListingDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ListingDTO;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async restore(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .update({ deleted_at: null, is_active: true })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  async count(filter?: ListingFilter): Promise<number> {
    let q = supabase.from(this.table).select('id', { count: 'exact', head: true });
    if (filter?.provider_id) q = q.eq('provider_id', filter.provider_id);
    if (filter?.product_id) q = q.eq('product_id', filter.product_id);
    if (filter?.is_active !== undefined) q = q.eq('is_active', filter.is_active);
    if (filter?.exclude_deleted !== false) q = q.is('deleted_at', null);
    const { count, error } = await q;
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}

export const listingService = new ListingService();
