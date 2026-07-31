import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId, DocumentId } from '@/lib/domain/ids';

/** External contact fields for candidate profiles */
export interface CandidateProfileContactFields {
  telefon: string | null;
  eposta: string | null;
  whatsapp: string | null;
}

export interface CandidateProfile extends Timestamps, CandidateProfileContactFields {
  profileId: ProfileId;
  fullName: string | null;
  city: string | null;
  district: string | null;
  sehir: string | null;
  ilce: string | null;
  position: string | null;
  education: string | null;
  educationLevel: string | null;
  experienceYears: number | null;
  skills: string[];
  languages: string[];
  certifications: string[];
  /** Alias: expectedSalary in API maps here */
  salaryExpectation: number | null;
  remotePreference: string | null;
  linkedIn: string | null;
  portfolio: string | null;
  workModel: string | null;
  cvDocumentId: DocumentId | null;
  profileScore: number;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertCandidateProfileInput = Partial<
  Omit<CandidateProfile, 'profileId' | 'createdAt' | 'updatedAt' | 'profileScore'>
> & { profileId: ProfileId };
