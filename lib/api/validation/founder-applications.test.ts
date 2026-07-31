import { describe, it, expect } from 'vitest';
import {
  founderApplicationSubmitSchema,
  founderApplicationStatusSchema,
} from '@/lib/api/validation/founder-applications';

describe('founder-applications validation', () => {
  it('accepts valid submit payload', () => {
    const parsed = founderApplicationSubmitSchema.parse({
      listingId: 'a0000001-0001-4000-8000-000000000001',
      coverMessage: 'Ortak olmak istiyorum',
    });
    expect(parsed.coverMessage).toBe('Ortak olmak istiyorum');
  });

  it('includes all application statuses', () => {
    expect(founderApplicationStatusSchema.options).toEqual([
      'pending',
      'reviewing',
      'contacted',
      'accepted',
      'rejected',
      'withdrawn',
    ]);
  });
});
