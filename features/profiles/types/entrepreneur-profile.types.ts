import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId, DocumentId } from '@/lib/domain/ids';

export interface EntrepreneurProfile extends Timestamps {
  profileId: ProfileId;
  startupName: string | null;
  description: string | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  investmentAmount: number | null;
  valuation: number | null;
  equityPercentage: number | null;
  companyStage: string | null;
  teamSize: number | null;
  monthlyRevenue: number | null;
  website: string | null;
  pitchDeckDocumentId: DocumentId | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertEntrepreneurProfileInput = Partial<
  Omit<EntrepreneurProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
