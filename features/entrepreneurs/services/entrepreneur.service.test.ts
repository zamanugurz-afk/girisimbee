import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE } from '@/lib/testing/ecosystem-test-fixtures';

describe('EntrepreneurService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('upserts entrepreneur profile with extended fields', async () => {
    const { entrepreneurService } = harness.services;

    await entrepreneurService.activateProfile(TEST_PROFILE);
    const profile = await entrepreneurService.upsertProfile({
      profileId: TEST_PROFILE,
      startupName: 'AI SaaS',
      founderName: 'Ali Veli',
      sehir: 'Istanbul',
      sektor: 'Technology',
      investmentStage: 'seed',
      investmentTarget: 500000,
      telefon: '+905551234567',
      eposta: 'founder@example.com',
    });

    expect(profile.startupName).toBe('AI SaaS');
    expect(profile.founderName).toBe('Ali Veli');
    expect(profile.sehir).toBe('Istanbul');
    expect(profile.telefon).toBe('+905551234567');
  });

  it('creates draft listing and publishes via publishListingDraft', async () => {
    const { entrepreneurService } = harness.services;

    await entrepreneurService.activateProfile(TEST_PROFILE);
    const draft = await entrepreneurService.createStartupListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      asDraft: true,
      listing: {
        title: 'AI SaaS Platform',
        shortDescription: 'B2B analytics platform seeking seed investment',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        sector: 'Technology',
        investmentStage: 'seed',
        contactEmail: 'founder@example.com',
      },
    });

    expect(draft.status).toBe('draft');
    expect(draft.anonymousMode).toBe(true);

    const published = await entrepreneurService.publishListingDraft(
      TEST_USER,
      TEST_PROFILE,
      draft.id,
    );

    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeTruthy();
  });

  it('browseStartups returns published entrepreneur listings', async () => {
    const { entrepreneurService } = harness.services;

    await entrepreneurService.activateProfile(TEST_PROFILE);
    await entrepreneurService.publishStartup({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Fintech Startup',
        shortDescription: 'Payment infrastructure for SMEs in Turkey',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        sector: 'Fintech',
        contactPhone: '+905551234567',
      },
    });

    const browse = await entrepreneurService.browseStartups({ city: 'Istanbul' });
    expect(browse.data.length).toBeGreaterThan(0);
    expect(browse.data[0].moduleKey).toBe('entrepreneurs');
  });
});
