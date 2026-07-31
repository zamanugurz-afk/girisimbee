import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId } from '@/lib/domain/ids';

export interface FounderProfile extends Timestamps {
  profileId: ProfileId;
  city: string | null;
  district: string | null;
  requiredSkills: string[];
  equityPercentage: number | null;
  specialization: string | null;
  ideaTitle: string | null;
  ideaDescription: string | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertFounderProfileInput = Partial<
  Omit<FounderProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
