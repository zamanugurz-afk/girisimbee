import type { Repository } from '@/lib/domain/repository';
import type { CategoryId } from '@/lib/domain/ids';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilter } from '@/features/categories/types/category.entity.types';

export interface CategoryRepository
  extends Repository<Category, CategoryId, CreateCategoryInput, UpdateCategoryInput, CategoryFilter> {
  findBySlug(slug: string): Promise<Category | null>;
  findAllActive(): Promise<Category[]>;
  incrementListingCount(id: CategoryId, delta?: number): Promise<void>;
}
