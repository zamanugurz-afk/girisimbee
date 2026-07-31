import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { paginationSchema } from '@/lib/api/validation/admin';

/** GET — active featured listings */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = paginationSchema.parse(Object.fromEntries(url.searchParams));
  const result = await ctx.container.adminService.listFeaturedListings({
    page: query.page,
    limit: query.limit,
  });
  return ok(result);
});
