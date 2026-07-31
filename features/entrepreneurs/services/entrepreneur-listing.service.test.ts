import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE, TEST_PROFILE_2 } from '@/lib/testing/ecosystem-test-fixtures';

describe('EntrepreneurListingService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('activates profile and publishes startup listing', async () => {
    const { entrepreneurListingService } = harness.services;

    await entrepreneurListingService.activateProfile(TEST_PROFILE);
    const listing = await entrepreneurListingService.publishStartup({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'AI SaaS',
        shortDescription: 'B2B analytics',
        longDescription: 'Details',
        city: 'Istanbul',
      },
    });

    expect(listing.moduleKey).toBe('entrepreneurs');
    expect(listing.workflowStatus).toBe('published');
  });

  it('creates investor match request', async () => {
    const { entrepreneurListingService } = harness.services;
    const listing = await entrepreneurListingService.publishStartup({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: { title: 'AI SaaS', shortDescription: 'B2B', contactPhone: '+905551111111' },
    });

    const match = await entrepreneurListingService.requestInvestorMatch({
      moduleKey: 'entrepreneurs',
      initiatorProfileId: TEST_PROFILE,
      targetProfileId: TEST_PROFILE_2,
      listingId: listing.id,
    });

    expect(match.status).toBe('requested');
  });
});
