import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE } from '@/lib/testing/ecosystem-test-fixtures';
import { ECOSYSTEM_CATEGORY_IDS, DEFAULT_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

describe('CandidateService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('activates profile and applies to job', async () => {
    const { candidateService } = harness.services;
    const { listingRepository } = harness.repos;

    await candidateService.activateProfile(TEST_PROFILE);
    const listing = await listingRepository.create({
      ownerId: TEST_USER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Backend Dev',
      shortDescription: 'Node.js',
      status: 'published',
      workflowStatus: 'published',
    });

    const app = await candidateService.applyToJob(TEST_PROFILE, listing.id, 'Interested');
    expect(app.moduleKey).toBe('candidates');
    expect(app.status).toBe('submitted');
  });

  it('lists candidate applications', async () => {
    const { candidateService } = harness.services;
    const { listingRepository } = harness.repos;

    const listing = await listingRepository.create({
      ownerId: TEST_USER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Designer',
      shortDescription: 'UI/UX',
      status: 'published',
      workflowStatus: 'published',
    });

    await candidateService.applyToJob(TEST_PROFILE, listing.id);
    const apps = await candidateService.listApplications(TEST_PROFILE);
    expect(apps).toHaveLength(1);
  });
});
