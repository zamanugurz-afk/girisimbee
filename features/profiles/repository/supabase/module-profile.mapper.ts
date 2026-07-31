import { fromTimestamps } from '@/lib/persistence/mappers';
import type { ProfileModuleId, ProfileId } from '@/lib/domain/ids';
import type { ModuleKey } from '@/lib/domain/modules';
import type { ProfileModuleStatus } from '@/lib/domain/marketplace-enums';
import type { ProfileModule } from '@/features/profiles/types/profile-module.types';
import type { EntrepreneurProfile } from '@/features/profiles/types/entrepreneur-profile.types';
import type { InvestorProfile } from '@/features/profiles/types/investor-profile.types';
import type { CandidateProfile } from '@/features/profiles/types/candidate-profile.types';
import type { EmployerProfile } from '@/features/profiles/types/employer-profile.types';
import type { FounderProfile } from '@/features/profiles/types/founder-profile.types';
import type { FranchiseProfile } from '@/features/profiles/types/franchise-profile.types';
import type { WorkflowStatus } from '@/lib/domain/marketplace-enums';
import type { FranchiseSubcategorySlug } from '@/lib/domain/modules';
import type { DocumentId, CompanyId } from '@/lib/domain/ids';

export interface ProfileModuleRow {
  id: string;
  profile_id: string;
  module_key: string;
  onboarding_step: number;
  onboarding_completed_at: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function mapProfileModuleRow(row: ProfileModuleRow): ProfileModule {
  return {
    id: row.id as ProfileModuleId,
    profileId: row.profile_id as ProfileId,
    moduleKey: row.module_key as ModuleKey,
    onboardingStep: row.onboarding_step,
    onboardingCompletedAt: row.onboarding_completed_at,
    status: row.status as ProfileModuleStatus,
    metadata: row.metadata ?? {},
    ...fromTimestamps(row),
  };
}

export function toProfileModuleRow(input: Partial<ProfileModule>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.profileId !== undefined) row.profile_id = input.profileId;
  if (input.moduleKey !== undefined) row.module_key = input.moduleKey;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  if (input.onboardingCompletedAt !== undefined) row.onboarding_completed_at = input.onboardingCompletedAt;
  if (input.status !== undefined) row.status = input.status;
  if (input.metadata !== undefined) row.metadata = input.metadata;
  return row;
}

function mapWorkflowRow<T extends { workflow_status: string; onboarding_step: number }>(
  row: T,
): Pick<T, 'workflow_status' | 'onboarding_step'> & { workflowStatus: WorkflowStatus; onboardingStep: number } {
  return {
    ...row,
    workflowStatus: row.workflow_status as WorkflowStatus,
    onboardingStep: row.onboarding_step,
  };
}

