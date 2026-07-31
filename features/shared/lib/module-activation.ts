import type { ModuleKey } from '@/lib/domain/modules';
import type { ProfileId } from '@/lib/domain/ids';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ProfileModule } from '@/features/profiles/types/profile-module.types';

export async function activateModule(
  repo: ModuleProfileRepository,
  profileId: ProfileId,
  moduleKey: ModuleKey,
): Promise<ProfileModule> {
  const existing = await repo.findProfileModule(profileId, moduleKey);
  if (existing) return existing;
  return repo.createProfileModule({ profileId, moduleKey });
}

export async function advanceModuleStep(
  repo: ModuleProfileRepository,
  profileId: ProfileId,
  moduleKey: ModuleKey,
  step: number,
): Promise<ProfileModule> {
  const record = await activateModule(repo, profileId, moduleKey);
  return repo.updateProfileModule(record.id, {
    onboardingStep: step,
    status: step >= 100 ? 'active' : 'onboarding',
    ...(step >= 100 ? { onboardingCompletedAt: new Date().toISOString() } : {}),
  });
}
