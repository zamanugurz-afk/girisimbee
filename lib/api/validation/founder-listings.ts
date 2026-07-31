import { z } from 'zod';
import { uuidSchema } from '@/lib/domain/validation';
import { externalContactSchema } from '@/lib/api/validation/common';

export const founderListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
  stage: z.string().optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
});

export const founderListingCreateSchema = z
  .object({
    title: z.string().min(3).max(200),
    shortDescription: z.string().min(10).max(500),
    longDescription: z.string().min(20).max(10000).optional(),
    city: z.string().min(1).max(100).nullable().optional(),
    district: z.string().max(100).nullable().optional(),
    sector: z.string().max(100).nullable().optional(),
    founderType: z.string().max(100).nullable().optional(),
    startupStage: z.string().max(100).nullable().optional(),
    requiredSkills: z.array(z.string()).optional(),
    offeredSkills: z.array(z.string()).optional(),
    sectors: z.array(z.string()).optional(),
  })
  .merge(externalContactSchema);

export const founderListingUpdateSchema = founderListingCreateSchema.partial();

export const founderListingIdParamSchema = z.object({
  id: uuidSchema,
});

export function parseFounderListingCreate(body: unknown) {
  return founderListingCreateSchema.parse(body);
}

export function parseFounderListingUpdate(body: unknown) {
  return founderListingUpdateSchema.parse(body);
}

export function parseFounderListingBrowseQuery(params: Record<string, string | undefined>) {
  const parsed = founderListingBrowseQuerySchema.parse(params);
  const skills = parsed.skills
    ? Array.isArray(parsed.skills)
      ? parsed.skills
      : parsed.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;
  return { ...parsed, skills };
}
