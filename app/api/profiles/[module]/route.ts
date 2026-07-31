import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { moduleParamSchema, profileUpsertSchemas, profileActivateSchema } from '@/lib/api/validation';
import { getModuleProfileService } from '@/lib/api/module-services';

export const GET = withAuth(async (ctx, _request, { params }) => {
  const { module } = moduleParamSchema.parse(params);
  const service = getModuleProfileService(module, ctx.container.ecosystem);
  const profile = await service.getProfile(ctx.profileId);
  return ok({ module, profile });
});

export const PUT = withAuth(async (ctx, request, { params }) => {
  const { module } = moduleParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const schema = profileUpsertSchemas[module as keyof typeof profileUpsertSchemas];
  const parsed = schema.parse(body);
  const service = getModuleProfileService(module, ctx.container.ecosystem);
  const profile = await service.upsertProfile({ profileId: ctx.profileId, ...parsed });
  return ok({ module, profile });
});
