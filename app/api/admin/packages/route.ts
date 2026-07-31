import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  adminPackageListQuerySchema,
  parseAdminPackageAction,
} from '@/lib/api/validation/admin';
import { ids } from '@/lib/domain/ids';

/** GET — unified package catalogs */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminPackageListQuerySchema.parse(Object.fromEntries(url.searchParams));

  if (query.moduleKey) {
    const catalog = await ctx.container.adminServices.packages.listModuleCatalog(query.moduleKey);
    return ok({ catalog });
  }

  const catalogs = await ctx.container.adminServices.packages.listAllCatalogs();
  return ok({ catalogs });
});

/** POST — activate/suspend entitlements */
export const POST = withAdmin(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const action = parseAdminPackageAction(body);
  const service = ctx.container.adminServices.packages;

  switch (action.action) {
    case 'activate': {
      const entitlement = await service.activateModulePackage(
        action.moduleKey,
        ids.user(action.userId),
        action.packageSlug,
      );
      return created({ entitlement });
    }
    case 'suspend': {
      const entitlement = await service.suspendModulePackage(action.moduleKey, action.userPackageId);
      return ok({ entitlement });
    }
  }
});
