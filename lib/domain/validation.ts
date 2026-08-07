/**
 * Shared Zod primitives for all Girisimbee entity schemas.
 */
import { z } from 'zod';
import { EMAIL_REGEX, PHONE_REGEX, SLUG_REGEX, DOMAIN_DEFAULTS } from '@/lib/domain/base';

export const timestampSchema = z.string().datetime({ offset: true });
export const nullableTimestampSchema = timestampSchema.nullable();

export const uuidSchema = z.string().uuid();
export const slugSchema = z
  .string()
  .min(1)
  .max(DOMAIN_DEFAULTS.slugMaxLength)
  .regex(SLUG_REGEX, 'Geçerli slug formatı: küçük harf, rakam, tire.');

export const emailSchema = z
  .string()
  .email('Geçerli bir e-posta adresi girin.')
  .max(255)
  .regex(EMAIL_REGEX);

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, 'Geçerli bir telefon numarası girin.')
  .nullable()
  .optional();

export const urlSchema = z.string().url('Geçerli bir URL girin.').nullable().optional();
export const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli hex renk kodu.');

export const timestampsSchema = z.object({
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const softDeletableSchema = z.object({
  deletedAt: nullableTimestampSchema,
});

export const metadataSchema = z.record(z.unknown()).default({});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/** Parse and throw ValidationError-compatible message. */
export function parseOrThrow<T>(schema: z.ZodSchema<T>, input: unknown): T {
  return schema.parse(input);
}
