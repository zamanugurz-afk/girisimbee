import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const founderPackageSlugSchema = z.enum(['standard', 'professional', 'featured', 'urgent']);

export const founderPackageCreateSchema = z.object({
  slug: founderPackageSlugSchema,
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

export const founderCheckoutSchema = z.object({
  action: z.literal('checkout').default('checkout'),
  packageSlug: founderPackageSlugSchema,
  couponCode: z.string().min(1).max(32).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const founderUpgradeSchema = z.object({
  action: z.literal('upgrade'),
  fromSlug: founderPackageSlugSchema,
  toSlug: founderPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const founderDowngradeSchema = z.object({
  action: z.literal('downgrade'),
  fromSlug: founderPackageSlugSchema,
  toSlug: founderPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const founderRenewSchema = z.object({
  action: z.literal('renew'),
  userPackageId: uuidSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const founderCouponValidateSchema = z.object({
  action: z.literal('validate_coupon'),
  couponCode: z.string().min(1).max(32),
  packageSlug: founderPackageSlugSchema,
});

export const founderAdminActivateSchema = z.object({
  action: z.literal('activate'),
  userId: uuidSchema,
  packageSlug: founderPackageSlugSchema,
});

export const founderAdminSuspendSchema = z.object({
  action: z.literal('suspend'),
  userPackageId: uuidSchema,
});

export const founderAdminCancelSchema = z.object({
  action: z.literal('cancel'),
  userPackageId: uuidSchema,
});

export const founderAdminExtendSchema = z.object({
  action: z.literal('extend'),
  userPackageId: uuidSchema,
  extraDays: z.number().int().min(1),
});

export const founderPaymentActionSchema = z.discriminatedUnion('action', [
  founderCheckoutSchema,
  founderUpgradeSchema,
  founderDowngradeSchema,
  founderRenewSchema,
  founderCouponValidateSchema,
  founderAdminActivateSchema,
  founderAdminSuspendSchema,
  founderAdminCancelSchema,
  founderAdminExtendSchema,
]);

export const founderPaymentListQuerySchema = z.object({
  userId: uuidSchema.optional(),
});

export const founderPaymentPatchSchema = z.object({
  invoiceRef: z.string().min(1).max(128).optional(),
  invoiceUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  fulfill: z.boolean().optional(),
});

export const founderAdminPackageActionSchema = z.discriminatedUnion('action', [
  founderAdminActivateSchema,
  founderAdminSuspendSchema,
  founderAdminCancelSchema,
  founderAdminExtendSchema,
]);
