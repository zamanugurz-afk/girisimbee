import { supabase } from '@/lib/supabase';
import type {
  ProductDTO,
  ProductResponse,
  ProductCreate,
  ProductUpdate,
  ProductFilter,
} from '@/types';

export class ProductService {
  private table = 'products';

  async getAll(filter?: ProductFilter): Promise<ProductResponse[]> {
    let q = supabase
      .from(this.table)
      .select('*, category:categories(*)');
    if (filter?.search) q = q.or(`name.ilike.%${filter.search}%,brand.ilike.%${filter.search}%`);
    if (filter?.category_id) q = q.eq('category_id', filter.category_id);
    if (filter?.brand) q = q.eq('brand', filter.brand);
    if (filter?.is_active !== undefined) q = q.eq('is_active', filter.is_active);
    const { data, error } = await q.order('brand').order('name');
    if (error) throw new Error(error.message);
    return (data as ProductResponse[]) ?? [];
  }

  async getById(id: string): Promise<ProductResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ProductResponse | null;
  }

  async getBySlug(slug: string): Promise<ProductResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ProductResponse | null;
  }

  async getByCategory(categoryId: string): Promise<ProductDTO[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    if (error) throw new Error(error.message);
    return (data as ProductDTO[]) ?? [];
  }

  async create(input: ProductCreate): Promise<ProductDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({ ...input, is_active: input.is_active ?? true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ProductDTO;
  }

  async update(id: string, input: ProductUpdate): Promise<ProductDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ProductDTO;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export const productService = new ProductService();
