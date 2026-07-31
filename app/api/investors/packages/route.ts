import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created, apiError } from '@/lib/api/response';
import {
  investorPackageCreateSchema,
  investorAdminPackageActionSchema,
} from '@/lib/api/validation/investor-monetization';
import { ids } from '@/lib/domain/ids';

/** GET — list active investor package catalog (public) */
export const GET = withOptionalAuth(async (ctx) => {
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container = ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
  const packages = await container.ecosystem.investorMonetizationService.listCatalog();
  return ok({ packages });
});

/** POST — admin: create catalog item or manage user entitlements */
export const POST = withAuth(async (ctx, request) => {
  const user = await ctx.container.userRepository.findById(ctx.userId);
  if (user?.role !== 'admin') {
    return apiError('Bu işlem için yönetici yetkisi gerekli.', 403, { code: 'FORBIDDEN' });
  }

  const body = await parseJsonBody(request);
  const adminAction = investorAdminPackageActionSchema.safeParse(body);

  if (adminAction.success) {
    const service = ctx.container.ecosystem.investorMonetizationService;
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
        const entitlement = await service.suspendPackage(ids.investorPackage(parsed.userPackageId));
        return ok({ entitlement });
      }
      case 'cancel': {
        const entitlement = await service.cancelPackage(ids.investorPackage(parsed.userPackageId));
        return ok({ entitlement });
      }
      case 'extend': {
        const entitlement = await service.extendDuration(
          ids.investorPackage(parsed.userPackageId),
          parsed.extraDays,
        );
        return ok({ entitlement });
      }
    }
  }

  const parsed = investorPackageCreateSchema.parse(body);
  const item = await ctx.container.ecosystem.investorMonetizationService.createCatalogItem(parsed);
  return created({ package: item });
});
