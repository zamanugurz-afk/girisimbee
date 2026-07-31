import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from '@/lib/domain/validation';

export const founderModuleProfileUpsertSchema = z.object({
  fullName: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  sehir: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  ilce: z.string().max(100).nullable().optional(),
  founderType: z.string().max(100).nullable().optional(),
  startupStage: z.string().max(100).nullable().optional(),
  sectors: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
  offeredSkills: z.array(z.string()).optional(),
  experience: z.string().max(2000).nullable().optional(),
  biography: z.string().max(5000).nullable().optional(),
  linkedInUrl: urlSchema,
  website: urlSchema,
  telefon: phoneSchema,
  eposta: emailSchema.nullable().optional(),
  equityPercentage: z.number().min(0).max(100).nullable().optional(),
  specialization: z.string().max(200).nullable().optional(),
  ideaTitle: z.string().max(200).nullable().optional(),
  ideaDescription: z.string().max(5000).nullable().optional(),
  onboardingStep: z.number().int().min(0).optional(),
});

export function parseFounderProfileUpsert(body: unknown) {
  return founderModuleProfileUpsertSchema.parse(body);
}
