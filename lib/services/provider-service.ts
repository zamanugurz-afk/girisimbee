import { supabase } from '@/lib/supabase';
import type {
  ProviderDTO,
  ProviderResponse,
  ProviderCreate,
  ProviderUpdate,
  ProviderFilter,
} from '@/types';

export class ProviderService {
  private table = 'providers';

  async getAll(filter?: ProviderFilter): Promise<ProviderResponse[]> {
    let q = supabase.from(this.table).select('*');
    if (filter?.is_enabled !== undefined) q = q.eq('is_enabled', filter.is_enabled);
    const { data, error } = await q.order('name');
    if (error) throw new Error(error.message);
    return (data as ProviderDTO[]) ?? [];
  }

  async getById(id: string): Promise<ProviderResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ProviderResponse | null;
  }

  async getBySlug(slug: string): Promise<ProviderResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ProviderResponse | null;
  }

  async create(input: ProviderCreate): Promise<ProviderDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({ ...input, is_enabled: input.is_enabled ?? true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ProviderDTO;
  }

  async update(id: string, input: ProviderUpdate): Promise<ProviderDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ProviderDTO;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export const providerService = new ProviderService();
