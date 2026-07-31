import type { DocumentId, ProfileId } from '@/lib/domain/ids';
import type { DocumentVisibility } from '@/lib/domain/marketplace-enums';
import type { MarketplaceDocument } from '@/features/documents/types/document.types';

export interface CandidateCvPreview {
  id: DocumentId;
  name: string;
  mimeType: string;
  sizeBytes: number;
  visibility: DocumentVisibility;
  storageBucket: string;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateCvDownload {
  document: MarketplaceDocument;
  storageBucket: string;
  storagePath: string;
}

export interface RegisterCandidateCvInput {
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  storageBucket?: string;
  visibility?: DocumentVisibility;
  metadata?: Record<string, unknown>;
}

export interface UpdateCandidateCvVisibilityInput {
  documentId: DocumentId;
  visibility: DocumentVisibility;
}
