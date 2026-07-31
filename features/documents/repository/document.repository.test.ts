import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MockDocumentRepository } from '@/features/documents/repository/mock/document.repository.mock';

describe('DocumentRepository (mock)', () => {
  let repo: MockDocumentRepository;
  const owner = ids.profile('p0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    repo = new MockDocumentRepository();
  });

  it('creates and finds document by id', async () => {
    const doc = await repo.create({
      ownerProfileId: owner,
      documentType: 'pitch_deck',
      name: 'pitch.pdf',
      storagePath: `${owner}/pitch.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      visibility: 'private',
    });
    const found = await repo.findById(doc.id);
    expect(found?.documentType).toBe('pitch_deck');
  });

  it('finds documents by owner', async () => {
    await repo.create({
      ownerProfileId: owner,
      documentType: 'cv',
      name: 'cv.pdf',
      storagePath: `${owner}/cv.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 512,
    });
    const docs = await repo.findByOwner(owner);
    expect(docs).toHaveLength(1);
  });

  it('soft deletes and restores document', async () => {
    const doc = await repo.create({
      ownerProfileId: owner,
      documentType: 'other',
      name: 'file.pdf',
      storagePath: `${owner}/file.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 256,
    });
    await repo.softDelete(doc.id);
    expect(await repo.findById(doc.id)).toBeNull();
    const restored = await repo.restore(doc.id);
    expect(restored.deletedAt).toBeNull();
  });
});
