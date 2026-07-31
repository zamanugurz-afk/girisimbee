import { describe, it, expect } from 'vitest';
import { parseInvestorListingCreate } from '@/lib/api/validation/investor-listings';
import { investorApplicationSubmitSchema } from '@/lib/api/validation/investor-applications';
import { investorCheckoutSchema } from '@/lib/api/validation/investor-monetization';
import { investorModuleProfileUpsertSchema } from '@/lib/api/validation/investor-profiles';

describe('investor-listings validation', () => {
  it('parses thesis listing create payload', () => {
    const parsed = parseInvestorListingCreate({
      title: 'Seed Stage Investor',
      shortDescription: 'Angel investor seeking early-stage fintech startups',
      city: 'Istanbul',
      sector: 'Fintech',
      investmentStage: 'seed',
      minimumInvestment: 100000,
      contactEmail: 'investor@example.com',
    });
    expect(parsed.title).toBe('Seed Stage Investor');
    expect(parsed.investmentStage).toBe('seed');
  });
});

describe('investor-applications validation', () => {
  it('parses submit interest payload', () => {
    const parsed = investorApplicationSubmitSchema.parse({
      listingId: '00000000-0000-4000-8000-000000000001',
      coverMessage: 'Interested',
    });
    expect(parsed.coverMessage).toBe('Interested');
  });
});

describe('investor-monetization validation', () => {
  it('parses checkout payload', () => {
    const parsed = investorCheckoutSchema.parse({
      packageSlug: 'standard',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });
    expect(parsed.packageSlug).toBe('standard');
  });
});

describe('investor-profiles validation', () => {
  it('parses profile upsert payload', () => {
    const parsed = investorModuleProfileUpsertSchema.parse({
      fullName: 'Ayşe Yatırımcı',
      investorType: 'angel',
      sectors: ['Fintech'],
      minimumInvestment: 100000,
    });
    expect(parsed.fullName).toBe('Ayşe Yatırımcı');
  });
});
