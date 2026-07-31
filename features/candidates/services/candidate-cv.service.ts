import { NotFoundError, ForbiddenError } from '@/lib/domain/errors';
import type { ProfileId, DocumentId } from '@/lib/domain/ids';
import type { DocumentVisibility } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { DocumentService } from '@/features/documents/services/document.service';
import type {
  CandidateCvPreview,
  CandidateCvDownload,
  RegisterCandidateCvInput,
} from '@/features/candidates/types/candidate-cv.types';

export class CandidateCvService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly documentService: DocumentService,
  ) {}

  async registerCv(profileId: ProfileId, input: RegisterCandidateCvInput) {
    const document = await this.documentService.register({
      ownerProfileId: profileId,
      documentType: 'cv',
      name: input.name,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageBucket: input.storageBucket ?? 'documents',
      visibility: input.visibility ?? 'private',
      metadata: input.metadata ?? {},
    });

    await this.moduleProfileRepo.upsertCandidateProfile({
      profileId,
      cvDocumentId: document.id,
    });

    return document;
  }

  async listCvs(profileId: ProfileId) {
    const documents = await this.documentService.listByOwner(profileId);
    return this.documentService.filterByType(documents, 'cv');
  }

  async previewCv(documentId: DocumentId, profileId: ProfileId): Promise<CandidateCvPreview> {
    const doc = await this.documentService.requireById(documentId);
    if (doc.ownerProfileId !== profileId) {
      throw new ForbiddenError('Belge sahibi değilsiniz.');
    }
    if (doc.documentType !== 'cv') {
      throw new NotFoundError('Document', documentId);
    }
    return this.toPreview(doc);
  }

  async downloadCv(documentId: DocumentId, profileId: ProfileId): Promise<CandidateCvDownload> {
    const doc = await this.documentService.requireById(documentId);
    if (doc.ownerProfileId !== profileId) {
      throw new ForbiddenError('Belge sahibi değilsiniz.');
    }
    if (doc.documentType !== 'cv') {
      throw new NotFoundError('Document', documentId);
    }
    return {
      document: doc,
      storageBucket: doc.storageBucket,
      storagePath: doc.storagePath,
    };
  }

  updateVisibility(documentId: DocumentId, profileId: ProfileId, visibility: DocumentVisibility) {
    return this.documentService.updateVisibility(documentId, profileId, visibility);
  }

  private toPreview(doc: Awaited<ReturnType<DocumentService['requireById']>>): CandidateCvPreview {
    return {
      id: doc.id,
      name: doc.name,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      visibility: doc.visibility,
      storageBucket: doc.storageBucket,
      storagePath: doc.storagePath,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
