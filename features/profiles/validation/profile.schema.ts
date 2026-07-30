import { z } from 'zod';
import { timestampsSchema, softDeletableSchema, uuidSchema, urlSchema, slugSchema } from '@/lib/domain/validation';

export const profileIntentSchema = z.enum([
  'seeking_investment', 'investing', 'seeking_job', 'hiring', 'seeking_partner', 'open',
]);
export const profileVisibilitySchema = z.enum(['public', 'connections', 'private']);
export const profileStatusSchema = z.enum(['draft', 'published', 'hidden', 'archived', 'deleted']);

export const profileSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  userId: uuidSchema,
  companyId: uuidSchema.nullable(),
  username: slugSchema.nullable(),
  displayName: z.string().min(2).max(100),
  headline: z.string().max(160).nullable(),
  bio: z.string().max(2000).nullable(),
  avatarUrl: urlSchema,
  coverUrl: urlSchema,
  location: z.string().max(200).nullable(),
  city: z.string().max(100).nullable(),
  country: z.string().default('TR'),
  companyName: z.string().max(200).nullable(),
  position: z.string().max(120).nullable(),
  website: urlSchema,
  linkedInUrl: urlSchema,
  twitterUrl: urlSchema,
  phone: z.string().max(30).nullable(),
  email: z.string().email().nullable(),
  emailVisible: z.boolean(),
  phoneVisible: z.boolean(),
  websiteVisible: z.boolean(),
  skills: z.array(z.string().max(50)).max(30),
  intents: z.array(profileIntentSchema),
  visibility: profileVisibilitySchema,
  status: profileStatusSchema,
  isVerified: z.boolean(),
  investorVerified: z.boolean(),
  completenessScore: z.number().int().min(0).max(100),
});

export const createProfileSchema = z.object({
  userId: uuidSchema,
  displayName: z.string().min(2).max(100),
  headline: z.string().max(160).nullable().optional(),
  companyId: uuidSchema.nullable().optional(),
  intents: z.array(profileIntentSchema).optional(),
});

export const updateProfileSchema = createProfileSchema.partial().omit({ userId: true });

export type ProfileSchema = z.infer<typeof profileSchema>;
export type CreateProfileSchema = z.infer<typeof createProfileSchema>;
