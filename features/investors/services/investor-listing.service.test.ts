import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE, TEST_PROFILE_2 } from '@/lib/testing/ecosystem-test-fixtures';
import { ECOSYSTEM_CATEGORY_IDS, DEFAULT_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

describe('InvestorListingService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('browses entrepreneur startups', async () => {
    const { investorService } = harness.services;
    const { listingRepository } = harness.repos;

    await listingRepository.create({
      ownerId: TEST_USER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.entrepreneurs,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.entrepreneurs,
      moduleKey: 'entrepreneurs',
      title: 'Fintech',
      shortDescription: 'Payments',
      status: 'published',
      workflowStatus: 'published',
    });

    const results = await investorService.browseStartups({ city: undefined });
    expect(results.total).toBeGreaterThanOrEqual(1);
  });

  it('requests meeting via match workflow', async () => {
    const { investorService } = harness.services;

    await investorService.activateProfile(TEST_PROFILE_2);
    const match = await investorService.requestMeeting({
      moduleKey: 'investors',
      initiatorProfileId: TEST_PROFILE_2,
      targetProfileId: TEST_PROFILE,
    });

    expect(match.moduleKey).toBe('investors');
  });
});
