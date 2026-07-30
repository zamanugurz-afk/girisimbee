/**
 * Attachment — files linked to listings (pitch deck, business plan, demo).
 *
 * Purpose: Store supporting documents; enable due diligence.
 * Relations: belongs to Listing.
 * Lifecycle: uploading → ready → deleted (virus scan gate)
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { AttachmentId, ListingId, UserId } from '@/lib/domain/ids';

export type AttachmentType = 'pdf' | 'video' | 'image' | 'document' | 'link';
export type AttachmentStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';

export interface Attachment extends Timestamps, SoftDeletable {
  id: AttachmentId;
  listingId: ListingId;
  uploadedById: UserId;
  name: string;
  type: AttachmentType;
  mimeType: string;
  url: string;
  sizeBytes: number;
  status: AttachmentStatus;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export type CreateAttachmentInput = Pick<
  Attachment,
  'listingId' | 'uploadedById' | 'name' | 'type' | 'mimeType' | 'url' | 'sizeBytes'
> & { sortOrder?: number };

export type UpdateAttachmentInput = Partial<
  Pick<Attachment, 'name' | 'status' | 'sortOrder' | 'metadata'>
>;

export interface AttachmentFilter {
  listingId?: ListingId;
  uploadedById?: UserId;
  type?: AttachmentType;
  status?: AttachmentStatus | AttachmentStatus[];
  includeDeleted?: boolean;
}

export const ATTACHMENT_INDEXES: IndexDefinition[] = [
  { name: 'attachments_listing_id_idx', columns: ['listing_id'] },
  { name: 'attachments_status_idx', columns: ['status'] },
  { name: 'attachments_listing_sort_idx', columns: ['listing_id', 'sort_order'] },
];

export const ATTACHMENT_LIFECYCLE: Record<AttachmentStatus, readonly AttachmentStatus[]> = {
  uploading: ['processing', 'failed', 'deleted'],
  processing: ['ready', 'failed', 'deleted'],
  ready: ['deleted'],
  failed: ['uploading', 'deleted'],
  deleted: [],
};

export const ATTACHMENT_VALIDATION: ValidationRule[] = [
  { field: 'name', rule: 'required|max:255', message: 'Dosya adı gerekli.' },
  { field: 'sizeBytes', rule: 'required|integer|max:52428800', message: 'Dosya en fazla 50MB.' },
  { field: 'mimeType', rule: 'required|in:allowed_mime_types', message: 'Desteklenmeyen dosya tipi.' },
];
