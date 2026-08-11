import { withAdmin, assertSuperListingManager } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { parseAdminSettingsPatch } from '@/lib/api/validation/admin';

/** GET — marketplace settings */
export const GET = withAdmin(async (ctx) => {
  const settings = await ctx.container.adminServices.settings.getSettings();
  return ok({ settings });
});

/** PATCH — update marketplace settings (super_admin only) */
export const PATCH = withAdmin(async (ctx, request) => {
  const denied = assertSuperListingManager(ctx);
  if (denied) return denied;

  const body = await parseJsonBody(request);
  const patch = parseAdminSettingsPatch(body);
  const settings = await ctx.container.adminServices.settings.patchSettings(patch);
  return ok({ settings });
});
