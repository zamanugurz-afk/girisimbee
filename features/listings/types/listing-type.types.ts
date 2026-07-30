/**
 * ListingType — subtype schema within a category.
 *
 * Purpose: Define dynamic fields per listing kind (Series A, Full-time, Technical Co-founder).
 * Relations: belongs to Category; has many Listings.
 * Lifecycle: active ↔ inactive
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';

export type ListingTypeStatus = 'active' | 'inactive' | 'deleted';

/** JSON Schema subset for dynamic listing fields. */
export interface ListingFieldSchema {
  fields: ListingFieldDefinition[];
}

export interface ListingFieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'currency' | 'percentage' | 'date';
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

export interface ListingType extends Timestamps, SoftDeletable {
  id: ListingTypeId;
  categoryId: CategoryId;
  slug: string;
  name: string;
  description: string | null;
  fieldSchema: ListingFieldSchema;
  sortOrder: number;
  status: ListingTypeStatus;
}

export type CreateListingTypeInput = Pick<ListingType, 'categoryId' | 'slug' | 'name' | 'fieldSchema'> & {
  description?: string | null;
  sortOrder?: number;
};

export type UpdateListingTypeInput = Partial<
  Omit<ListingType, 'id' | 'categoryId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

export interface ListingTypeFilter {
  categoryId?: CategoryId;
  status?: ListingTypeStatus | ListingTypeStatus[];
  slug?: string;
  includeDeleted?: boolean;
}

export const LISTING_TYPE_INDEXES: IndexDefinition[] = [
  { name: 'listing_types_category_slug_unique', columns: ['category_id', 'slug'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'listing_types_category_id_idx', columns: ['category_id'] },
  { name: 'listing_types_status_idx', columns: ['status'] },
];

export const LISTING_TYPE_LIFECYCLE: Record<ListingTypeStatus, readonly ListingTypeStatus[]> = {
  active: ['inactive', 'deleted'],
  inactive: ['active', 'deleted'],
  deleted: [],
};

export const LISTING_TYPE_VALIDATION: ValidationRule[] = [
  { field: 'slug', rule: 'required|slug', message: 'Geçerli slug gerekli.' },
  { field: 'name', rule: 'required|min:2|max:100', message: 'Tip adı gerekli.' },
  { field: 'fieldSchema', rule: 'required|object', message: 'Alan şeması gerekli.' },
];
