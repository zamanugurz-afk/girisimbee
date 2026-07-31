import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_USER,
  TEST_USER_2,
  TEST_PROFILE,
  TEST_PROFILE_2,
} from '@/lib/testing/ecosystem-test-fixtures';
import { createProfile } from '@/features/profiles/factories/profile.factory';

describe('EntrepreneurApplicationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(async () => {
    harness = createEcosystemTestHarness();
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE, userId: TEST_USER, displayName: 'Founder' }),
    );
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE_2, userId: TEST_USER_2, displayName: 'Investor' }),
    );
  });

  async function publishStartup() {
    const { entrepreneurService } = harness.services;
    await entrepreneurService.activateProfile(TEST_PROFILE);
    return entrepreneurService.publishStartup({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'AI SaaS',
        shortDescription: 'B2B analytics platform seeking seed round',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        contactPhone: '+905551234567',
        contactEmail: 'founder@example.com',
      },
    });
  }

  it('submits investment interest with pending status', async () => {
    const { entrepreneurApplicationService } = harness.services;
    const listing = await publishStartup();

    const application = await entrepreneurApplicationService.submitInterest(
      TEST_PROFILE_2,
      listing.id,
      'Yatırım ilgisi',
    );

    expect(application.status).toBe('pending');
    expect(application.coverMessage).toBe('Yatırım ilgisi');
  });

  it('prevents duplicate investment interests', async () => {
    const { entrepreneurApplicationService } = harness.services;
    const listing = await publishStartup();

    await entrepreneurApplicationService.submitInterest(TEST_PROFILE_2, listing.id);
    await expect(
      entrepreneurApplicationService.submitInterest(TEST_PROFILE_2, listing.id),
    ).rejects.toThrow('Bu ilana zaten yatırım ilgisi gönderilmiş');
  });

  it('marks reviewing when entrepreneur accepts', async () => {
    const { entrepreneurApplicationService } = harness.services;
    const listing = await publishStartup();

    const app = await entrepreneurApplicationService.submitInterest(TEST_PROFILE_2, listing.id);
    const reviewing = await entrepreneurApplicationService.markReviewing(app.id, TEST_PROFILE);

    expect(reviewing.status).toBe('reviewing');
  });

  it('returns external contact on contactParticipant', async () => {
    const { entrepreneurApplicationService } = harness.services;
    const listing = await publishStartup();

    const app = await entrepreneurApplicationService.submitInterest(TEST_PROFILE_2, listing.id);
    await entrepreneurApplicationService.markReviewing(app.id, TEST_PROFILE);

    const result = await entrepreneurApplicationService.contactParticipant(app.id, TEST_PROFILE_2);
    expect(result.contact.phone).toBe('+905551234567');
    expect(result.application.status).toBe('contacted');
  });
});
