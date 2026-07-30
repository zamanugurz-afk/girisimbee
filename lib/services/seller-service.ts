import { supabase } from '@/lib/supabase';
import type {
  SellerDTO,
  SellerResponse,
  SellerCreate,
  SellerUpdate,
  SellerFilter,
} from '@/types';

export class SellerService {
  private table = 'sellers';

  async getAll(filter?: SellerFilter): Promise<SellerResponse[]> {
    let q = supabase
      .from(this.table)
      .select('*, provider:providers(*)');
    if (filter?.provider_id) q = q.eq('provider_id', filter.provider_id);
    if (filter?.search) q = q.ilike('display_name', `%${filter.search}%`);
    if (filter?.min_rating !== undefined) q = q.gte('rating', filter.min_rating);
    if (filter?.verified_only) q = q.or('phone_verified.eq.true,email_verified.eq.true');
    const { data, error } = await q.order('rating', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as SellerResponse[]) ?? [];
  }

  async getById(id: string): Promise<SellerResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, provider:providers(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as SellerResponse | null;
  }

  async getByExternalId(providerId: string, externalId: string): Promise<SellerDTO | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('provider_id', providerId)
      .eq('external_id', externalId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as SellerDTO | null;
  }

  async upsert(input: SellerCreate): Promise<SellerDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .upsert(
        {
          provider_id: input.provider_id,
          external_id: input.external_id,
          display_name: input.display_name,
          member_since: input.member_since ?? null,
          listing_count: input.listing_count ?? 0,
          rating: input.rating ?? 0,
          phone_verified: input.phone_verified ?? false,
          email_verified: input.email_verified ?? false,
        },
        { onConflict: 'provider_id,external_id' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as SellerDTO;
  }

  async update(id: string, input: SellerUpdate): Promise<SellerDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as SellerDTO;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export const sellerService = new SellerService();
