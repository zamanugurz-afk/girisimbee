import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId } from '@/lib/domain/ids';

export interface InvestorProfile extends Timestamps {
  profileId: ProfileId;
  minimumInvestment: number | null;
  maximumInvestment: number | null;
  investmentStages: string[];
  industries: string[];
  cities: string[];
  investmentHistory: Record<string, unknown>[];
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertInvestorProfileInput = Partial<
  Omit<InvestorProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
