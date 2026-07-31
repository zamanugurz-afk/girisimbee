import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileId } from '@/lib/domain/ids';

/** External contact fields for investor profiles */
export interface InvestorProfileContactFields {
  telefon: string | null;
  eposta: string | null;
}

export interface InvestorProfile extends Timestamps, InvestorProfileContactFields {
  profileId: ProfileId;
  fullName: string | null;
  city: string | null;
  district: string | null;
  /** Primary city (DB: sehir) — synced with city */
  sehir: string | null;
  /** Primary district (DB: ilce) — synced with district */
  ilce: string | null;
  investorType: string | null;
  /** Preferred sectors — DB: industries */
  sectors: string[];
  industries: string[];
  /** Preferred investment stages */
  investmentStages: string[];
  /** Primary stage focus (DB: investment_stage) */
  investmentStage: string | null;
  minimumInvestment: number | null;
  maximumInvestment: number | null;
  portfolioSize: number | null;
  linkedInUrl: string | null;
  website: string | null;
  biography: string | null;
  cities: string[];
  investmentHistory: Record<string, unknown>[];
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

export type UpsertInvestorProfileInput = Partial<
  Omit<InvestorProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
