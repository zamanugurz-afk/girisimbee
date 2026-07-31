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
    founderName: overrides.founderName ?? null,
    description: overrides.description ?? null,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    industry: overrides.industry ?? null,
    sehir: overrides.sehir ?? overrides.city ?? null,
    sektor: overrides.sektor ?? overrides.industry ?? null,
    investmentAmount: overrides.investmentAmount ?? null,
    investmentTarget: overrides.investmentTarget ?? null,
    valuation: overrides.valuation ?? null,
    equityPercentage: overrides.equityPercentage ?? null,
    companyStage: overrides.companyStage ?? null,
    investmentStage: overrides.investmentStage ?? overrides.companyStage ?? null,
    teamSize: overrides.teamSize ?? null,
    monthlyRevenue: overrides.monthlyRevenue ?? null,
    businessModel: overrides.businessModel ?? null,
    website: overrides.website ?? null,
    telefon: overrides.telefon ?? null,
    eposta: overrides.eposta ?? null,
    pitchDeckDocumentId: overrides.pitchDeckDocumentId ?? null,
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}

export function createInvestorProfile(
  overrides: Partial<InvestorProfile> & Pick<InvestorProfile, 'profileId'>,
): InvestorProfile {
  const sectors = overrides.sectors ?? overrides.industries ?? [];
  return {
    profileId: overrides.profileId,
    fullName: overrides.fullName ?? null,
    city: overrides.city ?? overrides.sehir ?? null,
    district: overrides.district ?? overrides.ilce ?? null,
    sehir: overrides.sehir ?? overrides.city ?? null,
    ilce: overrides.ilce ?? overrides.district ?? null,
    investorType: overrides.investorType ?? null,
    sectors,
    industries: overrides.industries ?? sectors,
    investmentStages: overrides.investmentStages ?? [],
    investmentStage: overrides.investmentStage ?? null,
    minimumInvestment: overrides.minimumInvestment ?? null,
    maximumInvestment: overrides.maximumInvestment ?? null,
    portfolioSize: overrides.portfolioSize ?? null,
    linkedInUrl: overrides.linkedInUrl ?? null,
    website: overrides.website ?? null,
    biography: overrides.biography ?? null,
    telefon: overrides.telefon ?? null,
    eposta: overrides.eposta ?? null,
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
    fullName: overrides.fullName ?? null,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    sehir: overrides.sehir ?? overrides.city ?? null,
    ilce: overrides.ilce ?? overrides.district ?? null,
    position: overrides.position ?? null,
    education: overrides.education ?? null,
    experienceYears: overrides.experienceYears ?? null,
    salaryExpectation: overrides.salaryExpectation ?? null,
    skills: overrides.skills ?? [],
    languages: overrides.languages ?? [],
    certifications: overrides.certifications ?? [],
    remotePreference: overrides.remotePreference ?? null,
    linkedIn: overrides.linkedIn ?? null,
    portfolio: overrides.portfolio ?? null,
    telefon: overrides.telefon ?? null,
    eposta: overrides.eposta ?? null,
    whatsapp: overrides.whatsapp ?? null,
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
    companyName: overrides.companyName ?? null,
    city: overrides.city ?? null,
    district: overrides.district ?? null,
    industry: overrides.industry ?? null,
    sehir: overrides.sehir ?? overrides.city ?? null,
    ilce: overrides.ilce ?? overrides.district ?? null,
    sektor: overrides.sektor ?? overrides.industry ?? null,
    aciklama: overrides.aciklama ?? null,
    telefon: overrides.telefon ?? null,
    eposta: overrides.eposta ?? null,
    website: overrides.website ?? null,
    whatsapp: overrides.whatsapp ?? null,
    companySize: overrides.companySize ?? null,
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
    fullName: overrides.fullName ?? null,
    city: overrides.city ?? overrides.sehir ?? null,
    district: overrides.district ?? overrides.ilce ?? null,
    sehir: overrides.sehir ?? overrides.city ?? null,
    ilce: overrides.ilce ?? overrides.district ?? null,
    founderType: overrides.founderType ?? null,
    startupStage: overrides.startupStage ?? null,
    sectors: overrides.sectors ?? [],
    requiredSkills: overrides.requiredSkills ?? [],
    offeredSkills: overrides.offeredSkills ?? [],
    experience: overrides.experience ?? null,
    biography: overrides.biography ?? null,
    linkedInUrl: overrides.linkedInUrl ?? null,
    website: overrides.website ?? null,
    telefon: overrides.telefon ?? null,
    eposta: overrides.eposta ?? null,
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
    adSoyad: overrides.adSoyad ?? null,
    sehir: overrides.sehir ?? null,
    ilce: overrides.ilce ?? null,
    sektor: overrides.sektor ?? null,
    minimumYatirim: overrides.minimumYatirim ?? null,
    maksimumYatirim: overrides.maksimumYatirim ?? null,
    tercihEdilenLokasyon: overrides.tercihEdilenLokasyon ?? null,
    isletmeTecrubesi: overrides.isletmeTecrubesi ?? null,
    markaAdi: overrides.markaAdi ?? null,
    franchiseBedeli: overrides.franchiseBedeli ?? null,
    minimumSermaye: overrides.minimumSermaye ?? null,
    tahminiAylikCiro: overrides.tahminiAylikCiro ?? null,
    subeSayisi: overrides.subeSayisi ?? null,
    egitimDestegi: overrides.egitimDestegi ?? null,
    operasyonDestegi: overrides.operasyonDestegi ?? null,
    pazarlamaDestegi: overrides.pazarlamaDestegi ?? null,
    aciklama: overrides.aciklama ?? null,
    telefon: overrides.telefon ?? null,
    eposta: overrides.eposta ?? null,
    website: overrides.website ?? null,
    workflowStatus: overrides.workflowStatus ?? 'draft',
    onboardingStep: overrides.onboardingStep ?? 0,
    ...timestamps(overrides.createdAt),
  };
}
