import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { adminListingListQuerySchema } from '@/lib/api/validation/admin';

/** GET — search listings */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminListingListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await ctx.container.adminService.searchListings(
    {
      query: query.query,
      status: query.status,
      moduleKey: query.moduleKey,
      isFeatured: query.isFeatured,
      isUrgent: query.isUrgent,
      activeFeaturedOnly: query.activeFeaturedOnly,
      activeUrgentOnly: query.activeUrgentOnly,
    },
    { page: query.page, limit: query.limit },
  );
  return ok(result);
});
