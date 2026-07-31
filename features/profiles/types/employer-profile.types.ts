import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId, CompanyId } from '@/lib/domain/ids';

export interface EmployerProfile extends Timestamps {
  profileId: ProfileId;
  companyId: CompanyId | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertEmployerProfileInput = Partial<
  Omit<EmployerProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
