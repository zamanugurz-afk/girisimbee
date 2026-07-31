import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from '@/lib/domain/validation';
import { uuidSchema } from '@/lib/domain/validation';

export const entrepreneurModuleProfileUpsertSchema = z.object({
  startupName: z.string().max(200).nullable().optional(),
  founderName: z.string().max(200).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  sehir: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  sektor: z.string().max(100).nullable().optional(),
  investmentAmount: z.number().int().min(0).nullable().optional(),
  investmentTarget: z.number().int().min(0).nullable().optional(),
  valuation: z.number().int().min(0).nullable().optional(),
  equityPercentage: z.number().min(0).max(100).nullable().optional(),
  companyStage: z.string().max(100).nullable().optional(),
  investmentStage: z.string().max(100).nullable().optional(),
  teamSize: z.number().int().min(0).nullable().optional(),
  monthlyRevenue: z.number().int().min(0).nullable().optional(),
  businessModel: z.string().max(500).nullable().optional(),
  website: urlSchema,
  telefon: phoneSchema,
  eposta: emailSchema.nullable().optional(),
  pitchDeckDocumentId: uuidSchema.nullable().optional(),
  onboardingStep: z.number().int().min(0).optional(),
});

export function parseEntrepreneurProfileUpsert(body: unknown) {
  return entrepreneurModuleProfileUpsertSchema.parse(body);
}
