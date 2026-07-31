import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { FranchiseSubcategorySlug } from '@/lib/domain/modules';
import type { ProfileId } from '@/lib/domain/ids';

export interface FranchiseProfile extends Timestamps {
  profileId: ProfileId;
  subcategorySlug: FranchiseSubcategorySlug | null;
  city: string | null;
  district: string | null;
  franchiseFee: number | null;
  investmentAmount: number | null;
  returnPeriodMonths: number | null;
  sector: string | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertFranchiseProfileInput = Partial<
  Omit<FranchiseProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
