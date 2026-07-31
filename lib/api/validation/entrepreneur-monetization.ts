import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const entrepreneurPackageSlugSchema = z.enum(['standard', 'professional', 'featured', 'urgent']);

export const entrepreneurPackageCreateSchema = z.object({
  slug: entrepreneurPackageSlugSchema,
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

export const entrepreneurCheckoutSchema = z.object({
  action: z.literal('checkout').default('checkout'),
  packageSlug: entrepreneurPackageSlugSchema,
  couponCode: z.string().min(1).max(32).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const entrepreneurUpgradeSchema = z.object({
  action: z.literal('upgrade'),
  fromSlug: entrepreneurPackageSlugSchema,
  toSlug: entrepreneurPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const entrepreneurDowngradeSchema = z.object({
  action: z.literal('downgrade'),
  fromSlug: entrepreneurPackageSlugSchema,
  toSlug: entrepreneurPackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const entrepreneurRenewSchema = z.object({
  action: z.literal('renew'),
  userPackageId: uuidSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const entrepreneurCouponValidateSchema = z.object({
  action: z.literal('validate_coupon'),
  couponCode: z.string().min(1).max(32),
  packageSlug: entrepreneurPackageSlugSchema,
});

export const entrepreneurAdminActivateSchema = z.object({
  action: z.literal('activate'),
  userId: uuidSchema,
  packageSlug: entrepreneurPackageSlugSchema,
});

export const entrepreneurAdminSuspendSchema = z.object({
  action: z.literal('suspend'),
  userPackageId: uuidSchema,
});

export const entrepreneurAdminCancelSchema = z.object({
  action: z.literal('cancel'),
  userPackageId: uuidSchema,
});

export const entrepreneurAdminExtendSchema = z.object({
  action: z.literal('extend'),
  userPackageId: uuidSchema,
  extraDays: z.number().int().min(1),
});

export const entrepreneurPaymentActionSchema = z.discriminatedUnion('action', [
  entrepreneurCheckoutSchema,
  entrepreneurUpgradeSchema,
  entrepreneurDowngradeSchema,
  entrepreneurRenewSchema,
  entrepreneurCouponValidateSchema,
  entrepreneurAdminActivateSchema,
  entrepreneurAdminSuspendSchema,
  entrepreneurAdminCancelSchema,
  entrepreneurAdminExtendSchema,
]);

export const entrepreneurPaymentListQuerySchema = z.object({
  userId: uuidSchema.optional(),
});

export const entrepreneurPaymentPatchSchema = z.object({
  invoiceRef: z.string().min(1).max(128).optional(),
  invoiceUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  fulfill: z.boolean().optional(),
});

export const entrepreneurAdminPackageActionSchema = z.discriminatedUnion('action', [
  entrepreneurAdminActivateSchema,
  entrepreneurAdminSuspendSchema,
  entrepreneurAdminCancelSchema,
  entrepreneurAdminExtendSchema,
]);
