import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const investorPackageSlugSchema = z.enum(['standard', 'professional', 'featured', 'urgent']);

export const investorPackageCreateSchema = z.object({
  slug: investorPackageSlugSchema,
  packageName: z.string().min(1).max(120),
  packagePrice: z.number().int().min(0),
  packageDuration: z.number().int().min(1),
  listingLimit: z.number().int().min(1),
  featuredListing: z.boolean().optional(),
  urgentListing: z.boolean().optional(),
  homepageVisibility: z.boolean().optional(),
  badgeVisibility: z.boolean().optional(),
  activeStatus: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const investorCheckoutSchema = z.object({
  action: z.literal('checkout').default('checkout'),
  packageSlug: investorPackageSlugSchema,
  couponCode: z.string().min(1).max(32).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const investorUpgradeSchema = z.object({
  action: z.literal('upgrade'),
  fromSlug: investorPackageSlugSchema,
  toSlug: investorPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const investorDowngradeSchema = z.object({
  action: z.literal('downgrade'),
  fromSlug: investorPackageSlugSchema,
  toSlug: investorPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const investorRenewSchema = z.object({
  action: z.literal('renew'),
  userPackageId: uuidSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const investorCouponValidateSchema = z.object({
  action: z.literal('validate_coupon'),
  couponCode: z.string().min(1).max(32),
  packageSlug: investorPackageSlugSchema,
});

export const investorAdminActivateSchema = z.object({
  action: z.literal('activate'),
  userId: uuidSchema,
  packageSlug: investorPackageSlugSchema,
});

export const investorAdminSuspendSchema = z.object({
  action: z.literal('suspend'),
  userPackageId: uuidSchema,
});

export const investorAdminCancelSchema = z.object({
  action: z.literal('cancel'),
  userPackageId: uuidSchema,
});

export const investorAdminExtendSchema = z.object({
  action: z.literal('extend'),
  userPackageId: uuidSchema,
  extraDays: z.number().int().min(1),
});

export const investorPaymentActionSchema = z.discriminatedUnion('action', [
  investorCheckoutSchema,
  investorUpgradeSchema,
  investorDowngradeSchema,
  investorRenewSchema,
  investorCouponValidateSchema,
  investorAdminActivateSchema,
  investorAdminSuspendSchema,
  investorAdminCancelSchema,
  investorAdminExtendSchema,
]);

export const investorPaymentListQuerySchema = z.object({
  userId: uuidSchema.optional(),
});

export const investorPaymentPatchSchema = z.object({
  invoiceRef: z.string().min(1).max(128).optional(),
  invoiceUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  fulfill: z.boolean().optional(),
});

export const investorAdminPackageActionSchema = z.discriminatedUnion('action', [
  investorAdminActivateSchema,
  investorAdminSuspendSchema,
  investorAdminCancelSchema,
  investorAdminExtendSchema,
]);
