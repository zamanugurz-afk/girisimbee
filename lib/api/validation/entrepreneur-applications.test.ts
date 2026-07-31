import { describe, it, expect } from 'vitest';
import { entrepreneurApplicationSubmitSchema } from '@/lib/api/validation/entrepreneur-applications';

describe('entrepreneur-applications validation', () => {
  it('parses submit schema', () => {
    const parsed = entrepreneurApplicationSubmitSchema.parse({
      listingId: 'a0000001-0001-4000-8000-000000000001',
      coverMessage: 'Interested in investing',
    });
    expect(parsed.coverMessage).toBe('Interested in investing');
  });
});
