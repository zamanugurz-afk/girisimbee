import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { adminApplicationListQuerySchema } from '@/lib/api/validation/admin';

/** GET — list applications across modules */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminApplicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await ctx.container.adminServices.applications.listApplications(
    {
      moduleKey: query.moduleKey,
      status: query.status,
      includeDeleted: query.includeDeleted,
    },
    { page: query.page, limit: query.limit },
  );
  return ok(result);
});
