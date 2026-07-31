import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE } from '@/lib/testing/ecosystem-test-fixtures';

describe('InvestorService', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('upserts investor profile with extended fields', async () => {
    const { investorService } = harness.services;

    await investorService.activateProfile(TEST_PROFILE);
    const profile = await investorService.upsertProfile({
      profileId: TEST_PROFILE,
      fullName: 'Ayşe Yatırımcı',
      sehir: 'Istanbul',
      investorType: 'angel',
      sectors: ['Fintech', 'SaaS'],
      investmentStage: 'seed',
      minimumInvestment: 100000,
      maximumInvestment: 2000000,
      telefon: '+905551234567',
      eposta: 'investor@example.com',
    });

    expect(profile.fullName).toBe('Ayşe Yatırımcı');
    expect(profile.sehir).toBe('Istanbul');
    expect(profile.sectors).toEqual(['Fintech', 'SaaS']);
    expect(profile.telefon).toBe('+905551234567');
  });

  it('creates draft thesis listing and publishes via publishListingDraft', async () => {
    const { investorService } = harness.services;

    await investorService.activateProfile(TEST_PROFILE);
    const draft = await investorService.createThesisListing({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      asDraft: true,
      listing: {
        title: 'Seed Stage Fintech Investor',
        shortDescription: 'Active angel investor seeking fintech startups in Turkey',
        longDescription: 'Detaylı yatırım tezi açıklaması en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        sector: 'Fintech',
        investmentStage: 'seed',
        minimumInvestment: 100000,
        contactEmail: 'investor@example.com',
      },
    });

    expect(draft.status).toBe('draft');
    expect(draft.anonymousMode).toBe(true);

    const published = await investorService.publishListingDraft(
      TEST_USER,
      TEST_PROFILE,
      draft.id,
    );

    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeTruthy();
  });

  it('browseThesisListings returns published investor listings', async () => {
    const { investorService } = harness.services;

    await investorService.activateProfile(TEST_PROFILE);
    await investorService.publishThesis({
      ownerId: TEST_USER,
      profileId: TEST_PROFILE,
      listing: {
        title: 'Growth Equity Thesis',
        shortDescription: 'Growth stage investor focused on B2B SaaS companies',
        longDescription: 'Detaylı yatırım tezi açıklaması en az yirmi karakter olmalıdır.',
        city: 'Istanbul',
        sector: 'SaaS',
        contactPhone: '+905551234567',
      },
    });

    const browse = await investorService.browseThesisListings({ city: 'Istanbul' });
    expect(browse.data.length).toBeGreaterThan(0);
    expect(browse.data[0].moduleKey).toBe('investors');
  });
});
