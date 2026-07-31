import { describe, it, expect } from 'vitest';
import { candidateCheckoutSchema } from '@/lib/api/validation/candidate-monetization';

describe('candidate monetization validation', () => {
  it('accepts checkout payload', () => {
    const parsed = candidateCheckoutSchema.parse({
      packageSlug: 'standard',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });
    expect(parsed.packageSlug).toBe('standard');
  });
});
