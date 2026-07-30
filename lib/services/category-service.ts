import { supabase } from '@/lib/supabase';
import type {
  CategoryDTO,
  CategoryResponse,
  CategoryCreate,
  CategoryUpdate,
  CategoryFilter,
  ProductDTO,
} from '@/types';

export class CategoryService {
  private table = 'categories';

  async getAll(filter?: CategoryFilter): Promise<CategoryResponse[]> {
    let q = supabase.from(this.table).select('*');
    if (filter?.search) q = q.ilike('name', `%${filter.search}%`);
    const { data, error } = await q.order('sort_order').order('name');
    if (error) throw new Error(error.message);
    return (data as CategoryDTO[]) ?? [];
  }

  async getById(id: string): Promise<CategoryResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as CategoryResponse | null;
  }

  async getBySlug(slug: string): Promise<CategoryResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as CategoryResponse | null;
  }

  async create(input: CategoryCreate): Promise<CategoryDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .insert(input)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as CategoryDTO;
  }

  async update(id: string, input: CategoryUpdate): Promise<CategoryDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as CategoryDTO;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async getWithProductCount(): Promise<Array<CategoryResponse & { product_count: number }>> {
    const { data, error } = await supabase
      .from(this.table)
      .select(
        '*, products!inner(id)',
      );
    if (error) throw new Error(error.message);
    const cats = data as unknown as Array<CategoryDTO & { products: { id: string }[] }>;
    return (cats ?? []).map((c) => ({
      ...c,
      products: undefined,
      product_count: c.products?.length ?? 0,
    })) as Array<CategoryResponse & { product_count: number }>;
  }

  async getProducts(categoryId: string): Promise<ProductDTO[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    if (error) throw new Error(error.message);
    return (data as ProductDTO[]) ?? [];
  }
}

export const categoryService = new CategoryService();
