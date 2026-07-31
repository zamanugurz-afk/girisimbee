import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created, apiError } from '@/lib/api/response';
import {
  entrepreneurPackageCreateSchema,
  entrepreneurAdminPackageActionSchema,
} from '@/lib/api/validation/entrepreneur-monetization';
import { ids } from '@/lib/domain/ids';

/** GET — list active entrepreneur package catalog (public) */
export const GET = withOptionalAuth(async (ctx) => {
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container = ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
  const packages = await container.ecosystem.entrepreneurMonetizationService.listCatalog();
  return ok({ packages });
});

/** POST — admin: create catalog item or manage user entitlements */
export const POST = withAuth(async (ctx, request) => {
  const user = await ctx.container.userRepository.findById(ctx.userId);
  if (user?.role !== 'admin') {
    return apiError('Bu işlem için yönetici yetkisi gerekli.', 403, { code: 'FORBIDDEN' });
  }

  const body = await parseJsonBody(request);
  const adminAction = entrepreneurAdminPackageActionSchema.safeParse(body);

  if (adminAction.success) {
    const service = ctx.container.ecosystem.entrepreneurMonetizationService;
    const parsed = adminAction.data;

    switch (parsed.action) {
      case 'activate': {
        const entitlement = await service.activatePackage(
          ids.user(parsed.userId),
          parsed.packageSlug,
        );
        return created({ entitlement });
      }
      case 'suspend': {
        const entitlement = await service.suspendPackage(ids.entrepreneurPackage(parsed.userPackageId));
        return ok({ entitlement });
      }
      case 'cancel': {
        const entitlement = await service.cancelPackage(ids.entrepreneurPackage(parsed.userPackageId));
        return ok({ entitlement });
      }
      case 'extend': {
        const entitlement = await service.extendDuration(
          ids.entrepreneurPackage(parsed.userPackageId),
          parsed.extraDays,
        );
        return ok({ entitlement });
      }
    }
  }

  const parsed = entrepreneurPackageCreateSchema.parse(body);
  const item = await ctx.container.ecosystem.entrepreneurMonetizationService.createCatalogItem(parsed);
  return created({ package: item });
});
