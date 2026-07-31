import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE } from '@/lib/testing/ecosystem-test-fixtures';

describe('EmployerService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('upserts employer profile with company fields', async () => {
    const { employerService } = harness.services;

    await employerService.activateProfile(TEST_PROFILE);
    const profile = await employerService.upsertProfile({
      profileId: TEST_PROFILE,
      companyName: 'Acme A.Ş.',
      sehir: 'Istanbul',
      ilce: 'Kadıköy',
      sektor: 'Technology',
      telefon: '+905551234567',
      eposta: 'hr@acme.com',
      aciklama: 'Leading tech company',
      companySize: '50-200',
    });

    expect(profile.companyName).toBe('Acme A.Ş.');
    expect(profile.sehir).toBe('Istanbul');
    expect(profile.telefon).toBe('+905551234567');
  });

  it('creates draft job listing and publishes via publishListingDraft', async () => {
    const { employerService } = harness.services;

    await employerService.activateProfile(TEST_PROFILE);
    const draft = await employerService.createJobListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      asDraft: true,
      listing: {
        title: 'Senior Developer',
        shortDescription: 'Full-time remote position available',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Ankara',
        remotePolicy: 'remote',
        contactEmail: 'jobs@acme.com',
      },
    });

    expect(draft.status).toBe('draft');
    expect(draft.anonymousMode).toBe(true);

    const published = await employerService.publishListingDraft(
      TEST_USER,
      TEST_PROFILE,
      draft.id,
    );

    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeTruthy();
  });

  it('browseJobs returns published employer listings', async () => {
    const { employerService } = harness.services;

    await employerService.activateProfile(TEST_PROFILE);
    const listing = await employerService.publishJobListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Backend Engineer',
        shortDescription: 'Node.js backend engineer role open',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        sector: 'Technology',
        contactPhone: '+905551234567',
      },
    });

    const browse = await employerService.browseJobs({ city: 'Istanbul' });
    expect(browse.data.some((l) => l.id === listing.id)).toBe(true);
  });

  it('getJobDetail returns listing with custom fields', async () => {
    const { employerService } = harness.services;

    await employerService.activateProfile(TEST_PROFILE);
    const listing = await employerService.publishJobListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'DevOps Lead',
        shortDescription: 'Lead our DevOps team remotely',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        remotePolicy: 'hybrid',
        experienceYearsMin: 5,
        contactPhone: '+905551111111',
      },
    });

    const detail = await employerService.getJobDetail(listing.id);
    expect(detail?.details.remotePolicy).toBe('hybrid');
    expect(detail?.details.experienceYearsMin).toBe(5);
  });
});
