/**
 * Tag — searchable label attached to listings.
 *
 * Purpose: Enable discovery, filtering, and SEO; normalized tag vocabulary.
 * Relations: many-to-many with Listing via ListingTag junction.
 * Lifecycle: active ↔ merged (into another tag) → deleted
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { TagId, ListingId } from '@/lib/domain/ids';

export type TagStatus = 'active' | 'merged' | 'deleted';

export interface Tag extends Timestamps, SoftDeletable {
  id: TagId;
  slug: string;
  name: string;
  usageCount: number;
  status: TagStatus;
  mergedIntoId: TagId | null;
}

/** Junction table: listing_tags */
export interface ListingTag {
  listingId: ListingId;
  tagId: TagId;
  createdAt: string;
}

export type CreateTagInput = Pick<Tag, 'slug' | 'name'>;
export type UpdateTagInput = Partial<Pick<Tag, 'name' | 'status' | 'mergedIntoId'>>;

export interface TagFilter {
  status?: TagStatus | TagStatus[];
  query?: string;
  minUsageCount?: number;
  includeDeleted?: boolean;
}

export const TAG_INDEXES: IndexDefinition[] = [
  { name: 'tags_slug_unique', columns: ['slug'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'tags_name_trgm', columns: ['name'], type: 'gin' },
  { name: 'tags_usage_count_idx', columns: ['usage_count'] },
  { name: 'listing_tags_listing_id_idx', columns: ['listing_id'] },
  { name: 'listing_tags_tag_id_idx', columns: ['tag_id'] },
  { name: 'listing_tags_unique', columns: ['listing_id', 'tag_id'], unique: true },
];

export const TAG_LIFECYCLE: Record<TagStatus, readonly TagStatus[]> = {
  active: ['merged', 'deleted'],
  merged: ['deleted'],
  deleted: [],
};

export const TAG_VALIDATION: ValidationRule[] = [
  { field: 'slug', rule: 'required|slug|max:50', message: 'Geçerli tag slug gerekli.' },
  { field: 'name', rule: 'required|min:2|max:50', message: 'Tag adı 2–50 karakter.' },
];
