import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemTestHarness,
  TEST_USER,
  TEST_PROFILE,
} from '@/lib/testing/ecosystem-test-fixtures';
import { createCandidateProfile } from '@/features/profiles/factories/module-profile.factory';
import { ECOSYSTEM_CATEGORY_IDS, DEFAULT_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

describe('CandidateApplicationService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(async () => {
    harness = createEcosystemTestHarness();
    await harness.repos.moduleProfileRepository.upsertCandidateProfile(
      createCandidateProfile({
        profileId: TEST_PROFILE,
        city: 'Istanbul',
        district: 'Kadıköy',
        skills: ['TypeScript'],
        experienceYears: 3,
      }),
    );
  });

  async function createJobListing() {
    return harness.repos.listingRepository.create({
      ownerId: TEST_USER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Frontend Dev',
      shortDescription: 'React developer needed',
      status: 'published',
      workflowStatus: 'published',
      contactPhone: '+905551234567',
    });
  }

  it('submits application and maps status to pending', async () => {
    const listing = await createJobListing();
    const application = await harness.services.candidateApplicationService.submitApplication(
      TEST_PROFILE,
      listing.id,
      'I am interested',
    );

    expect(application.status).toBe('pending');
    expect(application.coverMessage).toBe('I am interested');
  });

  it('lists my applications with candidate status mapping', async () => {
    const listing = await createJobListing();
    await harness.services.candidateApplicationService.submitApplication(TEST_PROFILE, listing.id);

    const apps = await harness.services.candidateApplicationService.listMyApplications(TEST_PROFILE);
    expect(apps).toHaveLength(1);
    expect(apps[0].status).toBe('pending');
  });

  it('withdraws application', async () => {
    const listing = await createJobListing();
    const app = await harness.services.candidateApplicationService.submitApplication(
      TEST_PROFILE,
      listing.id,
    );

    const withdrawn = await harness.services.candidateApplicationService.withdrawApplication(
      app.id,
      TEST_PROFILE,
    );
    expect(withdrawn.status).toBe('withdrawn');
  });

  it('contacts employer via external channels', async () => {
    const listing = await createJobListing();
    const app = await harness.services.candidateApplicationService.submitApplication(
      TEST_PROFILE,
      listing.id,
    );

    const result = await harness.services.candidateApplicationService.contactEmployer(
      app.id,
      TEST_PROFILE,
    );
    expect(result.contact.phone).toBe('+905551234567');
    expect(result.application.status).toBe('contacted');
  });
});