export interface EntrepreneurProfileRow {
  profile_id: string;
  startup_name: string | null;
  founder_name: string | null;
  description: string | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  sehir: string | null;
  sektor: string | null;
  investment_amount: string | null;
  investment_target: string | null;
  valuation: string | null;
  equity_percentage: string | null;
  company_stage: string | null;
  investment_stage: string | null;
  team_size: number | null;
  monthly_revenue: string | null;
  business_model: string | null;
  website: string | null;
  telefon: string | null;
  eposta: string | null;
  pitch_deck_document_id: string | null;
  workflow_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export function mapEntrepreneurProfileRow(row: EntrepreneurProfileRow): EntrepreneurProfile {
  const wf = mapWorkflowRow(row);
  return {
    profileId: row.profile_id as ProfileId,
    startupName: row.startup_name,
    founderName: row.founder_name,
    description: row.description,
    city: row.city ?? row.sehir,
    district: row.district,
    industry: row.industry ?? row.sektor,
    sehir: row.sehir ?? row.city,
    sektor: row.sektor ?? row.industry,
    investmentAmount: row.investment_amount ? Number(row.investment_amount) : null,
    investmentTarget: row.investment_target ? Number(row.investment_target) : null,
    valuation: row.valuation ? Number(row.valuation) : null,
    equityPercentage: row.equity_percentage ? Number(row.equity_percentage) : null,
    companyStage: row.company_stage ?? row.investment_stage,
    investmentStage: row.investment_stage ?? row.company_stage,
    teamSize: row.team_size,
    monthlyRevenue: row.monthly_revenue ? Number(row.monthly_revenue) : null,
    businessModel: row.business_model,
    website: row.website,
    telefon: row.telefon,
    eposta: row.eposta,
    pitchDeckDocumentId: row.pitch_deck_document_id as DocumentId | null,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toEntrepreneurProfileRow(input: Partial<EntrepreneurProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.startupName !== undefined) row.startup_name = input.startupName;
  if (input.founderName !== undefined) row.founder_name = input.founderName;
  if (input.description !== undefined) row.description = input.description;
  if (input.city !== undefined) {
    row.city = input.city;
    row.sehir = input.sehir ?? input.city;
  }
  if (input.sehir !== undefined) {
    row.sehir = input.sehir;
    row.city = input.city ?? input.sehir;
  }
  if (input.district !== undefined) row.district = input.district;
  if (input.industry !== undefined) {
    row.industry = input.industry;
    row.sektor = input.sektor ?? input.industry;
  }
  if (input.sektor !== undefined) {
    row.sektor = input.sektor;
    row.industry = input.industry ?? input.sektor;
  }
  if (input.investmentAmount !== undefined) row.investment_amount = input.investmentAmount;
  if (input.investmentTarget !== undefined) row.investment_target = input.investmentTarget;
  if (input.valuation !== undefined) row.valuation = input.valuation;
  if (input.equityPercentage !== undefined) row.equity_percentage = input.equityPercentage;
  if (input.companyStage !== undefined) {
    row.company_stage = input.companyStage;
    row.investment_stage = input.investmentStage ?? input.companyStage;
  }
  if (input.investmentStage !== undefined) {
    row.investment_stage = input.investmentStage;
    row.company_stage = input.companyStage ?? input.investmentStage;
  }
  if (input.teamSize !== undefined) row.team_size = input.teamSize;
  if (input.monthlyRevenue !== undefined) row.monthly_revenue = input.monthlyRevenue;
  if (input.businessModel !== undefined) row.business_model = input.businessModel;
  if (input.website !== undefined) row.website = input.website;
  if (input.telefon !== undefined) row.telefon = input.telefon;
  if (input.eposta !== undefined) row.eposta = input.eposta;
  if (input.pitchDeckDocumentId !== undefined) row.pitch_deck_document_id = input.pitchDeckDocumentId;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}

export interface InvestorProfileRow {
  profile_id: string;
  full_name: string | null;
  sehir: string | null;
  ilce: string | null;
  investor_type: string | null;
  investment_stage: string | null;
  minimum_investment: string | null;
  maximum_investment: string | null;
  portfolio_size: number | null;
  linkedin_url: string | null;
  website: string | null;
  bio: string | null;
  telefon: string | null;
  eposta: string | null;
  investment_stages: string[];
  industries: string[];
  cities: string[];
  investment_history: Record<string, unknown>[];
  workflow_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export function mapInvestorProfileRow(row: InvestorProfileRow): InvestorProfile {
  const wf = mapWorkflowRow(row);
  const sectors = row.industries ?? [];
  return {
    profileId: row.profile_id as ProfileId,
    fullName: row.full_name,
    city: row.sehir,
    district: row.ilce,
    sehir: row.sehir,
    ilce: row.ilce,
    investorType: row.investor_type,
    sectors,
    industries: sectors,
    investmentStages: row.investment_stages ?? [],
    investmentStage: row.investment_stage,
    minimumInvestment: row.minimum_investment ? Number(row.minimum_investment) : null,
    maximumInvestment: row.maximum_investment ? Number(row.maximum_investment) : null,
    portfolioSize: row.portfolio_size,
    linkedInUrl: row.linkedin_url,
    website: row.website,
    biography: row.bio,
    telefon: row.telefon,
    eposta: row.eposta,
    cities: row.cities ?? [],
    investmentHistory: row.investment_history ?? [],
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toInvestorProfileRow(input: Partial<InvestorProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.fullName !== undefined) row.full_name = input.fullName;
  if (input.city !== undefined) {
    row.sehir = input.sehir ?? input.city;
  }
  if (input.sehir !== undefined) row.sehir = input.sehir;
  if (input.district !== undefined) {
    row.ilce = input.ilce ?? input.district;
  }
  if (input.ilce !== undefined) row.ilce = input.ilce;
  if (input.investorType !== undefined) row.investor_type = input.investorType;
  if (input.investmentStage !== undefined) row.investment_stage = input.investmentStage;
  if (input.minimumInvestment !== undefined) row.minimum_investment = input.minimumInvestment;
  if (input.maximumInvestment !== undefined) row.maximum_investment = input.maximumInvestment;
  if (input.portfolioSize !== undefined) row.portfolio_size = input.portfolioSize;
  if (input.linkedInUrl !== undefined) row.linkedin_url = input.linkedInUrl;
  if (input.website !== undefined) row.website = input.website;
  if (input.biography !== undefined) row.bio = input.biography;
  if (input.telefon !== undefined) row.telefon = input.telefon;
  if (input.eposta !== undefined) row.eposta = input.eposta;
  if (input.investmentStages !== undefined) row.investment_stages = input.investmentStages;
  if (input.sectors !== undefined) {
    row.industries = input.industries ?? input.sectors;
  }
  if (input.industries !== undefined) row.industries = input.industries;
  if (input.cities !== undefined) row.cities = input.cities;
  if (input.investmentHistory !== undefined) row.investment_history = input.investmentHistory;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}

export interface CandidateProfileRow {
  profile_id: string;
  city: string | null;
  district: string | null;
  full_name: string | null;
  sehir: string | null;
  ilce: string | null;
  position: string | null;
  education: string | null;
  experience_years: number | null;
  salary_expectation: string | null;
  languages: string[];
  skills: string[];
  certifications: string[];
  work_model: string | null;
  education_level: string | null;
  remote_preference: string | null;
  linked_in: string | null;
  portfolio: string | null;
  telefon: string | null;
  eposta: string | null;
  whatsapp: string | null;
  cv_document_id: string | null;
  profile_score: number;
  workflow_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export function mapCandidateProfileRow(row: CandidateProfileRow): CandidateProfile {
  const wf = mapWorkflowRow(row);
  return {
    profileId: row.profile_id as ProfileId,
    fullName: row.full_name,
    city: row.sehir ?? row.city,
    district: row.ilce ?? row.district,
    sehir: row.sehir ?? row.city,
    ilce: row.ilce ?? row.district,
    position: row.position,
    education: row.education,
    experienceYears: row.experience_years,
    salaryExpectation: row.salary_expectation ? Number(row.salary_expectation) : null,
    skills: row.skills ?? [],
    languages: row.languages ?? [],
    certifications: row.certifications ?? [],
    remotePreference: row.remote_preference,
    linkedIn: row.linked_in,
    portfolio: row.portfolio,
    telefon: row.telefon,
    eposta: row.eposta,
    whatsapp: row.whatsapp,
    workModel: row.work_model,
    educationLevel: row.education_level,
    cvDocumentId: row.cv_document_id as DocumentId | null,
    profileScore: row.profile_score ?? 0,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toCandidateProfileRow(input: Partial<CandidateProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.fullName !== undefined) row.full_name = input.fullName;
  if (input.city !== undefined) {
    row.city = input.city;
    row.sehir = input.sehir ?? input.city;
  }
  if (input.district !== undefined) {
    row.district = input.district;
    row.ilce = input.ilce ?? input.district;
  }
  if (input.sehir !== undefined) {
    row.sehir = input.sehir;
    row.city = input.city ?? input.sehir;
  }
  if (input.ilce !== undefined) {
    row.ilce = input.ilce;
    row.district = input.district ?? input.ilce;
  }
  if (input.position !== undefined) row.position = input.position;
  if (input.education !== undefined) row.education = input.education;
  if (input.experienceYears !== undefined) row.experience_years = input.experienceYears;
  if (input.salaryExpectation !== undefined) row.salary_expectation = input.salaryExpectation;
  if (input.skills !== undefined) row.skills = input.skills;
  if (input.languages !== undefined) row.languages = input.languages;
  if (input.certifications !== undefined) row.certifications = input.certifications;
  if (input.remotePreference !== undefined) row.remote_preference = input.remotePreference;
  if (input.linkedIn !== undefined) row.linked_in = input.linkedIn;
  if (input.portfolio !== undefined) row.portfolio = input.portfolio;
  if (input.telefon !== undefined) row.telefon = input.telefon;
  if (input.eposta !== undefined) row.eposta = input.eposta;
  if (input.whatsapp !== undefined) row.whatsapp = input.whatsapp;
  if (input.workModel !== undefined) row.work_model = input.workModel;
  if (input.educationLevel !== undefined) row.education_level = input.educationLevel;
  if (input.cvDocumentId !== undefined) row.cv_document_id = input.cvDocumentId;
  if (input.profileScore !== undefined) row.profile_score = input.profileScore;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}

export interface EmployerProfileRow {
  profile_id: string;
  company_id: string | null;
  company_name: string | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  sehir: string | null;
  ilce: string | null;
  sektor: string | null;
  aciklama: string | null;
  telefon: string | null;
  eposta: string | null;
  website: string | null;
  whatsapp: string | null;
  company_size: string | null;
  workflow_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export function mapEmployerProfileRow(row: EmployerProfileRow): EmployerProfile {
  const wf = mapWorkflowRow(row);
  return {
    profileId: row.profile_id as ProfileId,
    companyId: row.company_id as CompanyId | null,
    companyName: row.company_name,
    city: row.city ?? row.sehir,
    district: row.district ?? row.ilce,
    industry: row.industry ?? row.sektor,
    sehir: row.sehir ?? row.city,
    ilce: row.ilce ?? row.district,
    sektor: row.sektor ?? row.industry,
    aciklama: row.aciklama,
    telefon: row.telefon,
    eposta: row.eposta,
    website: row.website,
    whatsapp: row.whatsapp,
    companySize: row.company_size,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toEmployerProfileRow(input: Partial<EmployerProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.companyId !== undefined) row.company_id = input.companyId;
  if (input.companyName !== undefined) row.company_name = input.companyName;
  if (input.city !== undefined) row.city = input.city;
  if (input.district !== undefined) row.district = input.district;
  if (input.industry !== undefined) row.industry = input.industry;
  if (input.sehir !== undefined) row.sehir = input.sehir;
  if (input.ilce !== undefined) row.ilce = input.ilce;
  if (input.sektor !== undefined) row.sektor = input.sektor;
  if (input.aciklama !== undefined) row.aciklama = input.aciklama;
  if (input.telefon !== undefined) row.telefon = input.telefon;
  if (input.eposta !== undefined) row.eposta = input.eposta;
  if (input.website !== undefined) row.website = input.website;
  if (input.whatsapp !== undefined) row.whatsapp = input.whatsapp;
  if (input.companySize !== undefined) row.company_size = input.companySize;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}

export interface FounderProfileRow {
  profile_id: string;
  full_name: string | null;
  city: string | null;
  district: string | null;
  sehir: string | null;
  ilce: string | null;
  founder_type: string | null;
  startup_stage: string | null;
  sectors: string[];
  required_skills: string[];
  offered_skills: string[];
  experience: string | null;
  bio: string | null;
  linkedin_url: string | null;
  website: string | null;
  telefon: string | null;
  eposta: string | null;
  equity_percentage: string | null;
  specialization: string | null;
  idea_title: string | null;
  idea_description: string | null;
  workflow_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export function mapFounderProfileRow(row: FounderProfileRow): FounderProfile {
  const wf = mapWorkflowRow(row);
  return {
    profileId: row.profile_id as ProfileId,
    fullName: row.full_name,
    city: row.sehir ?? row.city,
    district: row.ilce ?? row.district,
    sehir: row.sehir ?? row.city,
    ilce: row.ilce ?? row.district,
    founderType: row.founder_type,
    startupStage: row.startup_stage,
    sectors: row.sectors ?? [],
    requiredSkills: row.required_skills ?? [],
    offeredSkills: row.offered_skills ?? [],
    experience: row.experience,
    biography: row.bio,
    linkedInUrl: row.linkedin_url,
    website: row.website,
    telefon: row.telefon,
    eposta: row.eposta,
    equityPercentage: row.equity_percentage ? Number(row.equity_percentage) : null,
    specialization: row.specialization,
    ideaTitle: row.idea_title,
    ideaDescription: row.idea_description ?? row.bio,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toFounderProfileRow(input: Partial<FounderProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.fullName !== undefined) row.full_name = input.fullName;
  if (input.city !== undefined) {
    row.city = input.city;
    row.sehir = input.sehir ?? input.city;
  }
  if (input.sehir !== undefined) {
    row.sehir = input.sehir;
    row.city = input.city ?? input.sehir;
  }
  if (input.district !== undefined) {
    row.district = input.district;
    row.ilce = input.ilce ?? input.district;
  }
  if (input.ilce !== undefined) {
    row.ilce = input.ilce;
    row.district = input.district ?? input.ilce;
  }
  if (input.founderType !== undefined) row.founder_type = input.founderType;
  if (input.startupStage !== undefined) row.startup_stage = input.startupStage;
  if (input.sectors !== undefined) row.sectors = input.sectors;
  if (input.requiredSkills !== undefined) row.required_skills = input.requiredSkills;
  if (input.offeredSkills !== undefined) row.offered_skills = input.offeredSkills;
  if (input.experience !== undefined) row.experience = input.experience;
  if (input.biography !== undefined) row.bio = input.biography;
  if (input.linkedInUrl !== undefined) row.linkedin_url = input.linkedInUrl;
  if (input.website !== undefined) row.website = input.website;
  if (input.telefon !== undefined) row.telefon = input.telefon;
  if (input.eposta !== undefined) row.eposta = input.eposta;
  if (input.equityPercentage !== undefined) row.equity_percentage = input.equityPercentage;
  if (input.specialization !== undefined) row.specialization = input.specialization;
  if (input.ideaTitle !== undefined) row.idea_title = input.ideaTitle;
  if (input.ideaDescription !== undefined) row.idea_description = input.ideaDescription;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}

export interface FranchiseProfileRow {
  profile_id: string;
  subcategory_slug: string | null;
  city: string | null;
  district: string | null;
  franchise_fee: string | null;
  investment_amount: string | null;
  return_period_months: number | null;
  sector: string | null;
  ad_soyad: string | null;
  minimum_yatirim: string | null;
  maksimum_yatirim: string | null;
  tercih_edilen_lokasyon: string | null;
  isletme_tecrubesi: string | null;
  aciklama: string | null;
  telefon: string | null;
  eposta: string | null;
  website: string | null;
  marka_adi: string | null;
  minimum_sermaye: string | null;
  tahmini_aylik_ciro: string | null;
  sube_sayisi: number | null;
  egitim_destegi: boolean | null;
  operasyon_destegi: boolean | null;
  pazarlama_destegi: boolean | null;
  workflow_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

function numericOrNull(value: string | null | undefined): number | null {
  return value != null ? Number(value) : null;
}

export function mapFranchiseProfileRow(row: FranchiseProfileRow): FranchiseProfile {
  const wf = mapWorkflowRow(row);
  return {
    profileId: row.profile_id as ProfileId,
    subcategorySlug: row.subcategory_slug as FranchiseSubcategorySlug | null,
    adSoyad: row.ad_soyad,
    sehir: row.city,
    ilce: row.district,
    sektor: row.sector,
    minimumYatirim: numericOrNull(row.minimum_yatirim),
    maksimumYatirim: numericOrNull(row.maksimum_yatirim),
    tercihEdilenLokasyon: row.tercih_edilen_lokasyon,
    isletmeTecrubesi: row.isletme_tecrubesi,
    markaAdi: row.marka_adi,
    franchiseBedeli: numericOrNull(row.franchise_fee),
    minimumSermaye: numericOrNull(row.minimum_sermaye),
    tahminiAylikCiro: numericOrNull(row.tahmini_aylik_ciro),
    subeSayisi: row.sube_sayisi,
    egitimDestegi: row.egitim_destegi,
    operasyonDestegi: row.operasyon_destegi,
    pazarlamaDestegi: row.pazarlama_destegi,
    aciklama: row.aciklama,
    telefon: row.telefon,
    eposta: row.eposta,
    website: row.website,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toFranchiseProfileRow(input: Partial<FranchiseProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.subcategorySlug !== undefined) row.subcategory_slug = input.subcategorySlug;
  if (input.sehir !== undefined) row.city = input.sehir;
  if (input.ilce !== undefined) row.district = input.ilce;
  if (input.sektor !== undefined) row.sector = input.sektor;
  if (input.franchiseBedeli !== undefined) row.franchise_fee = input.franchiseBedeli;
  if (input.adSoyad !== undefined) row.ad_soyad = input.adSoyad;
  if (input.minimumYatirim !== undefined) row.minimum_yatirim = input.minimumYatirim;
  if (input.maksimumYatirim !== undefined) row.maksimum_yatirim = input.maksimumYatirim;
  if (input.tercihEdilenLokasyon !== undefined) row.tercih_edilen_lokasyon = input.tercihEdilenLokasyon;
  if (input.isletmeTecrubesi !== undefined) row.isletme_tecrubesi = input.isletmeTecrubesi;
  if (input.markaAdi !== undefined) row.marka_adi = input.markaAdi;
  if (input.minimumSermaye !== undefined) row.minimum_sermaye = input.minimumSermaye;
  if (input.tahminiAylikCiro !== undefined) row.tahmini_aylik_ciro = input.tahminiAylikCiro;
  if (input.subeSayisi !== undefined) row.sube_sayisi = input.subeSayisi;
  if (input.egitimDestegi !== undefined) row.egitim_destegi = input.egitimDestegi;
  if (input.operasyonDestegi !== undefined) row.operasyon_destegi = input.operasyonDestegi;
  if (input.pazarlamaDestegi !== undefined) row.pazarlama_destegi = input.pazarlamaDestegi;
  if (input.aciklama !== undefined) row.aciklama = input.aciklama;
  if (input.telefon !== undefined) row.telefon = input.telefon;
  if (input.eposta !== undefined) row.eposta = input.eposta;
  if (input.website !== undefined) row.website = input.website;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}
