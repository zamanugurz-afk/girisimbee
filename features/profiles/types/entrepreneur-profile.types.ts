import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId, DocumentId } from '@/lib/domain/ids';

/** External contact fields for entrepreneur profiles */
export interface EntrepreneurProfileContactFields {
  telefon: string | null;
  eposta: string | null;
}

export interface EntrepreneurProfile extends Timestamps, EntrepreneurProfileContactFields {
  profileId: ProfileId;
  startupName: string | null;
  founderName: string | null;
  description: string | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  sehir: string | null;
  sektor: string | null;
  investmentAmount: number | null;
  investmentTarget: number | null;
  valuation: number | null;
  equityPercentage: number | null;
  companyStage: string | null;
  investmentStage: string | null;
  teamSize: number | null;
  monthlyRevenue: number | null;
  businessModel: string | null;
  website: string | null;
  pitchDeckDocumentId: DocumentId | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertEntrepreneurProfileInput = Partial<
  Omit<EntrepreneurProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
