import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { ApplicationService } from '@/features/matching/services/application.service';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockModuleProfileRepository } from '@/features/profiles/repository/mock/module-profile.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let applicationRepo: MockApplicationRepository;
  let listingRepo: MockListingRepository;
  let moduleProfileRepo: MockModuleProfileRepository;
  let profileRepo: MockProfileRepository;

  const employerUser = ids.user('u0000001-0001-4000-8000-000000000001');
  const candidateProfile = ids.profile('p0000001-0001-4000-8000-000000000001');
  const employerProfile = ids.profile('p0000001-0001-4000-8000-000000000002');

  beforeEach(async () => {
    applicationRepo = new MockApplicationRepository();
    listingRepo = new MockListingRepository();
    moduleProfileRepo = new MockModuleProfileRepository();
    profileRepo = new MockProfileRepository();
    service = new ApplicationService(applicationRepo, listingRepo, moduleProfileRepo, profileRepo);

    await profileRepo.create(createProfile({ userId: employerUser, displayName: 'Employer', id: employerProfile }));
    await moduleProfileRepo.upsertCandidateProfile({ profileId: candidateProfile });
  });

  it('submits job application with anonymous snapshot', async () => {
    const listing = await listingRepo.create({
      ownerId: employerUser,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Developer',
      shortDescription: 'Remote',
      anonymousMode: true,
    });

    const app = await service.submit({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: candidateProfile,
    });

    expect(app.status).toBe('submitted');
    expect(app.anonymousSnapshot).toBeTruthy();
  });

  it('prevents duplicate applications', async () => {
    const listing = await listingRepo.create({
      ownerId: employerUser,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Developer',
      shortDescription: 'Remote',
    });

    await service.submit({
      moduleKey: 'candidates',
      listingId: listing.id,
      applicantProfileId: candidateProfile,
    });

    await expect(
      service.submit({
        moduleKey: 'candidates',
        listingId: listing.id,
        applicantProfileId: candidateProfile,
      }),
    ).rejects.toThrow('Bu ilana zaten başvuru yapılmış');
  });
});
