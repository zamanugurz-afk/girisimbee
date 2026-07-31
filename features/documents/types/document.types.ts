import type { Timestamps, SoftDeletable } from '@/lib/domain/base';
import type {
  DocumentType,
  DocumentVisibility,
} from '@/lib/domain/marketplace-enums';
import type { DocumentId, ProfileId, ListingId } from '@/lib/domain/ids';

export interface MarketplaceDocument extends Timestamps, SoftDeletable {
  id: DocumentId;
  ownerProfileId: ProfileId;
  listingId: ListingId | null;
  documentType: DocumentType;
  name: string;
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  visibility: DocumentVisibility;
  metadata: Record<string, unknown>;
}

export type CreateDocumentInput = Pick<
  MarketplaceDocument,
  'ownerProfileId' | 'documentType' | 'name' | 'storagePath' | 'mimeType' | 'sizeBytes'
> & {
  listingId?: ListingId | null;
  storageBucket?: string;
  visibility?: DocumentVisibility;
  metadata?: Record<string, unknown>;
};

export interface DocumentFilter {
  ownerProfileId?: ProfileId;
  listingId?: ListingId;
  documentType?: DocumentType;
  includeDeleted?: boolean;
}
