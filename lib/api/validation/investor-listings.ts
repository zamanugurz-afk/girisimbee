import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { externalContactSchema } from '@/lib/api/validation/common';

export const investorListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
  stage: z.string().optional(),
  minimumInvestment: z.coerce.number().int().min(0).optional(),
  maximumInvestment: z.coerce.number().int().min(0).optional(),
  module: z.enum(['thesis', 'startups']).optional(),
});

export const investorListingCreateSchema = z
  .object({
    title: z.string().min(3).max(200),
    shortDescription: z.string().min(10).max(500),
    longDescription: z.string().min(20).max(10000).optional(),
    city: z.string().min(1).max(100).nullable().optional(),
    district: z.string().max(100).nullable().optional(),
    sector: z.string().max(100).nullable().optional(),
    investorType: z.string().max(100).nullable().optional(),
    investmentStage: z.string().max(100).nullable().optional(),
    minimumInvestment: z.number().int().min(0).nullable().optional(),
    maximumInvestment: z.number().int().min(0).nullable().optional(),
    portfolioSize: z.number().int().min(0).nullable().optional(),
    sectors: z.array(z.string()).optional(),
  })
  .merge(externalContactSchema)
  .passthrough();

export const investorListingUpdateSchema = investorListingCreateSchema.partial();

export const investorListingIdParamSchema = z.object({
  id: uuidSchema,
});

export function parseInvestorListingCreate(body: unknown) {
  return investorListingCreateSchema.parse(body);
}

export function parseInvestorListingUpdate(body: unknown) {
  return investorListingUpdateSchema.parse(body);
}
