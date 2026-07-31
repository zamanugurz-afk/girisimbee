import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE, TEST_PROFILE_2 } from '@/lib/testing/ecosystem-test-fixtures';

describe('FounderService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('publishes co-founder search listing', async () => {
    const { founderService } = harness.services;

    await founderService.activateProfile(TEST_PROFILE);
    const listing = await founderService.publishSearch({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: { title: 'CTO Aranıyor', shortDescription: 'Equity', city: 'Istanbul' },
    });

    expect(listing.moduleKey).toBe('founders');
    expect(listing.workflowStatus).toBe('published');
  });

  it('creates co-founder match', async () => {
    const { founderService } = harness.services;

    const match = await founderService.findCoFounder({
      moduleKey: 'founders',
      initiatorProfileId: TEST_PROFILE,
      targetProfileId: TEST_PROFILE_2,
    });

    expect(match.status).toBe('requested');
  });
});
