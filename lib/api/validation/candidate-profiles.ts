import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from '@/lib/domain/validation';

export const candidateModuleProfileUpsertSchema = z.object({
  fullName: z.string().max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  sehir: z.string().max(100).nullable().optional(),
  ilce: z.string().max(100).nullable().optional(),
  position: z.string().max(200).nullable().optional(),
  education: z.string().max(500).nullable().optional(),
  educationLevel: z.string().max(100).nullable().optional(),
  experienceYears: z.number().int().min(0).nullable().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  expectedSalary: z.number().int().min(0).nullable().optional(),
  salaryExpectation: z.number().int().min(0).nullable().optional(),
  remotePreference: z.string().max(50).nullable().optional(),
  linkedIn: urlSchema.nullable().optional(),
  portfolio: urlSchema.nullable().optional(),
  workModel: z.string().max(50).nullable().optional(),
  telefon: phoneSchema,
  eposta: emailSchema.nullable().optional(),
  whatsapp: phoneSchema,
  onboardingStep: z.number().int().min(0).optional(),
});

export function parseCandidateProfileUpsert(body: unknown) {
  const parsed = candidateModuleProfileUpsertSchema.parse(body);
  const { expectedSalary, ...rest } = parsed;
  return {
    ...rest,
    ...(expectedSalary !== undefined ? { salaryExpectation: expectedSalary } : {}),
  };
}
