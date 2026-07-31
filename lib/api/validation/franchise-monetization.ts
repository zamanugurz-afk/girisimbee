import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const franchisePackageSlugSchema = z.enum(['standard', 'professional', 'featured', 'urgent']);

export const franchisePackageCreateSchema = z.object({
  slug: franchisePackageSlugSchema,
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

export const franchiseCheckoutSchema = z.object({
  action: z.literal('checkout').default('checkout'),
  packageSlug: franchisePackageSlugSchema,
  couponCode: z.string().min(1).max(32).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const franchiseUpgradeSchema = z.object({
  action: z.literal('upgrade'),
  fromSlug: franchisePackageSlugSchema,
  toSlug: franchisePackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const franchiseDowngradeSchema = z.object({
  action: z.literal('downgrade'),
  fromSlug: franchisePackageSlugSchema,
  toSlug: franchisePackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const franchiseRenewSchema = z.object({
  action: z.literal('renew'),
  userPackageId: uuidSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const franchiseCouponValidateSchema = z.object({
  action: z.literal('validate_coupon'),
  couponCode: z.string().min(1).max(32),
  packageSlug: franchisePackageSlugSchema,
});

export const franchiseAdminActivateSchema = z.object({
  action: z.literal('activate'),
  userId: uuidSchema,
  packageSlug: franchisePackageSlugSchema,
});

export const franchiseAdminSuspendSchema = z.object({
  action: z.literal('suspend'),
  userPackageId: uuidSchema,
});

export const franchiseAdminCancelSchema = z.object({
  action: z.literal('cancel'),
  userPackageId: uuidSchema,
});

export const franchiseAdminExtendSchema = z.object({
  action: z.literal('extend'),
  userPackageId: uuidSchema,
  extraDays: z.number().int().min(1),
});

export const franchisePaymentActionSchema = z.discriminatedUnion('action', [
  franchiseCheckoutSchema,
  franchiseUpgradeSchema,
  franchiseDowngradeSchema,
  franchiseRenewSchema,
  franchiseCouponValidateSchema,
  franchiseAdminActivateSchema,
  franchiseAdminSuspendSchema,
  franchiseAdminCancelSchema,
  franchiseAdminExtendSchema,
]);

export const franchisePaymentListQuerySchema = z.object({
  userId: uuidSchema.optional(),
});

export const franchisePaymentPatchSchema = z.object({
  invoiceRef: z.string().min(1).max(128).optional(),
  invoiceUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  fulfill: z.boolean().optional(),
});

export const franchiseAdminPackageActionSchema = z.discriminatedUnion('action', [
  franchiseAdminActivateSchema,
  franchiseAdminSuspendSchema,
  franchiseAdminCancelSchema,
  franchiseAdminExtendSchema,
]);
