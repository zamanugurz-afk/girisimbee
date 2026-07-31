import { describe, it, expect } from 'vitest';
import { entrepreneurCheckoutSchema } from '@/lib/api/validation/entrepreneur-monetization';

describe('entrepreneur-monetization validation', () => {
  it('parses checkout schema', () => {
    const parsed = entrepreneurCheckoutSchema.parse({
      action: 'checkout',
      packageSlug: 'standard',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });
    expect(parsed.packageSlug).toBe('standard');
  });
});
