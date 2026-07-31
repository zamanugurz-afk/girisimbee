import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { adminProfileListQuerySchema } from '@/lib/api/validation/admin';

/** GET — list/search module profiles across ecosystem */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminProfileListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await ctx.container.adminServices.profiles.searchProfiles(
    {
      moduleKey: query.moduleKey,
      query: query.query,
      status: query.status,
    },
    { page: query.page, limit: query.limit },
  );
  return ok(result);
});
