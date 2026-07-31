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
  description: string | null;
  city: string | null;
  district: string | null;
  industry: string | null;
  investment_amount: string | null;
  valuation: string | null;
  equity_percentage: string | null;
  company_stage: string | null;
  team_size: number | null;
  monthly_revenue: string | null;
  website: string | null;
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
    description: row.description,
    city: row.city,
    district: row.district,
    industry: row.industry,
    investmentAmount: row.investment_amount ? Number(row.investment_amount) : null,
    valuation: row.valuation ? Number(row.valuation) : null,
    equityPercentage: row.equity_percentage ? Number(row.equity_percentage) : null,
    companyStage: row.company_stage,
    teamSize: row.team_size,
    monthlyRevenue: row.monthly_revenue ? Number(row.monthly_revenue) : null,
    website: row.website,
    pitchDeckDocumentId: row.pitch_deck_document_id as DocumentId | null,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toEntrepreneurProfileRow(input: Partial<EntrepreneurProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.startupName !== undefined) row.startup_name = input.startupName;
  if (input.description !== undefined) row.description = input.description;
  if (input.city !== undefined) row.city = input.city;
  if (input.district !== undefined) row.district = input.district;
  if (input.industry !== undefined) row.industry = input.industry;
  if (input.investmentAmount !== undefined) row.investment_amount = input.investmentAmount;
  if (input.valuation !== undefined) row.valuation = input.valuation;
  if (input.equityPercentage !== undefined) row.equity_percentage = input.equityPercentage;
  if (input.companyStage !== undefined) row.company_stage = input.companyStage;
  if (input.teamSize !== undefined) row.team_size = input.teamSize;
  if (input.monthlyRevenue !== undefined) row.monthly_revenue = input.monthlyRevenue;
  if (input.website !== undefined) row.website = input.website;
  if (input.pitchDeckDocumentId !== undefined) row.pitch_deck_document_id = input.pitchDeckDocumentId;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}

export interface InvestorProfileRow {
  profile_id: string;
  minimum_investment: string | null;
  maximum_investment: string | null;
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
  return {
    profileId: row.profile_id as ProfileId,
    minimumInvestment: row.minimum_investment ? Number(row.minimum_investment) : null,
    maximumInvestment: row.maximum_investment ? Number(row.maximum_investment) : null,
    investmentStages: row.investment_stages ?? [],
    industries: row.industries ?? [],
    cities: row.cities ?? [],
    investmentHistory: row.investment_history ?? [],
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toInvestorProfileRow(input: Partial<InvestorProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.minimumInvestment !== undefined) row.minimum_investment = input.minimumInvestment;
  if (input.maximumInvestment !== undefined) row.maximum_investment = input.maximumInvestment;
  if (input.investmentStages !== undefined) row.investment_stages = input.investmentStages;
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
  position: string | null;
  experience_years: number | null;
  salary_expectation: string | null;
  languages: string[];
  work_model: string | null;
  education_level: string | null;
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
    city: row.city,
    district: row.district,
    position: row.position,
    experienceYears: row.experience_years,
    salaryExpectation: row.salary_expectation ? Number(row.salary_expectation) : null,
    languages: row.languages ?? [],
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
  if (input.city !== undefined) row.city = input.city;
  if (input.district !== undefined) row.district = input.district;
  if (input.position !== undefined) row.position = input.position;
  if (input.experienceYears !== undefined) row.experience_years = input.experienceYears;
  if (input.salaryExpectation !== undefined) row.salary_expectation = input.salaryExpectation;
  if (input.languages !== undefined) row.languages = input.languages;
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
  city: string | null;
  district: string | null;
  industry: string | null;
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
    city: row.city,
    district: row.district,
    industry: row.industry,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toEmployerProfileRow(input: Partial<EmployerProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.companyId !== undefined) row.company_id = input.companyId;
  if (input.city !== undefined) row.city = input.city;
  if (input.district !== undefined) row.district = input.district;
  if (input.industry !== undefined) row.industry = input.industry;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}

export interface FounderProfileRow {
  profile_id: string;
  city: string | null;
  district: string | null;
  required_skills: string[];
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
    city: row.city,
    district: row.district,
    requiredSkills: row.required_skills ?? [],
    equityPercentage: row.equity_percentage ? Number(row.equity_percentage) : null,
    specialization: row.specialization,
    ideaTitle: row.idea_title,
    ideaDescription: row.idea_description,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toFounderProfileRow(input: Partial<FounderProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.city !== undefined) row.city = input.city;
  if (input.district !== undefined) row.district = input.district;
  if (input.requiredSkills !== undefined) row.required_skills = input.requiredSkills;
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
  workflow_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export function mapFranchiseProfileRow(row: FranchiseProfileRow): FranchiseProfile {
  const wf = mapWorkflowRow(row);
  return {
    profileId: row.profile_id as ProfileId,
    subcategorySlug: row.subcategory_slug as FranchiseSubcategorySlug | null,
    city: row.city,
    district: row.district,
    franchiseFee: row.franchise_fee ? Number(row.franchise_fee) : null,
    investmentAmount: row.investment_amount ? Number(row.investment_amount) : null,
    returnPeriodMonths: row.return_period_months,
    sector: row.sector,
    workflowStatus: wf.workflowStatus,
    onboardingStep: wf.onboardingStep,
    ...fromTimestamps(row),
  };
}

export function toFranchiseProfileRow(input: Partial<FranchiseProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = { profile_id: input.profileId };
  if (input.subcategorySlug !== undefined) row.subcategory_slug = input.subcategorySlug;
  if (input.city !== undefined) row.city = input.city;
  if (input.district !== undefined) row.district = input.district;
  if (input.franchiseFee !== undefined) row.franchise_fee = input.franchiseFee;
  if (input.investmentAmount !== undefined) row.investment_amount = input.investmentAmount;
  if (input.returnPeriodMonths !== undefined) row.return_period_months = input.returnPeriodMonths;
  if (input.sector !== undefined) row.sector = input.sector;
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus;
  if (input.onboardingStep !== undefined) row.onboarding_step = input.onboardingStep;
  return row;
}
