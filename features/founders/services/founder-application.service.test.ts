import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_USER,
  TEST_USER_2,
  TEST_PROFILE,
  TEST_PROFILE_2,
} from '@/lib/testing/ecosystem-test-fixtures';
import { createProfile } from '@/features/profiles/factories/profile.factory';

describe('FounderApplicationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(async () => {
    harness = createEcosystemTestHarness();
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE, userId: TEST_USER, displayName: 'Founder A' }),
    );
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE_2, userId: TEST_USER_2, displayName: 'Founder B' }),
    );
  });

  async function publishCofounderListing() {
    const { founderService } = harness.services;
    await founderService.activateProfile(TEST_PROFILE);
    return founderService.publishCofounderListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'CTO Ortak',
        shortDescription: 'Fintech MVP için teknik kurucu ortağı arıyoruz',
        longDescription: 'Detaylı ortak arama açıklaması en az yirmi karakter olmalıdır.',
        contactPhone: '+905559876543',
        contactEmail: 'founder@example.com',
      },
    });
  }

  it('submits partnership interest with pending status', async () => {
    const { founderApplicationService } = harness.services;
    const listing = await publishCofounderListing();

    const application = await founderApplicationService.submitInterest(
      TEST_PROFILE_2,
      listing.id,
      'Ortak olmak istiyorum',
    );

    expect(application.status).toBe('pending');
    expect(application.coverMessage).toBe('Ortak olmak istiyorum');
    expect(application.listingId).toBe(listing.id);
  });

  it('marks application as reviewing on accept', async () => {
    const { founderApplicationService } = harness.services;
    const listing = await publishCofounderListing();

    const application = await founderApplicationService.submitInterest(
      TEST_PROFILE_2,
      listing.id,
    );

    const reviewing = await founderApplicationService.markReviewing(
      application.id,
      TEST_PROFILE,
    );

    expect(reviewing.status).toBe('reviewing');
  });

  it('reveals external contact after match accepted', async () => {
    const { founderApplicationService } = harness.services;
    const listing = await publishCofounderListing();

    const application = await founderApplicationService.submitInterest(
      TEST_PROFILE_2,
      listing.id,
    );
    await founderApplicationService.markReviewing(application.id, TEST_PROFILE);

    const result = await founderApplicationService.contactParticipant(
      application.id,
      TEST_PROFILE_2,
    );

    expect(result.contact.phone).toBe('+905559876543');
    expect(result.application.status).toBe('contacted');
  });
});
