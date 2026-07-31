import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, slugSchema, metadataSchema } from '@/lib/domain/validation';

export const listingStatusSchema = z.enum([
  'draft', 'pending_review', 'published', 'paused', 'expired', 'archived', 'rejected', 'sold', 'deleted',
]);
export const remotePolicySchema = z.enum(['onsite', 'hybrid', 'remote']);

export const investmentDetailsSchema = z.object({
  amountSought: z.number().positive(),
  currency: z.string().length(3),
  equityOffered: z.string().nullable(),
  stage: z.string().nullable(),
  minInvestment: z.number().positive().nullable(),
  maxInvestment: z.number().positive().nullable(),
}).nullable();

export const jobDetailsSchema = z.object({
  salaryMin: z.number().positive().nullable(),
  salaryMax: z.number().positive().nullable(),
  currency: z.string().length(3),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  experienceLevel: z.string().nullable(),
  remotePolicy: remotePolicySchema,
}).nullable();

export const partnerDetailsSchema = z.object({
  partnerType: z.enum(['technical', 'business', 'co_founder', 'advisor']),
  equityOffered: z.string().nullable(),
  commitment: z.string().nullable(),
}).nullable();

export const listingSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  slug: slugSchema,
  ownerId: uuidSchema,
  companyId: uuidSchema.nullable(),
  categoryId: uuidSchema,
  listingTypeId: uuidSchema,
  title: z.string().min(5).max(200),
  shortDescription: z.string().min(20).max(500),
  longDescription: z.string().max(10000),
  status: listingStatusSchema,
  location: z.string().max(200).nullable(),
  city: z.string().max(100).nullable(),
  country: z.string().default('TR'),
  remotePolicy: remotePolicySchema.nullable(),
  investmentDetails: investmentDetailsSchema,
  jobDetails: jobDetailsSchema,
  partnerDetails: partnerDetailsSchema,
  customFields: metadataSchema,
  viewCount: z.number().int().min(0),
  interestedCount: z.number().int().min(0),
  applicationCount: z.number().int().min(0),
  isVerified: z.boolean(),
  isFeatured: z.boolean(),
  isUrgent: z.boolean(),
  featuredUntil: z.string().datetime({ offset: true }).nullable(),
  urgentUntil: z.string().datetime({ offset: true }).nullable(),
  publishedAt: z.string().datetime({ offset: true }).nullable(),
  expiresAt: z.string().datetime({ offset: true }).nullable(),
  rejectedReason: z.string().max(1000).nullable(),
});

export const createListingSchema = z.object({
  ownerId: uuidSchema,
  categoryId: uuidSchema,
  listingTypeId: uuidSchema,
  title: z.string().min(5).max(200),
  shortDescription: z.string().min(20).max(500),
  companyId: uuidSchema.nullable().optional(),
  longDescription: z.string().max(10000).optional(),
  location: z.string().max(200).nullable().optional(),
  investmentDetails: investmentDetailsSchema.optional(),
  jobDetails: jobDetailsSchema.optional(),
  partnerDetails: partnerDetailsSchema.optional(),
  customFields: metadataSchema.optional(),
});

export type ListingSchema = z.infer<typeof listingSchema>;
export type CreateListingSchema = z.infer<typeof createListingSchema>;
