import { describe, it, expect } from 'vitest';
import { candidateApplicationSubmitSchema } from '@/lib/api/validation/candidate-applications';

describe('candidate application validation', () => {
  it('accepts valid application submit payload', () => {
    const parsed = candidateApplicationSubmitSchema.parse({
      listingId: 'a0000001-0001-4000-8000-000000000001',
      coverMessage: 'Interested in this role',
    });
    expect(parsed.coverMessage).toBe('Interested in this role');
  });
});
