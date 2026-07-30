/**
 * Favorite — saved listing bookmark.
 *
 * Purpose: Allow users to track listings of interest.
 * Relations: belongs to User and Listing.
 * Lifecycle: active → deleted (no intermediate states)
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { FavoriteId, UserId, ListingId } from '@/lib/domain/ids';

export type FavoriteStatus = 'active' | 'deleted';

export interface Favorite extends Timestamps, SoftDeletable {
  id: FavoriteId;
  userId: UserId;
  listingId: ListingId;
  status: FavoriteStatus;
  note: string | null;
}

export type CreateFavoriteInput = Pick<Favorite, 'userId' | 'listingId'> & { note?: string | null };
export type UpdateFavoriteInput = Partial<Pick<Favorite, 'note' | 'status'>>;

export interface FavoriteFilter {
  userId?: UserId;
  listingId?: ListingId;
  status?: FavoriteStatus;
  includeDeleted?: boolean;
}

export const FAVORITE_INDEXES: IndexDefinition[] = [
  { name: 'favorites_user_listing_unique', columns: ['user_id', 'listing_id'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'favorites_user_id_idx', columns: ['user_id'] },
  { name: 'favorites_listing_id_idx', columns: ['listing_id'] },
  { name: 'favorites_created_at_idx', columns: ['created_at'] },
];

export const FAVORITE_LIFECYCLE: Record<FavoriteStatus, readonly FavoriteStatus[]> = {
  active: ['deleted'],
  deleted: [],
};

export const FAVORITE_VALIDATION: ValidationRule[] = [
  { field: 'userId', rule: 'required|uuid', message: 'Kullanıcı gerekli.' },
  { field: 'listingId', rule: 'required|uuid', message: 'İlan gerekli.' },
  { field: 'note', rule: 'nullable|max:500', message: 'Not en fazla 500 karakter.' },
];
