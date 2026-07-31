import type { Repository } from '@/lib/domain/repository';
import type { DocumentId } from '@/lib/domain/ids';
import type {
  MarketplaceDocument,
  CreateDocumentInput,
  DocumentFilter,
} from '@/features/documents/types/document.types';

export type UpdateDocumentInput = Partial<
  Pick<
    MarketplaceDocument,
    'name' | 'listingId' | 'visibility' | 'metadata' | 'documentType'
  >
>;

export interface DocumentRepository
  extends Omit<
    Repository<
      MarketplaceDocument,
      DocumentId,
      CreateDocumentInput,
      UpdateDocumentInput,
      DocumentFilter
    >,
    'restore'
  > {
  findByOwner(ownerProfileId: MarketplaceDocument['ownerProfileId']): Promise<MarketplaceDocument[]>;
  restore(id: DocumentId): Promise<MarketplaceDocument>;
}
