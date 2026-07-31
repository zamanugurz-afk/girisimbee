import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created } from '@/lib/api/response';
import { moduleParamSchema, profileActivateSchema } from '@/lib/api/validation';
import { getModuleProfileService } from '@/lib/api/module-services';
export const POST = withAuth(async (ctx, request, { params }) => {
  const { module } = moduleParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const { flow } = profileActivateSchema.parse(body);
  const service = getModuleProfileService(module, ctx.container.ecosystem);

  let profile: unknown;
  if (module === 'franchise') {
    profile = await service.activateProfile(ctx.profileId, flow ?? 'buy');
  } else {
    profile = await service.activateProfile(ctx.profileId);
  }

  return created({ module, profile });
});
