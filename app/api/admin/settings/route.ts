import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { parseAdminSettingsPatch } from '@/lib/api/validation/admin';

/** GET — marketplace settings */
export const GET = withAdmin(async (ctx) => {
  const settings = await ctx.container.adminServices.settings.getSettings();
  return ok({ settings });
});

/** PATCH — update marketplace settings */
export const PATCH = withAdmin(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const patch = parseAdminSettingsPatch(body);
  const settings = await ctx.container.adminServices.settings.patchSettings(patch);
  return ok({ settings });
});
