import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { adminUserListQuerySchema } from '@/lib/api/validation/admin';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { syncMissingProfilesFromAuth } from '@/features/admin/lib/sync-auth-profiles';

/** GET — search/list users */
export const GET = withAdmin(async (ctx, request) => {
  const url = new URL(request.url);
  const query = adminUserListQuerySchema.parse(Object.fromEntries(url.searchParams));

  // Admin list reads public.profiles; backfill any auth.users without a profile row.
  try {
    await syncMissingProfilesFromAuth(createServiceRoleClient());
  } catch {
    // non-fatal — still return whatever profiles exist
  }

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
