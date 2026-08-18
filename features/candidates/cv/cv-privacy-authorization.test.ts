import { describe, expect, it } from 'vitest';
import { CandidateCvService } from '@/features/candidates/services/candidate-cv.service';
import { DocumentService } from '@/features/documents/services/document.service';
import { MockDocumentRepository } from '@/features/documents/repository/mock/document.repository.mock';
import { MockModuleProfileRepository } from '@/features/profiles/repository/mock/module-profile.repository.mock';
import { ids } from '@/lib/domain/ids';
import { ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';

describe('CV Privacy & Authorization QA', () => {
  it('enforces private visibility and blocks unauthorized users from viewing or downloading CVs', async () => {
    const candidateProfileId = ids.profile('candidate-prof-1');
    const unauthorizedProfileId = ids.profile('stranger-prof-2');

    const docRepo = new MockDocumentRepository();
    const docService = new DocumentService(docRepo);
    const moduleRepo = new MockModuleProfileRepository();
    const cvService = new CandidateCvService(moduleRepo, docService);

    // 1. Candidate registers private CV
    const registered = await cvService.registerCv(candidateProfileId, {
      name: 'ozgecmis.pdf',
      storagePath: 'cvs/candidate-prof-1/ozgecmis.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 102400,
      visibility: 'private',
    });

    expect(registered.visibility).toBe('private');

    // 2. Candidate can preview their own CV
    const ownerPreview = await cvService.previewCv(registered.id, candidateProfileId);
    expect(ownerPreview.name).toBe('ozgecmis.pdf');

    // 3. Unauthorized stranger is BLOCKED with ForbiddenError
    await expect(
      cvService.previewCv(registered.id, unauthorizedProfileId),
    ).rejects.toThrow(ForbiddenError);

    await expect(
      cvService.downloadCv(registered.id, unauthorizedProfileId),
    ).rejects.toThrow(ForbiddenError);
  });

  it('keeps CV URLs, contact emails, and phones completely out of public previews and DTOs', () => {
    const publicPreview = toSafeCareerPreviewInput({
      kind: 'seek',
      displayName: 'Uğur Zaman',
      source: {
        city: 'İzmir',
        customFields: {
          desiredRole: 'Yazılım Geliştirici',
          primarySector: 'Bilişim / Yazılım',
          contactPhone: '05551234567',
          contactEmail: 'gizli@example.com',
          cvUrl: 'https://storage.example.com/private/ugur-cv.pdf',
          cvFileName: 'ugur-cv.pdf',
        },
      },
    });

    // 1. Assert masked display name
    expect(publicPreview.displayNameMasked).toBe('Uğur *****');
    expect(publicPreview.displayName).toBeNull();

    // 2. Assert NO contact leaks
    expect(publicPreview).not.toHaveProperty('contactPhone');
    expect(publicPreview).not.toHaveProperty('contactEmail');
    expect(publicPreview).not.toHaveProperty('cvUrl');

    const json = JSON.stringify(publicPreview);
    expect(json).not.toContain('05551234567');
    expect(json).not.toContain('gizli@example.com');
    expect(json).not.toContain('https://storage.example.com');
  });
});
