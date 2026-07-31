import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const employerPackageSlugSchema = z.enum(['standard', 'professional', 'featured', 'urgent']);

export const employerPackageCreateSchema = z.object({
  slug: employerPackageSlugSchema,
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

export const employerCheckoutSchema = z.object({
  action: z.literal('checkout').default('checkout'),
  packageSlug: employerPackageSlugSchema,
  couponCode: z.string().min(1).max(32).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const employerUpgradeSchema = z.object({
  action: z.literal('upgrade'),
  fromSlug: employerPackageSlugSchema,
  toSlug: employerPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const employerDowngradeSchema = z.object({
  action: z.literal('downgrade'),
  fromSlug: employerPackageSlugSchema,
  toSlug: employerPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const employerRenewSchema = z.object({
  action: z.literal('renew'),
  userPackageId: uuidSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const employerCouponValidateSchema = z.object({
  action: z.literal('validate_coupon'),
  couponCode: z.string().min(1).max(32),
  packageSlug: employerPackageSlugSchema,
});

export const employerAdminActivateSchema = z.object({
  action: z.literal('activate'),
  userId: uuidSchema,
  packageSlug: employerPackageSlugSchema,
});

export const employerAdminSuspendSchema = z.object({
  action: z.literal('suspend'),
  userPackageId: uuidSchema,
});

export const employerAdminCancelSchema = z.object({
  action: z.literal('cancel'),
  userPackageId: uuidSchema,
});

export const employerAdminExtendSchema = z.object({
  action: z.literal('extend'),
  userPackageId: uuidSchema,
  extraDays: z.number().int().min(1),
});

export const employerPaymentActionSchema = z.discriminatedUnion('action', [
  employerCheckoutSchema,
  employerUpgradeSchema,
  employerDowngradeSchema,
  employerRenewSchema,
  employerCouponValidateSchema,
  employerAdminActivateSchema,
  employerAdminSuspendSchema,
  employerAdminCancelSchema,
  employerAdminExtendSchema,
]);

export const employerPaymentListQuerySchema = z.object({
  userId: uuidSchema.optional(),
});

export const employerPaymentPatchSchema = z.object({
  invoiceRef: z.string().min(1).max(128).optional(),
  invoiceUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  fulfill: z.boolean().optional(),
});

export const employerAdminPackageActionSchema = z.discriminatedUnion('action', [
  employerAdminActivateSchema,
  employerAdminSuspendSchema,
  employerAdminCancelSchema,
  employerAdminExtendSchema,
]);
