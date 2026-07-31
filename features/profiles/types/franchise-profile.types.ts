import type { Timestamps } from '@/lib/domain/base';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { FranchiseSubcategorySlug } from '@/lib/domain/modules';
import type { ProfileId } from '@/lib/domain/ids';

/** External contact fields shared by buy and give profiles */
export interface FranchiseProfileContactFields {
  aciklama: string | null;
  telefon: string | null;
  eposta: string | null;
  website: string | null;
}

/** Bayilik Al (franchise-buy) profile fields */
export interface FranchiseBuyProfileFields extends FranchiseProfileContactFields {
  adSoyad: string | null;
  sehir: string | null;
  ilce: string | null;
  sektor: string | null;
  minimumYatirim: number | null;
  maksimumYatirim: number | null;
  tercihEdilenLokasyon: string | null;
  isletmeTecrubesi: string | null;
}

/** Bayilik Ver (franchise-give) profile fields */
export interface FranchiseGiveProfileFields extends FranchiseProfileContactFields {
  markaAdi: string | null;
  sektor: string | null;
  sehir: string | null;
  franchiseBedeli: number | null;
  minimumSermaye: number | null;
  tahminiAylikCiro: number | null;
  subeSayisi: number | null;
  egitimDestegi: boolean | null;
  operasyonDestegi: boolean | null;
  pazarlamaDestegi: boolean | null;
}

export interface FranchiseProfileBase extends Timestamps {
  profileId: ProfileId;
  subcategorySlug: FranchiseSubcategorySlug | null;
  workflowStatus: WorkflowStatus;
  onboardingStep: number;
}

/** Combined row — buy/give-specific columns coexist as nullable fields */
export interface FranchiseProfile
  extends FranchiseProfileBase,
    FranchiseBuyProfileFields,
    FranchiseGiveProfileFields {}

export type FranchiseBuyProfile = FranchiseProfile & { subcategorySlug: 'franchise-buy' };
export type FranchiseGiveProfile = FranchiseProfile & { subcategorySlug: 'franchise-give' };

export type UpsertFranchiseBuyProfileInput = Partial<
  Omit<FranchiseBuyProfileFields, never>
> & {
  profileId: ProfileId;
  subcategorySlug?: 'franchise-buy';
  workflowStatus?: WorkflowStatus;
  onboardingStep?: number;
};

export type UpsertFranchiseGiveProfileInput = Partial<
  Omit<FranchiseGiveProfileFields, never>
> & {
  profileId: ProfileId;
  subcategorySlug?: 'franchise-give';
  workflowStatus?: WorkflowStatus;
  onboardingStep?: number;
};

export type UpsertFranchiseProfileInput = Partial<
  Omit<FranchiseProfile, 'profileId' | 'createdAt' | 'updatedAt'>
> & { profileId: ProfileId };
