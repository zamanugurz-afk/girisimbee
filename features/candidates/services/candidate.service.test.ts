import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE } from '@/lib/testing/ecosystem-test-fixtures';
import { ECOSYSTEM_CATEGORY_IDS, DEFAULT_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';

describe('CandidateService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('activates profile and applies to job', async () => {
    const { candidateService } = harness.services;
    const { listingRepository } = harness.repos;

    await candidateService.activateProfile(TEST_PROFILE);
    const listing = await listingRepository.create({
      ownerId: TEST_USER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Backend Dev',
      shortDescription: 'Node.js',
      status: 'published',
      workflowStatus: 'published',
    });

    const app = await candidateService.applyToJob(TEST_PROFILE, listing.id, 'Interested');
    expect(app.moduleKey).toBe('candidates');
    expect(app.status).toBe('submitted');
  });

  it('lists candidate applications', async () => {
    const { candidateService } = harness.services;
    const { listingRepository } = harness.repos;

    const listing = await listingRepository.create({
      ownerId: TEST_USER,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      title: 'Designer',
      shortDescription: 'UI/UX',
      status: 'published',
      workflowStatus: 'published',
    });

    await candidateService.applyToJob(TEST_PROFILE, listing.id);
    const apps = await candidateService.listApplications(TEST_PROFILE);
    expect(apps).toHaveLength(1);
  });

  it('publishes candidate listing with experiences and does not write CV KVKK records', async () => {
    const { candidateService, kvkkConsentService } = harness.services;

    const listing = await candidateService.createCandidateListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Backend Developer',
        shortDescription: 'Node.js ve TypeScript ile 3 yıl deneyim',
        longDescription: 'Kurumsal ürün ekiplerinde backend geliştirme deneyimim var.',
        city: 'İstanbul',
        desiredRole: 'Backend Developer',
        experiences: [
          {
            id: 'exp-1',
            sector: 'Yazılım',
            role: 'Backend Developer',
            duration: '3 yıl',
            responsibilities: 'API tasarımı, veritabanı modelleme ve deploy süreçleri',
            achievements: 'Kritik servislerin gecikmesini %30 azalttım',
          },
        ],
      },
      asDraft: false,
    });

    expect(listing.status).toBe('published');
    expect(listing.moduleKey).toBe('candidates');
    // Career publish no longer records CV-sharing KVKK via CandidateService.
    expect(await kvkkConsentService.listForListing(listing.id)).toHaveLength(0);
  });

  it('rejects publish without career experiences', async () => {
    const { candidateService } = harness.services;

    await expect(
      candidateService.createCandidateListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        listing: {
          title: 'Backend Developer',
          shortDescription: 'Node.js ve TypeScript ile 3 yıl deneyim',
        },
        asDraft: false,
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
