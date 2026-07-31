import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId } from '@/lib/domain/ids';

/** External contact fields for founder profiles */
export interface FounderProfileContactFields {
  telefon: string | null;
  eposta: string | null;
}

export interface FounderProfile extends Timestamps, FounderProfileContactFields {
  profileId: ProfileId;
  fullName: string | null;
  city: string | null;
  district: string | null;
  /** Primary city (DB: sehir) — synced with city */
  sehir: string | null;
  /** Primary district (DB: ilce) — synced with district */
  ilce: string | null;
  founderType: string | null;
  startupStage: string | null;
  sectors: string[];
  requiredSkills: string[];
  offeredSkills: string[];
  experience: string | null;
  biography: string | null;
  linkedInUrl: string | null;
  website: string | null;
  /** @deprecated Use biography */
  ideaDescription: string | null;
  /** @deprecated Use fullName / founderType */
  specialization: string | null;
  /** @deprecated Legacy listing field */
  ideaTitle: string | null;
  equityPercentage: number | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertFounderProfileInput = Partial<
  Omit<FounderProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
