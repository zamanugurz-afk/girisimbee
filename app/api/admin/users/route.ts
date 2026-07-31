import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { adminUserListQuerySchema } from '@/lib/api/validation/admin';

/** GET — search/list users */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminUserListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await ctx.container.adminService.searchUsers(
    {
      query: query.query,
      status: query.status,
      role: query.role,
    },
    { page: query.page, limit: query.limit },
  );
  return ok(result);
});
