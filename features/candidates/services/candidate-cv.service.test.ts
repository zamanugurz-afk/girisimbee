import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_PROFILE,
} from '@/lib/testing/ecosystem-test-fixtures';

describe('CandidateCvService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('registers CV and links to profile', async () => {
    const document = await harness.services.candidateCvService.registerCv(TEST_PROFILE, {
      name: 'Resume.pdf',
      storagePath: 'cvs/resume.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2048,
      visibility: 'private',
    });

    expect(document.documentType).toBe('cv');

    const profile = await harness.repos.moduleProfileRepository.findCandidateProfile(TEST_PROFILE);
    expect(profile?.cvDocumentId).toBe(document.id);
  });

  it('lists CV documents for owner', async () => {
    await harness.services.candidateCvService.registerCv(TEST_PROFILE, {
      name: 'CV.pdf',
      storagePath: 'cvs/cv.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    });

    const cvs = await harness.services.candidateCvService.listCvs(TEST_PROFILE);
    expect(cvs).toHaveLength(1);
    expect(cvs[0].documentType).toBe('cv');
  });

  it('updates CV visibility', async () => {
    const document = await harness.services.candidateCvService.registerCv(TEST_PROFILE, {
      name: 'CV.pdf',
      storagePath: 'cvs/cv.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      visibility: 'private',
    });

    const updated = await harness.services.candidateCvService.updateVisibility(
      document.id,
      TEST_PROFILE,
      'application_only',
    );
    expect(updated.visibility).toBe('application_only');
  });
});
