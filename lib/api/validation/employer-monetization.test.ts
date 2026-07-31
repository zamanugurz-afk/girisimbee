import { describe, it, expect } from 'vitest';
import {
  employerCheckoutSchema,
  employerPaymentActionSchema,
} from '@/lib/api/validation/employer-monetization';

describe('employer monetization validation', () => {
  it('accepts checkout action', () => {
    const parsed = employerPaymentActionSchema.parse({
      action: 'checkout',
      packageSlug: 'standard',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });
    expect(parsed.action).toBe('checkout');
  });

  it('accepts upgrade action', () => {
    const parsed = employerPaymentActionSchema.parse({
      action: 'upgrade',
      fromSlug: 'standard',
      toSlug: 'professional',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });
    expect(parsed.action).toBe('upgrade');
    if (parsed.action === 'upgrade') {
      expect(parsed.toSlug).toBe('professional');
    }
  });

  it('validates checkout schema defaults action', () => {
    const parsed = employerCheckoutSchema.parse({
      packageSlug: 'featured',
      successUrl: 'https://example.com/ok',
      cancelUrl: 'https://example.com/cancel',
    });
    expect(parsed.action).toBe('checkout');
  });
});
