'use server';

import type { ModuleKey } from '@/lib/domain/modules';
import { runAuthenticatedAction } from '@/lib/api/action-handler';
import { getModuleProfileService } from '@/lib/api/module-services';
import { profileUpsertSchemas, profileActivateSchema } from '@/lib/api/validation';

export async function getModuleProfileAction(module: ModuleKey) {
  return runAuthenticatedAction(async (ctx) => {
    const service = getModuleProfileService(module, ctx.container.ecosystem);
    const profile = await service.getProfile(ctx.profileId);
    return { module, profile };
  });
}

export async function upsertModuleProfileAction(module: ModuleKey, input: unknown) {
  return runAuthenticatedAction(async (ctx) => {
    const schema = profileUpsertSchemas[module];
    const parsed = schema.parse(input);
    const service = getModuleProfileService(module, ctx.container.ecosystem);
    const profile = await service.upsertProfile({ profileId: ctx.profileId, ...parsed });
    return { module, profile };
  });
}

export async function activateModuleProfileAction(module: ModuleKey, input: unknown = {}) {
  return runAuthenticatedAction(async (ctx) => {
    const parsed = profileActivateSchema.parse(input);
    const service = getModuleProfileService(module, ctx.container.ecosystem);
    if (module === 'franchise' && parsed.flow) {
      await service.activateProfile(ctx.profileId, parsed.flow);
    } else {
      await service.activateProfile(ctx.profileId);
    }
    const profile = await service.getProfile(ctx.profileId);
    return { module, profile };
  });
}
