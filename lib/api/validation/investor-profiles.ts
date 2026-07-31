import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from '@/lib/domain/validation';
import { uuidSchema } from '@/lib/domain/validation';

export const investorModuleProfileUpsertSchema = z.object({
  fullName: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  sehir: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  ilce: z.string().max(100).nullable().optional(),
  investorType: z.string().max(100).nullable().optional(),
  sectors: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  investmentStages: z.array(z.string()).optional(),
  investmentStage: z.string().max(100).nullable().optional(),
  minimumInvestment: z.number().int().min(0).nullable().optional(),
  maximumInvestment: z.number().int().min(0).nullable().optional(),
  portfolioSize: z.number().int().min(0).nullable().optional(),
  linkedInUrl: urlSchema,
  website: urlSchema,
  biography: z.string().max(5000).nullable().optional(),
  telefon: phoneSchema,
  eposta: emailSchema.nullable().optional(),
  cities: z.array(z.string()).optional(),
  investmentHistory: z.array(z.record(z.unknown())).optional(),
  onboardingStep: z.number().int().min(0).optional(),
});

export function parseInvestorProfileUpsert(body: unknown) {
  return investorModuleProfileUpsertSchema.parse(body);
}
