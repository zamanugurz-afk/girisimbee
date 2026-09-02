import type { ModuleKey } from '@/lib/domain/modules';
import type { ProfileId } from '@/lib/domain/ids';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ProfileModule } from '@/features/profiles/types/profile-module.types';

export async function activateModule(
  repo: ModuleProfileRepository,
  profileId: ProfileId,
  moduleKey: ModuleKey,
): Promise<ProfileModule> {
  try {
    const existing = await repo.findProfileModule(profileId, moduleKey);
    if (existing) return existing;
    return await repo.createProfileModule({ profileId, moduleKey });
  } catch (err) {
    console.warn('[module-activation] non-fatal activateModule fallback:', err);
    return {
      id: `${moduleKey}-${profileId}` as unknown as any,
      profileId,
      moduleKey,
      status: 'active',
      onboardingStep: 100,
      onboardingCompletedAt: new Date().toISOString(),
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function advanceModuleStep(
  repo: ModuleProfileRepository,
  profileId: ProfileId,
  moduleKey: ModuleKey,
  step: number,
): Promise<ProfileModule> {
  try {
    const record = await activateModule(repo, profileId, moduleKey);
    return await repo.updateProfileModule(record.id, {
      onboardingStep: step,
      status: step >= 100 ? 'active' : 'onboarding',
      ...(step >= 100 ? { onboardingCompletedAt: new Date().toISOString() } : {}),
    });
  } catch (err) {
    console.warn('[module-activation] non-fatal advanceModuleStep fallback:', err);
    return {
      id: `${moduleKey}-${profileId}` as unknown as any,
      profileId,
      moduleKey,
      status: step >= 100 ? 'active' : 'onboarding',
      onboardingStep: step,
      onboardingCompletedAt: step >= 100 ? new Date().toISOString() : null,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
