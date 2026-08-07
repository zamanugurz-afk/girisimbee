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

  it('records KVKK consent evidence when publishing candidate listing', async () => {
    const { candidateService, kvkkConsentService } = harness.services;

    const consents = {
      cvSharing: true,
      thirdPartySharing: true,
      employerSharing: true,
      clarificationText: true,
      explicitConsent: true,
    };

    const listing = await candidateService.createCandidateListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Backend Developer',
        shortDescription: 'Node.js ve TypeScript ile 3 yıl deneyim',
        longDescription: 'Kurumsal ürün ekiplerinde backend geliştirme deneyimim var.',
        city: 'İstanbul',
        desiredRole: 'Backend Developer',
        kvkkConsents: consents,
      },
      asDraft: false,
      consentContext: {
        ipAddress: '203.0.113.10',
        userAgent: 'vitest',
      },
    });

    const records = await kvkkConsentService.listForListing(listing.id);
    expect(records).toHaveLength(1);
    expect(records[0].allAccepted).toBe(true);
    expect(records[0].ipAddress).toBe('203.0.113.10');
    expect(records[0].consentItems).toHaveLength(5);

    const evidence = await kvkkConsentService.getEvidence(records[0].id);
    expect(evidence.documentType).toBe('KVKK_ONAY_KAYIT_BELGESI');
    expect(evidence.listingId).toBe(listing.id);
    expect(evidence.attestation).toContain(records[0].id);
  });

  it('rejects publish without full KVKK consents', async () => {
    const { candidateService } = harness.services;

    await expect(
      candidateService.createCandidateListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        listing: {
          title: 'Backend Developer',
          shortDescription: 'Node.js ve TypeScript ile 3 yıl deneyim',
          kvkkConsents: {
            cvSharing: true,
            thirdPartySharing: false,
            employerSharing: true,
            clarificationText: true,
            explicitConsent: true,
          },
        },
        asDraft: false,
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
