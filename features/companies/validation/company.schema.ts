import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, slugSchema, urlSchema, metadataSchema } from '@/lib/domain/validation';

export const companySizeSchema = z.enum(['1-10', '11-50', '51-200', '201-500', '500+']);
export const companyStatusSchema = z.enum(['draft', 'active', 'suspended', 'archived', 'deleted']);

export const companySchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  ownerId: uuidSchema,
  name: z.string().min(2).max(200),
  slug: slugSchema,
  logoUrl: urlSchema,
  description: z.string().max(5000).nullable(),
  website: urlSchema,
  city: z.string().max(100).nullable(),
  country: z.string().default('TR'),
  industry: z.string().max(100).nullable(),
  employeeCount: companySizeSchema.nullable(),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).nullable(),
  isVerified: z.boolean(),
  status: companyStatusSchema,
  metadata: metadataSchema,
});

export const createCompanySchema = z.object({
  ownerId: uuidSchema,
  name: z.string().min(2).max(200),
  slug: slugSchema,
  description: z.string().max(5000).nullable().optional(),
  website: urlSchema,
  city: z.string().max(100).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
});

export type CompanySchema = z.infer<typeof companySchema>;
export type CreateCompanySchema = z.infer<typeof createCompanySchema>;
