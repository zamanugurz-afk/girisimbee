import type { Timestamps } from '@/lib/domain/base';
import type {
  WorkflowStatus,
  ProfileModuleStatus,
} from '@/lib/domain/marketplace-enums';
import type { ModuleKey } from '@/lib/domain/modules';
import type { ProfileId, ProfileModuleId } from '@/lib/domain/ids';

export interface ProfileModule extends Timestamps {
  id: ProfileModuleId;
  profileId: ProfileId;
  moduleKey: ModuleKey;
  onboardingStep: number;
  onboardingCompletedAt: string | null;
  status: ProfileModuleStatus;
  metadata: Record<string, unknown>;
}

export type CreateProfileModuleInput = Pick<
  ProfileModule,
  'profileId' | 'moduleKey'
> & {
  onboardingStep?: number;
  metadata?: Record<string, unknown>;
};

export type UpdateProfileModuleInput = Partial<
  Pick<
    ProfileModule,
    'onboardingStep' | 'onboardingCompletedAt' | 'status' | 'metadata'
  >
>;
