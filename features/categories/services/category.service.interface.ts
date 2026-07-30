import type { CategoryId } from '@/lib/domain/ids';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilter } from '@/features/categories/types/category.entity.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface ICategoryService {
  create(input: CreateCategoryInput): Promise<Category>;
  getById(id: CategoryId): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
  listActive(): Promise<Category[]>;
  update(id: CategoryId, input: UpdateCategoryInput): Promise<Category>;
  deactivate(id: CategoryId): Promise<Category>;
  search(filter: CategoryFilter, pagination?: PaginationParams): Promise<PaginatedResult<Category>>;
  delete(id: CategoryId): Promise<void>;
}
