import { z } from 'zod';
import { emailSchema, phoneSchema, timestampsSchema, softDeletableSchema, uuidSchema } from '@/lib/domain/validation';

export const domainUserRoleSchema = z.enum(['user', 'admin', 'moderator']);
export const userStatusSchema = z.enum(['pending', 'active', 'suspended', 'deactivated', 'deleted']);

export const userSchema = timestampsSchema.merge(softDeletableSchema).extend({
  id: uuidSchema,
  email: emailSchema,
  emailVerified: z.boolean(),
  phone: phoneSchema.nullable(),
  phoneVerified: z.boolean(),
  passwordHash: z.string().min(60).max(255),
  role: domainUserRoleSchema,
  status: userStatusSchema,
  lastLoginAt: z.string().datetime({ offset: true }).nullable(),
  locale: z.enum(['tr', 'en']).default('tr'),
  timezone: z.string().default('Europe/Istanbul'),
});

export const createUserSchema = z.object({
  email: emailSchema,
  passwordHash: z.string().min(60).max(255),
  phone: phoneSchema.nullable().optional(),
  locale: z.enum(['tr', 'en']).optional(),
  timezone: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  status: userStatusSchema.optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

/** @deprecated Use domainUserRoleSchema */
export const userRoleSchema = domainUserRoleSchema;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export type UserSchema = z.infer<typeof userSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
