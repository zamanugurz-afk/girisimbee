import { describe, it, expect } from 'vitest';
import {
  founderPaymentActionSchema,
  founderPackageSlugSchema,
} from '@/lib/api/validation/founder-monetization';

describe('founder-monetization validation', () => {
  it('accepts checkout action', () => {
    const parsed = founderPaymentActionSchema.parse({
      action: 'checkout',
      packageSlug: 'standard',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });
    expect(parsed.action).toBe('checkout');
  });

  it('defines 4 package slugs', () => {
    expect(founderPackageSlugSchema.options).toEqual([
      'standard',
      'professional',
      'featured',
      'urgent',
    ]);
  });
});
