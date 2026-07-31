import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_USER,
  TEST_USER_2,
  TEST_PROFILE,
  TEST_PROFILE_2,
} from '@/lib/testing/ecosystem-test-fixtures';
import { createProfile } from '@/features/profiles/factories/profile.factory';

describe('InvestorApplicationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(async () => {
    harness = createEcosystemTestHarness();
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE, userId: TEST_USER, displayName: 'Investor' }),
    );
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE_2, userId: TEST_USER_2, displayName: 'Founder' }),
    );
  });

  async function publishStartup() {
    const { entrepreneurService } = harness.services;
    await entrepreneurService.activateProfile(TEST_PROFILE_2);
    return entrepreneurService.publishStartup({
      ownerId: TEST_USER_2,
      profileId: TEST_PROFILE_2,
      listing: {
        title: 'AI SaaS',
        shortDescription: 'B2B analytics platform seeking seed round',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        contactPhone: '+905559876543',
        contactEmail: 'founder@example.com',
      },
    });
  }

  async function publishThesis() {
    const { investorService } = harness.services;
    await investorService.activateProfile(TEST_PROFILE);
    return investorService.publishThesis({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Seed Investor',
        shortDescription: 'Angel investor seeking early-stage fintech startups',
        longDescription: 'Detaylı yatırım tezi açıklaması en az yirmi karakter olmalıdır.',
        contactPhone: '+905551234567',
        contactEmail: 'investor@example.com',
      },
    });
  }

  it('submits investor interest to startup with pending status', async () => {
    const { investorApplicationService } = harness.services;
    const listing = await publishStartup();

    const application = await investorApplicationService.submitInterest(
      TEST_PROFILE,
      listing.id,
      'Yatırım ilgisi',
    );

    expect(application.status).toBe('pending');
    expect(application.coverMessage).toBe('Yatırım ilgisi');
    expect(application.targetListingId).toBe(listing.id);
  });

  it('submits entrepreneur interest to investor thesis', async () => {
    const { investorApplicationService } = harness.services;
    const thesis = await publishThesis();

    const application = await investorApplicationService.submitInterest(
      TEST_PROFILE_2,
      thesis.id,
      'Startup ilgisi',
    );

    expect(application.status).toBe('pending');
    expect(application.listingId).toBe(thesis.id);
  });

  it('prevents duplicate match requests', async () => {
    const { investorApplicationService } = harness.services;
    const listing = await publishStartup();

    await investorApplicationService.submitInterest(TEST_PROFILE, listing.id);
    await expect(
      investorApplicationService.submitInterest(TEST_PROFILE, listing.id),
    ).rejects.toThrow('Bu ilana zaten eşleşme talebi gönderilmiş');
  });

  it('returns external contact on contactParticipant', async () => {
    const { investorApplicationService } = harness.services;
    const listing = await publishStartup();

    const app = await investorApplicationService.submitInterest(TEST_PROFILE, listing.id);
    await investorApplicationService.markReviewing(app.id, TEST_PROFILE_2);

    const result = await investorApplicationService.contactParticipant(app.id, TEST_PROFILE);
    expect(result.contact.phone).toBe('+905559876543');
    expect(result.application.status).toBe('contacted');
  });
});
