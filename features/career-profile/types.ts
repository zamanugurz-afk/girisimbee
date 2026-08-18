import type { CareerListingKind } from '@/features/matching-engine/types';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

export type CareerPersonaKind = 'seek' | 'hire' | 'partner';

export type CareerProfileFieldKey =
  | 'role'
  | 'sector'
  | 'experience'
  | 'professionalSkills'
  | 'technicalSkills'
  | 'workType'
  | 'workplacePreference'
  | 'location'
  | 'education'
  | 'languages'
  | 'availability'
  | 'candidateTraits';

export interface CareerProfileFieldState {
  key: CareerProfileFieldKey;
  label: string;
  weight: number;
  filled: boolean;
  value: string | null;
}

export interface CareerProfileCompletion {
  kind: CareerListingKind;
  listingId: string;
  percent: number;
  complete: boolean;
  fields: CareerProfileFieldState[];
  missingLabels: string[];
}

export interface CareerProfileFormValues {
  // Primary role & sector
  role: string;
  roles?: string[];
  sector: string;
  sectors?: string[];
  experienceLevel: string;
  workType: string;
  workplacePreference: string;
  city: string;
  educationLevel: string;
  educationField?: string;
  languages: string;
  certificates?: string;
  availability: string;
  candidateTraits: string;
  professionalSkills: string;
  professionalSkillsList?: string[];
  technicalSkills: string;
  technicalSkillsList?: string[];
  tools?: string;
  toolsList?: string[];
  salary?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;

  // Personal / demographics (for job seeker)
  profileGender?: string;
  birthDate?: string;
  residenceCity?: string;
  residenceDistrict?: string;
  preferredDistrict?: string;

  // Work experience history
  experiences?: CareerExperience[];

  // Structured education history
  educationHistory?: Array<{
    level?: string;
    field?: string;
    school?: string;
    graduationYear?: number | null;
  }>;

  // Employer / Hiring specific
  companyName?: string;
  requiredAchievements?: string;

  // CV File Attachment metadata
  cvFileName?: string;
  cvDocumentId?: string;
  cvUploadedAt?: string;

  // Partnership specific
  partnerType?: string;
  stage?: string;
  businessModel?: string;
  capitalContribution?: string;
  equityOffered?: string;
}

export interface CareerProfileRecord {
  kind: CareerListingKind;
  listingId: string;
  title: string;
  status: string;
  editHref: string;
  values: CareerProfileFormValues;
  completion: CareerProfileCompletion;
}

export interface CareerProfilePageData {
  seek: CareerProfileRecord | null;
  hire: CareerProfileRecord | null;
  partner?: CareerProfileRecord | null;
}
