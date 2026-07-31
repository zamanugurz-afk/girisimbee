import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type {
  MarketplaceDocument,
  CreateDocumentInput,
} from '@/features/documents/types/document.types';

export function createDocument(
  overrides: Partial<MarketplaceDocument> & CreateDocumentInput,
): MarketplaceDocument {
  return {
    id: overrides.id ?? ids.document(crypto.randomUUID()),
    ownerProfileId: overrides.ownerProfileId,
    listingId: overrides.listingId ?? null,
    documentType: overrides.documentType,
    name: overrides.name,
    storageBucket: overrides.storageBucket ?? 'marketplace-documents',
    storagePath: overrides.storagePath,
    mimeType: overrides.mimeType,
    sizeBytes: overrides.sizeBytes,
    visibility: overrides.visibility ?? 'private',
    metadata: overrides.metadata ?? {},
    ...timestamps(overrides.createdAt),
    ...softDeletable(overrides.deletedAt ?? null),
  };
}
