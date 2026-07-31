import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';
import type { DocumentId, ProfileId, ListingId } from '@/lib/domain/ids';
import type { DocumentType, DocumentVisibility } from '@/lib/domain/marketplace-enums';
import type { MarketplaceDocument } from '@/features/documents/types/document.types';

export interface DocumentRow {
  id: string;
  owner_profile_id: string;
  listing_id: string | null;
  document_type: string;
  name: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  visibility: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function mapDocumentRow(row: DocumentRow): MarketplaceDocument {
  return {
    id: row.id as DocumentId,
    ownerProfileId: row.owner_profile_id as ProfileId,
    listingId: row.listing_id as ListingId | null,
    documentType: row.document_type as DocumentType,
    name: row.name,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    visibility: row.visibility as DocumentVisibility,
    metadata: row.metadata ?? {},
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export function toDocumentRow(input: Partial<MarketplaceDocument>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.ownerProfileId !== undefined) row.owner_profile_id = input.ownerProfileId;
  if (input.listingId !== undefined) row.listing_id = input.listingId;
  if (input.documentType !== undefined) row.document_type = input.documentType;
  if (input.name !== undefined) row.name = input.name;
  if (input.storageBucket !== undefined) row.storage_bucket = input.storageBucket;
  if (input.storagePath !== undefined) row.storage_path = input.storagePath;
  if (input.mimeType !== undefined) row.mime_type = input.mimeType;
  if (input.sizeBytes !== undefined) row.size_bytes = input.sizeBytes;
  if (input.visibility !== undefined) row.visibility = input.visibility;
  if (input.metadata !== undefined) row.metadata = input.metadata;
  if (input.deletedAt !== undefined) row.deleted_at = input.deletedAt;
  return row;
}
