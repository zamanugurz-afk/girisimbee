import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { DocumentService } from '@/features/documents/services/document.service';
import { MockDocumentRepository } from '@/features/documents/repository/mock/document.repository.mock';

describe('DocumentService', () => {
  let service: DocumentService;
  let repo: MockDocumentRepository;
  const ownerProfileId = ids.profile('p0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    repo = new MockDocumentRepository();
    service = new DocumentService(repo);
  });

  it('registers and retrieves document', async () => {
    const doc = await service.register({
      ownerProfileId,
      documentType: 'pitch_deck',
      name: 'deck.pdf',
      storagePath: '/uploads/deck.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      visibility: 'private',
    });

    const found = await service.requireById(doc.id);
    expect(found.name).toBe('deck.pdf');
  });

  it('enforces owner on visibility update', async () => {
    const doc = await service.register({
      ownerProfileId,
      documentType: 'cv',
      name: 'cv.pdf',
      storagePath: '/uploads/cv.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 512,
      visibility: 'private',
    });

    const other = ids.profile('p0000001-0001-4000-8000-000000000002');
    await expect(service.updateVisibility(doc.id, other, 'public')).rejects.toThrow('Belge sahibi değilsiniz');
  });
});
