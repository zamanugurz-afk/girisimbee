import { z } from 'zod';
import { MODULE_KEYS } from '@/lib/domain/modules';
import { uuidSchema, paginationSchema } from '@/lib/domain/validation';

export { paginationSchema };

export const adminModuleKeySchema = z.enum(MODULE_KEYS);

export const adminUserListQuerySchema = paginationSchema.extend({
  query: z.string().max(200).optional(),
  status: z.enum(['pending', 'active', 'suspended', 'deactivated', 'deleted']).optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
});

export const adminUserActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('activate') }),
  z.object({ action: z.literal('deactivate') }),
  z.object({ action: z.literal('suspend') }),
  z.object({ action: z.literal('delete') }),
]);

export const adminProfileListQuerySchema = paginationSchema.extend({
  moduleKey: adminModuleKeySchema.optional(),
  query: z.string().max(200).optional(),
  status: z.enum(['draft', 'published', 'hidden', 'archived', 'deleted']).optional(),
});

export const adminListingListQuerySchema = paginationSchema.extend({
  query: z.string().max(200).optional(),
  status: z
    .enum(['draft', 'pending_review', 'published', 'paused', 'expired', 'archived', 'rejected', 'sold', 'deleted'])
    .optional(),
  moduleKey: adminModuleKeySchema.optional(),
  isFeatured: z.coerce.boolean().optional(),
  isUrgent: z.coerce.boolean().optional(),
  activeFeaturedOnly: z.coerce.boolean().optional(),
  activeUrgentOnly: z.coerce.boolean().optional(),
});

export const adminListingActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve') }),
  z.object({ action: z.literal('reject'), reason: z.string().min(1).max(1000) }),
  z.object({
    action: z.literal('feature'),
    featuredUntil: z.string().datetime({ offset: true }).optional(),
  }),
  z.object({ action: z.literal('unfeature') }),
  z.object({
    action: z.literal('mark_urgent'),
    urgentUntil: z.string().datetime({ offset: true }).optional(),
  }),
  z.object({ action: z.literal('remove_urgent') }),
  z.object({ action: z.literal('unpublish') }),
  z.object({ action: z.literal('archive') }),
  z.object({ action: z.literal('delete') }),
]);

export const adminApplicationListQuerySchema = paginationSchema.extend({
  moduleKey: z.enum(['candidates', 'employers', 'franchise']).optional(),
  status: z
    .enum(['submitted', 'reviewing', 'unlocked', 'contacted', 'accepted', 'rejected', 'withdrawn', 'hired'])
    .optional(),
  includeDeleted: z.coerce.boolean().optional(),
});

export const adminApplicationActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('review') }),
  z.object({ action: z.literal('archive') }),
  z.object({ action: z.literal('restore') }),
]);

export const adminPaymentListQuerySchema = paginationSchema.extend({
  userId: uuidSchema.optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  purpose: z.string().optional(),
});

export const adminPaymentActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('refund'), paymentId: uuidSchema }),
  z.object({
    action: z.literal('activate_package'),
    moduleKey: adminModuleKeySchema,
    userId: uuidSchema,
    packageSlug: z.string().min(1).max(64),
  }),
  z.object({
    action: z.literal('suspend_package'),
    moduleKey: adminModuleKeySchema,
    userPackageId: uuidSchema,
  }),
]);

export const adminPackageListQuerySchema = paginationSchema.extend({
  moduleKey: adminModuleKeySchema.optional(),
  userId: uuidSchema.optional(),
});

export const adminPackageActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('activate'),
    moduleKey: adminModuleKeySchema,
    userId: uuidSchema,
    packageSlug: z.string().min(1).max(64),
  }),
  z.object({
    action: z.literal('suspend'),
    moduleKey: adminModuleKeySchema,
    userPackageId: uuidSchema,
  }),
]);

export const adminCouponListQuerySchema = paginationSchema.extend({
  moduleKey: adminModuleKeySchema,
});

export const adminCouponBodySchema = z.object({
  code: z.string().min(1).max(32),
  discountPercent: z.number().int().min(0).max(100).nullable().optional(),
  discountCents: z.number().int().min(0).nullable().optional(),
  validPackageSlugs: z.array(z.string().min(1).max(64)).nullable().optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const adminCouponUpdateSchema = adminCouponBodySchema.partial().omit({ code: true });

export const adminReportQuerySchema = z.object({
  period: z.enum(['daily', 'monthly']).default('daily'),
  category: z.enum(['users', 'listings', 'applications', 'payments', 'reports', 'all']).optional(),
});

export const adminSettingsPatchSchema = z.object({
  freeListingLimit: z.number().int().min(0).max(100000).optional(),
});

export function parseAdminUserAction(body: unknown) {
  return adminUserActionSchema.parse(body);
}

export function parseAdminListingAction(body: unknown) {
  return adminListingActionSchema.parse(body);
}

export function parseAdminApplicationAction(body: unknown) {
  return adminApplicationActionSchema.parse(body);
}

export function parseAdminPaymentAction(body: unknown) {
  return adminPaymentActionSchema.parse(body);
}

export function parseAdminPackageAction(body: unknown) {
  return adminPackageActionSchema.parse(body);
}

export function parseAdminCouponBody(body: unknown) {
  return adminCouponBodySchema.parse(body);
}

export function parseAdminSettingsPatch(body: unknown) {
  return adminSettingsPatchSchema.parse(body);
}
