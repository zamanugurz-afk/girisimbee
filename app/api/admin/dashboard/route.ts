import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';

/** GET — admin dashboard metrics */
export const GET = withAdmin(async (ctx) => {
  const stats = await ctx.container.adminServices.dashboard.getStats();
  return ok({ stats });
});
