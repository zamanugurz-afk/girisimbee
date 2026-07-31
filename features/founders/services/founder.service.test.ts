import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE, TEST_PROFILE_2 } from '@/lib/testing/ecosystem-test-fixtures';

describe('FounderService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('publishes co-founder search listing (legacy publishSearch)', async () => {
    const { founderService } = harness.services;

    await founderService.activateProfile(TEST_PROFILE);
    const listing = await founderService.publishSearch({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: { title: 'CTO Aranıyor', shortDescription: 'Equity', city: 'Istanbul' },
    });

    expect(listing.moduleKey).toBe('founders');
    expect(listing.workflowStatus).toBe('published');
  });

  it('creates co-founder match (legacy findCoFounder)', async () => {
    const { founderService } = harness.services;

    const match = await founderService.findCoFounder({
      moduleKey: 'founders',
      initiatorProfileId: TEST_PROFILE,
      targetProfileId: TEST_PROFILE_2,
    });

    expect(match.status).toBe('requested');
  });

  it('upserts founder profile with extended fields', async () => {
    const { founderService } = harness.services;

    await founderService.activateProfile(TEST_PROFILE);
    const profile = await founderService.upsertProfile({
      profileId: TEST_PROFILE,
      fullName: 'Ali Kurucu',
      sehir: 'Istanbul',
      founderType: 'technical',
      startupStage: 'mvp',
      sectors: ['Fintech'],
      requiredSkills: ['React', 'Node.js'],
      offeredSkills: ['Product'],
      telefon: '+905551234567',
      eposta: 'founder@example.com',
    });

    expect(profile.fullName).toBe('Ali Kurucu');
    expect(profile.sectors).toEqual(['Fintech']);
    expect(profile.requiredSkills).toEqual(['React', 'Node.js']);
  });

  it('creates draft listing and publishes via publishListingDraft', async () => {
    const { founderService } = harness.services;

    await founderService.activateProfile(TEST_PROFILE);
    const draft = await founderService.createCofounderListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      asDraft: true,
      listing: {
        title: 'CTO Ortak Aranıyor',
        shortDescription: 'Fintech MVP için teknik kurucu ortağı arıyoruz',
        longDescription: 'Detaylı ortak arama açıklaması en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        sector: 'Fintech',
        startupStage: 'mvp',
        requiredSkills: ['React'],
        contactEmail: 'founder@example.com',
      },
    });

    expect(draft.status).toBe('draft');
    expect(draft.anonymousMode).toBe(true);

    const published = await founderService.publishListingDraft(
      TEST_USER,
      TEST_PROFILE,
      draft.id,
    );

    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeTruthy();
  });

  it('browseCoFounderListings returns published founder listings', async () => {
    const { founderService } = harness.services;

    await founderService.activateProfile(TEST_PROFILE);
    await founderService.publishCofounderListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Growth Partner Wanted',
        shortDescription: 'B2B SaaS için growth ortağı arıyoruz',
        longDescription: 'Detaylı ortak arama açıklaması en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        sector: 'SaaS',
        contactPhone: '+905551234567',
      },
    });

    const browse = await founderService.browseCoFounderListings({ city: 'Istanbul' });
    expect(browse.data.length).toBeGreaterThan(0);
    expect(browse.data[0].moduleKey).toBe('founders');
  });
});
