import { describe, it, expect } from 'vitest';
import { parseEntrepreneurListingCreate } from '@/lib/api/validation/entrepreneur-listings';

describe('entrepreneur-listings validation', () => {
  it('parses startup listing create payload', () => {
    const parsed = parseEntrepreneurListingCreate({
      title: 'AI SaaS Platform',
      shortDescription: 'B2B analytics platform seeking seed investment',
      city: 'Istanbul',
      sector: 'Technology',
      investmentStage: 'seed',
      contactEmail: 'founder@example.com',
    });
    expect(parsed.title).toBe('AI SaaS Platform');
    expect(parsed.investmentStage).toBe('seed');
  });
});
