import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created, apiError } from '@/lib/api/response';
import {
  candidatePackageCreateSchema,
  candidateAdminPackageActionSchema,
} from '@/lib/api/validation/candidate-monetization';
import { ids } from '@/lib/domain/ids';

/** GET — list active candidate package catalog (public) */
export const GET = withOptionalAuth(async (ctx) => {
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container = ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);
  const packages = await container.ecosystem.candidateMonetizationService.listCatalog();
  return ok({ packages });
});

/** POST — admin: create catalog item or manage user entitlements */
export const POST = withAuth(async (ctx, request) => {
  const user = await ctx.container.userRepository.findById(ctx.userId);
  if (user?.role !== 'admin') {
    return apiError('Bu işlem için yönetici yetkisi gerekli.', 403, { code: 'FORBIDDEN' });
  }

  const body = await parseJsonBody(request);
  const adminAction = candidateAdminPackageActionSchema.safeParse(body);

  if (adminAction.success) {
    const service = ctx.container.ecosystem.candidateMonetizationService;
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
        const entitlement = await service.suspendPackage(ids.candidatePackage(parsed.userPackageId));
        return ok({ entitlement });
      }
      case 'cancel': {
        const entitlement = await service.cancelPackage(ids.candidatePackage(parsed.userPackageId));
        return ok({ entitlement });
      }
      case 'extend': {
        const entitlement = await service.extendDuration(
          ids.candidatePackage(parsed.userPackageId),
          parsed.extraDays,
        );
        return ok({ entitlement });
      }
    }
  }

  const parsed = candidatePackageCreateSchema.parse(body);
  const item = await ctx.container.ecosystem.candidateMonetizationService.createCatalogItem(parsed);
  return created({ package: item });
});
