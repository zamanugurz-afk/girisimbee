import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE, TEST_PROFILE_2 } from '@/lib/testing/ecosystem-test-fixtures';
import { FRANCHISE_SUBCATEGORY_IDS } from '@/features/shared/constants/ecosystem';

describe('FranchiseService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('Bayilik Ver — publishes give listing and browse returns it for buy flow', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    const listing = await franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'give',
      listing: {
        title: 'Kafe Franchise',
        shortDescription: '50 şube',
        city: 'Istanbul',
        contactPhone: '+905551234567',
      },
    });

    expect(listing.subcategoryId).toBe(FRANCHISE_SUBCATEGORY_IDS['franchise-give']);

    const browse = await franchiseService.browseBuyOpportunities({ city: 'Istanbul' });
    expect(browse.data.some((l) => l.id === listing.id)).toBe(true);
  });

  it('Bayilik Al — publishes buy profile and applies to give listing', async () => {
    const { franchiseService } = harness.services;

    await franchiseService.activateProfile(TEST_PROFILE, 'give');
    const giveListing = await franchiseService.publishListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      flow: 'give',
      listing: { title: 'Retail Franchise', shortDescription: 'Nationwide', contactEmail: 'fr@example.com' },
    });

    await franchiseService.activateProfile(TEST_PROFILE_2, 'buy');
    const application = await franchiseService.submitApplication(TEST_PROFILE_2, giveListing.id, 'Interested');

    expect(application.moduleKey).toBe('franchise');
    expect(application.status).toBe('submitted');
  });

  it('assertFlowProfile rejects wrong flow', async () => {
    const { franchiseService } = harness.services;
    await franchiseService.activateProfile(TEST_PROFILE, 'buy');

    await expect(franchiseService.assertFlowProfile(TEST_PROFILE, 'give')).rejects.toThrow(
      'Profil give akışı için yapılandırılmamış',
    );
  });
});
