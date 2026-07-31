import { describe, it, expect } from 'vitest';
import {
  adminUserActionSchema,
  adminListingActionSchema,
  adminApplicationActionSchema,
  adminPaymentActionSchema,
  adminReportQuerySchema,
  adminSettingsPatchSchema,
  adminCouponBodySchema,
} from '@/lib/api/validation/admin';

describe('admin validation schemas', () => {
  it('accepts user lifecycle actions', () => {
    expect(adminUserActionSchema.parse({ action: 'deactivate' }).action).toBe('deactivate');
    expect(adminUserActionSchema.parse({ action: 'suspend' }).action).toBe('suspend');
  });

  it('requires reason for listing reject', () => {
    expect(adminListingActionSchema.safeParse({ action: 'reject' }).success).toBe(false);
    expect(
      adminListingActionSchema.parse({ action: 'reject', reason: 'Policy violation' }).action,
    ).toBe('reject');
  });

  it('accepts listing feature action', () => {
    const parsed = adminListingActionSchema.parse({ action: 'feature' });
    expect(parsed.action).toBe('feature');
  });

  it('accepts application actions', () => {
    expect(adminApplicationActionSchema.parse({ action: 'archive' }).action).toBe('archive');
  });

  it('accepts payment refund action', () => {
    const parsed = adminPaymentActionSchema.parse({
      action: 'refund',
      paymentId: 'a0000001-0001-4000-8000-000000000001',
    });
    expect(parsed.action).toBe('refund');
  });

  it('parses report query defaults', () => {
    const parsed = adminReportQuerySchema.parse({});
    expect(parsed.period).toBe('daily');
  });

  it('accepts settings patch', () => {
    const parsed = adminSettingsPatchSchema.parse({ freeListingLimit: 200 });
    expect(parsed.freeListingLimit).toBe(200);
  });

  it('accepts coupon body', () => {
    const parsed = adminCouponBodySchema.parse({
      code: 'SAVE20',
      discountPercent: 20,
    });
    expect(parsed.code).toBe('SAVE20');
  });
});
