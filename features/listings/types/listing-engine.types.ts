/**
 * Listing Engine — unified payload types for create/update operations.
 * Category-specific data lives exclusively in customFields (validated by fieldSchema).
 */
import type { UserId, CompanyId, CategoryId, ListingTypeId, ListingId } from '@/lib/domain/ids';
import type { RemotePolicy } from '@/features/listings/types/listing.entity.types';
import type { Attachment } from '@/features/listings/types/attachment.types';
import type { Tag } from '@/features/listings/types/tag.types';
import type { Activity } from '@/features/shared/types/activity.types';

/** Shared fields present on every listing regardless of category. */
export interface CoreListingFields {
  title: string;
  shortDescription: string;
  longDescription?: string;
  location?: string | null;
  city?: string | null;
  country?: string;
  remotePolicy?: RemotePolicy | null;
  companyId?: CompanyId | null;
}

export interface ListingImageInput {
  url: string;
  alt?: string | null;
  sortOrder?: number;
}

export interface ListingImage extends ListingImageInput {
  id: string;
  listingId: ListingId;
}

export interface CreateListingPayload {
  ownerId: UserId;
  categoryId: CategoryId;
  listingTypeId: ListingTypeId;
  core: CoreListingFields;
  customFields: Record<string, unknown>;
  tags?: string[];
  images?: ListingImageInput[];
  attachmentIds?: string[];
  asDraft?: boolean;
}

export interface UpdateListingPayload {
  core?: Partial<CoreListingFields>;
  customFields?: Record<string, unknown>;
  tags?: string[];
  images?: ListingImageInput[];
  asDraft?: boolean;
}

/** Full listing aggregate returned by the engine. */
export interface ListingAggregate {
  listing: import('@/features/listings/types/listing.entity.types').Listing;
  tags: Tag[];
  images: ListingImage[];
  attachments: Attachment[];
  activityHistory: Activity[];
}

export interface ListingEngineContext {
  actorId: UserId;
}

export type ListingEngineOperation =
  | 'create'
  | 'update'
  | 'publish'
  | 'renew'
  | 'mark_sold'
  | 'archive'
  | 'soft_delete'
  | 'restore'
  | 'duplicate';
