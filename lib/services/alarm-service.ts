import { supabase } from '@/lib/supabase';
import type {
  AlarmDTO,
  AlarmResponse,
  AlarmCreate,
  AlarmUpdate,
  AlarmFilter,
} from '@/types';

export class AlarmService {
  private table = 'alarms';

  async getAll(filter?: AlarmFilter): Promise<AlarmResponse[]> {
    let q = supabase
      .from(this.table)
      .select('*, product:products(*)');
    if (filter?.product_id) q = q.eq('product_id', filter.product_id);
    if (filter?.is_enabled !== undefined) q = q.eq('is_enabled', filter.is_enabled);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as AlarmResponse[]) ?? [];
  }

  async getById(id: string): Promise<AlarmResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, product:products(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as AlarmResponse | null;
  }

  async create(input: AlarmCreate): Promise<AlarmDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({ ...input, is_enabled: input.is_enabled ?? true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AlarmDTO;
  }

  async update(id: string, input: AlarmUpdate): Promise<AlarmDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AlarmDTO;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async getByProduct(productId: string): Promise<AlarmDTO[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('product_id', productId)
      .eq('is_enabled', true);
    if (error) throw new Error(error.message);
    return (data as AlarmDTO[]) ?? [];
  }
}

export const alarmService = new AlarmService();
