import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, noContent } from '@/lib/api/response';
import { adminUserListQuerySchema, parseAdminUserAction } from '@/lib/api/validation/admin';
import { ids } from '@/lib/domain/ids';

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

/** PATCH — user lifecycle actions */
export const PATCH = withAdmin(async (ctx, request, { params }) => {
  const body = await parseJsonBody(request);
  const action = parseAdminUserAction(body);
  const userId = ids.user(params.id);
  const admin = ctx.container.adminService;

  switch (action.action) {
    case 'activate': {
      const user = await admin.activateUser(userId);
      return ok({ user });
    }
    case 'deactivate': {
      const user = await admin.deactivateUser(userId);
      return ok({ user });
    }
    case 'suspend': {
      const user = await admin.suspendUser(userId);
      return ok({ user });
    }
    case 'delete':
      await admin.deleteUser(userId);
      return noContent();
  }
});
