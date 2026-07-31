import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_USER,
  TEST_USER_2,
  TEST_PROFILE,
  TEST_PROFILE_2,
} from '@/lib/testing/ecosystem-test-fixtures';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import { createCandidateProfile } from '@/features/profiles/factories/module-profile.factory';

describe('EmployerApplicationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(async () => {
    harness = createEcosystemTestHarness();
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE, userId: TEST_USER, displayName: 'Employer', email: 'hr@co.com', phone: '+905551234567' }),
    );
    await harness.repos.profileRepository.create(
      createProfile({ id: TEST_PROFILE_2, userId: TEST_USER_2, displayName: 'Candidate', email: 'cand@example.com', phone: '+905559876543' }),
    );
    await harness.repos.moduleProfileRepository.upsertCandidateProfile(
      createCandidateProfile({ profileId: TEST_PROFILE_2, city: 'Ankara', district: 'Çankaya', experienceYears: 5 }),
    );
  });

  async function publishJob() {
    const { employerService } = harness.services;
    await employerService.activateProfile(TEST_PROFILE);
    return employerService.publishJobListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Senior Dev',
        shortDescription: 'Full-time developer position open',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        contactPhone: '+905551234567',
      },
    });
  }

  it('lists anonymous applications for employer listing', async () => {
    const { applicationService, employerApplicationService } = harness.services;
    const listing = await publishJob();

    await applicationService.submit({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: TEST_PROFILE_2,
    });

    const anonymous = await employerApplicationService.listAnonymousApplications(
      listing.id,
      TEST_PROFILE,
    );

    expect(anonymous).toHaveLength(1);
    expect(anonymous[0].snapshot.city).toBe('Ankara');
    expect(anonymous[0].snapshot.experienceYears).toBe(5);
    expect(anonymous[0].snapshot).not.toHaveProperty('applicantName');
  });

  it('transitions status and records history', async () => {
    const { applicationService, employerApplicationService } = harness.services;
    const listing = await publishJob();

    const app = await applicationService.submit({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: TEST_PROFILE_2,
    });

    const reviewing = await employerApplicationService.markReviewing(app.id, TEST_PROFILE);
    expect(reviewing.status).toBe('reviewing');

    const accepted = await employerApplicationService.updateApplicationStatus(
      app.id,
      TEST_PROFILE,
      'accepted',
      'Strong candidate',
    );
    expect(accepted.status).toBe('accepted');
  });

  it('unlocks application after payment and reveals candidate contact', async () => {
    const { applicationService, employerApplicationService } = harness.services;
    const { paymentRepository } = harness.repos;
    const listing = await publishJob();

    const app = await applicationService.submit({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: TEST_PROFILE_2,
    });

    const payment = await paymentRepository.create({
      userId: TEST_USER,
      amountCents: 9900,
      purpose: 'unlock_candidate',
      entityType: 'application',
      entityId: app.id,
      provider: 'iyzico',
    });

    const unlocked = await employerApplicationService.unlockApplication(
      app.id,
      TEST_PROFILE,
      payment.id,
    );

    expect(unlocked.applicantName).toBe('Candidate');
    expect(unlocked.applicantEmail).toBe('cand@example.com');
    expect(unlocked.contact.email).toBe('cand@example.com');
  });
});
