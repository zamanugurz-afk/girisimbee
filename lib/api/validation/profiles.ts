import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';

export const entrepreneurProfileSchema = z.object({
  startupName: z.string().max(200).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  investmentAmount: z.number().int().min(0).nullable().optional(),
  valuation: z.number().int().min(0).nullable().optional(),
  equityPercentage: z.number().min(0).max(100).nullable().optional(),
  companyStage: z.string().max(100).nullable().optional(),
  teamSize: z.number().int().min(0).nullable().optional(),
  monthlyRevenue: z.number().int().min(0).nullable().optional(),
  website: z.string().url().nullable().optional(),
  pitchDeckDocumentId: uuidSchema.nullable().optional(),
  onboardingStep: z.number().int().min(0).optional(),
});

export const investorProfileSchema = z.object({
  minimumInvestment: z.number().int().min(0).nullable().optional(),
  maximumInvestment: z.number().int().min(0).nullable().optional(),
  investmentStages: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
  investmentHistory: z.array(z.record(z.unknown())).optional(),
  onboardingStep: z.number().int().min(0).optional(),
});

export const candidateProfileSchema = z.object({
  city: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  position: z.string().max(200).nullable().optional(),
  experienceYears: z.number().int().min(0).nullable().optional(),
  salaryExpectation: z.number().int().min(0).nullable().optional(),
  languages: z.array(z.string()).optional(),
  workModel: z.string().max(50).nullable().optional(),
  educationLevel: z.string().max(100).nullable().optional(),
  cvDocumentId: uuidSchema.nullable().optional(),
  onboardingStep: z.number().int().min(0).optional(),
});

export const employerProfileSchema = z.object({
  companyId: uuidSchema.nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  onboardingStep: z.number().int().min(0).optional(),
});

import { founderModuleProfileUpsertSchema } from '@/lib/api/validation/founder-profiles';

export const founderProfileSchema = founderModuleProfileUpsertSchema;

import { franchiseProfileSchema } from '@/lib/api/validation/franchise-profiles';

export {
  franchiseProfileSchema,
  franchiseBuyProfileSchema,
  franchiseGiveProfileSchema,
  parseFranchiseProfileUpsert,
} from '@/lib/api/validation/franchise-profiles';

export const profileActivateSchema = z.object({
  flow: z.enum(['buy', 'give']).optional(),
});

export const profileUpsertSchemas = {
  entrepreneurs: entrepreneurProfileSchema,
  investors: investorProfileSchema,
  candidates: candidateProfileSchema,
  employers: employerProfileSchema,
  founders: founderProfileSchema,
  franchise: franchiseProfileSchema,
} as const;
