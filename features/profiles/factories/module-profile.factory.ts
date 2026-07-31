import { ids } from '@/lib/domain/ids';
import { timestamps } from '@/lib/domain/factory';
import type { ProfileModule } from '@/features/profiles/types/profile-module.types';
import type { EntrepreneurProfile } from '@/features/profiles/types/entrepreneur-profile.types';
import type { InvestorProfile } from '@/features/profiles/types/investor-profile.types';
import type { CandidateProfile } from '@/features/profiles/types/candidate-profile.types';
import type { EmployerProfile } from '@/features/profiles/types/employer-profile.types';
import type { FounderProfile } from '@/features/profiles/types/founder-profile.types';
import type { FranchiseProfile } from '@/features/profiles/types/franchise-profile.types';

export function createProfileModule(
  overrides: Partial<ProfileModule> &
    Pick<ProfileModule, 'profileId' | 'moduleKey'>,
): ProfileModule {
  return {
    id: overrides.id ?? ids.profileModule(crypto.randomUUID()),
    profileId: overrides.profileId,
    moduleKey: overrides.moduleKey,
    onboardingStep: overrides.onboardingStep ?? 0,
    onboardingCompletedAt: overrides.onboardingCompletedAt ?? null,
    status: overrides.status ?? 'onboarding',
    metadata: overrides.metadata ?? {},
    ...timestamps(overrides.createdAt),
  };
}

export function createEntrepreneurProfile(
  overrides: Partial<EntrepreneurProfile> & Pick<EntrepreneurProfile, 'profileId'>,
): EntrepreneurProfile {
  return {
    profileId: overrides.profileId,
    startupName: overrides.startupName ?? null,
    description: overrides.description ?? null,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    industry: overrides.industry ?? null,
    investmentAmount: overrides.investmentAmount ?? null,
    valuation: overrides.valuation ?? null,
    equityPercentage: overrides.equityPercentage ?? null,
    companyStage: overrides.companyStage ?? null,
    teamSize: overrides.teamSize ?? null,
    monthlyRevenue: overrides.monthlyRevenue ?? null,
    website: overrides.website ?? null,
    pitchDeckDocumentId: overrides.pitchDeckDocumentId ?? null,
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}

export function createInvestorProfile(
  overrides: Partial<InvestorProfile> & Pick<InvestorProfile, 'profileId'>,
): InvestorProfile {
  return {
    profileId: overrides.profileId,
    minimumInvestment: overrides.minimumInvestment ?? null,
    maximumInvestment: overrides.maximumInvestment ?? null,
    investmentStages: overrides.investmentStages ?? [],
    industries: overrides.industries ?? [],
    cities: overrides.cities ?? [],
    investmentHistory: overrides.investmentHistory ?? [],
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}

export function createCandidateProfile(
  overrides: Partial<CandidateProfile> & Pick<CandidateProfile, 'profileId'>,
): CandidateProfile {
  return {
    profileId: overrides.profileId,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    position: overrides.position ?? null,
    experienceYears: overrides.experienceYears ?? null,
    salaryExpectation: overrides.salaryExpectation ?? null,
    languages: overrides.languages ?? [],
    workModel: overrides.workModel ?? null,
    educationLevel: overrides.educationLevel ?? null,
    cvDocumentId: overrides.cvDocumentId ?? null,
    profileScore: overrides.profileScore ?? 0,
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}

export function createEmployerProfile(
  overrides: Partial<EmployerProfile> & Pick<EmployerProfile, 'profileId'>,
): EmployerProfile {
  return {
    profileId: overrides.profileId,
    companyId: overrides.companyId ?? null,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    industry: overrides.industry ?? null,
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}

export function createFounderProfile(
  overrides: Partial<FounderProfile> & Pick<FounderProfile, 'profileId'>,
): FounderProfile {
  return {
    profileId: overrides.profileId,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    requiredSkills: overrides.requiredSkills ?? [],
    equityPercentage: overrides.equityPercentage ?? null,
    specialization: overrides.specialization ?? null,
    ideaTitle: overrides.ideaTitle ?? null,
    ideaDescription: overrides.ideaDescription ?? null,
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}

export function createFranchiseProfile(
  overrides: Partial<FranchiseProfile> & Pick<FranchiseProfile, 'profileId'>,
): FranchiseProfile {
  return {
    profileId: overrides.profileId,
    subcategorySlug: overrides.subcategorySlug ?? null,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    franchiseFee: overrides.franchiseFee ?? null,
    investmentAmount: overrides.investmentAmount ?? null,
    returnPeriodMonths: overrides.returnPeriodMonths ?? null,
    sector: overrides.sector ?? null,
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}
