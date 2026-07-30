import { z } from 'zod';
import { slugSchema } from '@/lib/domain/validation';

const optionalUrl = z
  .string()
  .trim()
  .url('Geçerli bir URL girin.')
  .or(z.literal(''))
  .optional()
  .transform((v) => (v ? v : undefined));

const linkedInUrl = z
  .string()
  .trim()
  .url('Geçerli bir LinkedIn URL girin.')
  .refine(
    (v) => !v || /linkedin\.com/i.test(v),
    'LinkedIn URL linkedin.com içermelidir.',
  )
  .or(z.literal(''))
  .optional()
  .transform((v) => (v ? v : undefined));

const twitterUrl = z
  .string()
  .trim()
  .url('Geçerli bir Twitter/X URL girin.')
  .refine(
    (v) => !v || /(twitter\.com|x\.com)/i.test(v),
    'Twitter URL twitter.com veya x.com içermelidir.',
  )
  .or(z.literal(''))
  .optional()
  .transform((v) => (v ? v : undefined));

export const profileEditorSchema = z.object({
  displayName: z.string().min(2, 'En az 2 karakter').max(100, 'En fazla 100 karakter'),
  username: slugSchema,
  headline: z.string().max(160, 'En fazla 160 karakter').optional().or(z.literal('')),
  bio: z.string().max(2000, 'En fazla 2000 karakter').optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().min(2).max(2).default('TR'),
  companyName: z.string().max(200).optional().or(z.literal('')),
  position: z.string().max(120).optional().or(z.literal('')),
  website: optionalUrl,
  linkedInUrl: linkedInUrl,
  twitterUrl: twitterUrl,
  phone: z.string().max(30).optional().or(z.literal('')),
  avatarUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  emailVisible: z.boolean().default(false),
  phoneVisible: z.boolean().default(false),
  websiteVisible: z.boolean().default(true),
});

export type ProfileEditorForm = z.infer<typeof profileEditorSchema>;

export function suggestUsername(source: string): string {
  return source
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}
