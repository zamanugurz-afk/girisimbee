import type { CareerListingKind } from '@/features/matching-engine/types';

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
  role: string;
  sector: string;
  experienceLevel: string;
  professionalSkills: string;
  technicalSkills: string;
  workType: string;
  workplacePreference: string;
  city: string;
  educationLevel: string;
  languages: string;
  availability: string;
  candidateTraits: string;
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
}
