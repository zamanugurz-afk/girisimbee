import { NotFoundError, ForbiddenError } from '@/lib/domain/errors';
import type { DocumentId, ProfileId, ListingId } from '@/lib/domain/ids';
import type { DocumentRepository } from '@/features/documents/repositories/document.repository';
import type {
  MarketplaceDocument,
  CreateDocumentInput,
} from '@/features/documents/types/document.types';
import type { DocumentType, DocumentVisibility } from '@/lib/domain/marketplace-enums';

export interface RegisterDocumentInput extends CreateDocumentInput {
  id?: DocumentId;
}

export class DocumentService {
  constructor(private readonly repo: DocumentRepository) {}

  register(input: RegisterDocumentInput): Promise<MarketplaceDocument> {
    return this.repo.create(input);
  }

  getById(id: DocumentId): Promise<MarketplaceDocument | null> {
    return this.repo.findById(id);
  }

  async requireById(id: DocumentId): Promise<MarketplaceDocument> {
    const doc = await this.repo.findById(id);
    if (!doc) throw new NotFoundError('Document', id);
    return doc;
  }

  listByOwner(ownerProfileId: ProfileId): Promise<MarketplaceDocument[]> {
    return this.repo.findByOwner(ownerProfileId);
  }

  async linkToListing(id: DocumentId, listingId: ListingId, ownerProfileId: ProfileId): Promise<MarketplaceDocument> {
    const doc = await this.requireById(id);
    if (doc.ownerProfileId !== ownerProfileId) {
      throw new ForbiddenError('Belge sahibi değilsiniz.');
    }
    return this.repo.update(id, { listingId });
  }

  async updateVisibility(
    id: DocumentId,
    ownerProfileId: ProfileId,
    visibility: DocumentVisibility,
  ): Promise<MarketplaceDocument> {
    const doc = await this.requireById(id);
    if (doc.ownerProfileId !== ownerProfileId) {
      throw new ForbiddenError('Belge sahibi değilsiniz.');
    }
    return this.repo.update(id, { visibility });
  }

  async softDelete(id: DocumentId, ownerProfileId: ProfileId): Promise<void> {
    const doc = await this.requireById(id);
    if (doc.ownerProfileId !== ownerProfileId) {
      throw new ForbiddenError('Belge sahibi değilsiniz.');
    }
    await this.repo.softDelete(id);
  }

  filterByType(documents: MarketplaceDocument[], type: DocumentType): MarketplaceDocument[] {
    return documents.filter((d) => d.documentType === type);
  }
}
