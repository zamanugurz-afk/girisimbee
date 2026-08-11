/**
 * Category — top-level marketplace intent (Yatırım Arıyorum, Ortak Arıyorum, etc.).
 *
 * Purpose: Route users to the correct marketplace vertical; drives homepage intent gateway.
 * Relations: has many ListingTypes, Listings.
 * Lifecycle: active ↔ inactive (soft delete for archival)
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { CategoryId } from '@/lib/domain/ids';

export type CategoryStatus = 'active' | 'inactive' | 'deleted';

export interface Category extends Timestamps, SoftDeletable {
  id: CategoryId;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  accentColor: string;
  sortOrder: number;
  status: CategoryStatus;
  listingCount: number;
}

export type CreateCategoryInput = Pick<Category, 'slug' | 'name' | 'accentColor'> & {
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
};

export type UpdateCategoryInput = Partial<
  Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'listingCount'>
>;

export interface CategoryFilter {
  status?: CategoryStatus | CategoryStatus[];
  slug?: string;
  includeDeleted?: boolean;
}

export const CATEGORY_INDEXES: IndexDefinition[] = [
  { name: 'categories_slug_unique', columns: ['slug'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'categories_status_sort_idx', columns: ['status', 'sort_order'] },
];

export const CATEGORY_LIFECYCLE: Record<CategoryStatus, readonly CategoryStatus[]> = {
  active: ['inactive', 'deleted'],
  inactive: ['active', 'deleted'],
  deleted: [],
};

export const CATEGORY_VALIDATION: ValidationRule[] = [
  { field: 'slug', rule: 'required|slug|max:80', message: 'Geçerli slug gerekli.' },
  { field: 'name', rule: 'required|min:2|max:100', message: 'Kategori adı gerekli.' },
  { field: 'accentColor', rule: 'required|hex_color', message: 'Geçerli renk kodu.' },
];
