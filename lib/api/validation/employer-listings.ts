import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { externalContactSchema } from '@/lib/api/validation/common';

const remotePolicySchema = z.enum(['remote', 'hybrid', 'onsite']);

export const employerListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
  remotePolicy: remotePolicySchema.optional(),
});

export const employerJobListingCreateSchema = z
  .object({
    title: z.string().min(3).max(200),
    shortDescription: z.string().min(10).max(500),
    longDescription: z.string().min(20).max(10000).optional(),
    city: z.string().min(1).max(100).nullable().optional(),
    district: z.string().max(100).nullable().optional(),
    sector: z.string().max(100).nullable().optional(),
    remotePolicy: remotePolicySchema.nullable().optional(),
    experienceYearsMin: z.number().int().min(0).nullable().optional(),
    experienceYearsMax: z.number().int().min(0).nullable().optional(),
    educationLevel: z.string().max(100).nullable().optional(),
    employmentType: z.string().max(100).nullable().optional(),
    salaryMin: z.number().int().min(0).nullable().optional(),
    salaryMax: z.number().int().min(0).nullable().optional(),
  })
  .merge(externalContactSchema);

export const employerJobListingUpdateSchema = employerJobListingCreateSchema.partial();

export const employerListingIdParamSchema = z.object({
  id: uuidSchema,
});

export function parseEmployerListingCreate(body: unknown) {
  return employerJobListingCreateSchema.parse(body);
}

export function parseEmployerListingUpdate(body: unknown) {
  return employerJobListingUpdateSchema.parse(body);
}
