import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId, DocumentId } from '@/lib/domain/ids';

export interface CandidateProfile extends Timestamps {
  profileId: ProfileId;
  city: string | null;
  district: string | null;
  position: string | null;
  experienceYears: number | null;
  salaryExpectation: number | null;
  languages: string[];
  workModel: string | null;
  educationLevel: string | null;
  cvDocumentId: DocumentId | null;
  profileScore: number;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertCandidateProfileInput = Partial<
  Omit<CandidateProfile, 'profileId' | 'createdAt' | 'updatedAt' | 'profileScore'>
> & { profileId: ProfileId };
