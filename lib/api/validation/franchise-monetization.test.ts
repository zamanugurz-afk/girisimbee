import { describe, it, expect } from 'vitest';
import {
  franchisePackageCreateSchema,
  franchiseCheckoutSchema,
  franchisePaymentActionSchema,
  franchisePaymentPatchSchema,
  franchiseCouponValidateSchema,
  franchiseAdminActivateSchema,
} from '@/lib/api/validation/franchise-monetization';

describe('franchise monetization validation', () => {
  describe('franchisePackageCreateSchema', () => {
    it('accepts valid catalog item', () => {
      const result = franchisePackageCreateSchema.safeParse({
        slug: 'standard',
        packageName: 'Standart Paket',
        packagePrice: 29900,
        packageDuration: 30,
        listingLimit: 3,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid slug', () => {
      expect(
        franchisePackageCreateSchema.safeParse({
          slug: 'premium',
          packageName: 'Premium',
          packagePrice: 100,
          packageDuration: 30,
          listingLimit: 1,
        }).success,
      ).toBe(false);
    });
  });

  describe('franchiseCheckoutSchema', () => {
    it('accepts checkout payload', () => {
      const result = franchiseCheckoutSchema.parse({
        action: 'checkout',
        packageSlug: 'featured',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });
      expect(result.packageSlug).toBe('featured');
    });
  });

  describe('franchisePaymentActionSchema', () => {
    it('accepts coupon validation', () => {
      const result = franchiseCouponValidateSchema.parse({
        action: 'validate_coupon',
        couponCode: 'FRANCHISE10',
        packageSlug: 'standard',
      });
      expect(result.couponCode).toBe('FRANCHISE10');
    });

    it('accepts admin activate via payment action schema', () => {
      const result = franchiseAdminActivateSchema.parse({
        action: 'activate',
        userId: '00000000-0000-4000-8000-000000000001',
        packageSlug: 'urgent',
      });
      expect(result.action).toBe('activate');
    });
  });

  describe('franchisePaymentPatchSchema', () => {
    it('accepts invoice metadata patch', () => {
      const result = franchisePaymentPatchSchema.parse({
        invoiceRef: 'INV-001',
        invoiceUrl: 'https://example.com/inv/001',
        fulfill: true,
      });
      expect(result.invoiceRef).toBe('INV-001');
    });
  });
});
