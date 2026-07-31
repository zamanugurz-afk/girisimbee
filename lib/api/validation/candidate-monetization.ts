import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const candidatePackageSlugSchema = z.enum(['standard', 'professional', 'featured', 'urgent']);

export const candidatePackageCreateSchema = z.object({
  slug: candidatePackageSlugSchema,
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

export const candidateCheckoutSchema = z.object({
  action: z.literal('checkout').default('checkout'),
  packageSlug: candidatePackageSlugSchema,
  couponCode: z.string().min(1).max(32).optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const candidateUpgradeSchema = z.object({
  action: z.literal('upgrade'),
  fromSlug: candidatePackageSlugSchema,
  toSlug: candidatePackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const candidateDowngradeSchema = z.object({
  action: z.literal('downgrade'),
  fromSlug: candidatePackageSlugSchema,
  toSlug: candidatePackageSlugSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const candidateRenewSchema = z.object({
  action: z.literal('renew'),
  userPackageId: uuidSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const candidateCouponValidateSchema = z.object({
  action: z.literal('validate_coupon'),
  couponCode: z.string().min(1).max(32),
  packageSlug: candidatePackageSlugSchema,
});

export const candidateAdminActivateSchema = z.object({
  action: z.literal('activate'),
  userId: uuidSchema,
  packageSlug: candidatePackageSlugSchema,
});

export const candidateAdminSuspendSchema = z.object({
  action: z.literal('suspend'),
  userPackageId: uuidSchema,
});

export const candidateAdminCancelSchema = z.object({
  action: z.literal('cancel'),
  userPackageId: uuidSchema,
});

export const candidateAdminExtendSchema = z.object({
  action: z.literal('extend'),
  userPackageId: uuidSchema,
  extraDays: z.number().int().min(1),
});

export const candidatePaymentActionSchema = z.discriminatedUnion('action', [
  candidateCheckoutSchema,
  candidateUpgradeSchema,
  candidateDowngradeSchema,
  candidateRenewSchema,
  candidateCouponValidateSchema,
  candidateAdminActivateSchema,
  candidateAdminSuspendSchema,
  candidateAdminCancelSchema,
  candidateAdminExtendSchema,
]);

export const candidatePaymentListQuerySchema = z.object({
  userId: uuidSchema.optional(),
});

export const candidatePaymentPatchSchema = z.object({
  invoiceRef: z.string().min(1).max(128).optional(),
  invoiceUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  fulfill: z.boolean().optional(),
});

export const candidateAdminPackageActionSchema = z.discriminatedUnion('action', [
  candidateAdminActivateSchema,
  candidateAdminSuspendSchema,
  candidateAdminCancelSchema,
  candidateAdminExtendSchema,
]);
