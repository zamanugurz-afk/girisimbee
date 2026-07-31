import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from '@/lib/domain/validation';

export const employerModuleProfileUpsertSchema = z.object({
  companyName: z.string().max(200).nullable().optional(),
  sehir: z.string().max(100).nullable().optional(),
  ilce: z.string().max(100).nullable().optional(),
  sektor: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  companySize: z.string().max(100).nullable().optional(),
  aciklama: z.string().max(5000).nullable().optional(),
  telefon: phoneSchema,
  eposta: emailSchema.nullable().optional(),
  website: urlSchema,
  whatsapp: phoneSchema,
  onboardingStep: z.number().int().min(0).optional(),
});

export function parseEmployerProfileUpsert(body: unknown) {
  return employerModuleProfileUpsertSchema.parse(body);
}
