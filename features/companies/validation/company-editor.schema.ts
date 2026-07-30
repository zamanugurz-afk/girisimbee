import { z } from 'zod';
import { slugSchema } from '@/lib/domain/validation';
import type { CompanySize } from '@/features/companies/types/company.types';

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
  .refine((v) => !v || /linkedin\.com/i.test(v), 'LinkedIn URL linkedin.com içermelidir.')
  .or(z.literal(''))
  .optional()
  .transform((v) => (v ? v : undefined));

const twitterUrl = z
  .string()
  .trim()
  .url('Geçerli bir X URL girin.')
  .refine((v) => !v || /(twitter\.com|x\.com)/i.test(v), 'X URL twitter.com veya x.com içermelidir.')
  .or(z.literal(''))
  .optional()
  .transform((v) => (v ? v : undefined));

export const COMPANY_SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: '1-10', label: '1–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '201-500', label: '201–500' },
  { value: '500+', label: '500+' },
];

export const companyEditorSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter').max(200),
  slug: slugSchema,
  description: z.string().max(5000).optional().or(z.literal('')),
  industry: z.string().max(120).optional().or(z.literal('')),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional().or(z.literal('')),
  foundedYear: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  ),
  website: optionalUrl,
  linkedInUrl: linkedInUrl,
  twitterUrl: twitterUrl,
  city: z.string().max(100).optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  country: z.string().min(2).max(2).default('TR'),
  contactEmail: z.string().email('Geçerli e-posta girin.').optional().or(z.literal('')),
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
});

export type CompanyEditorForm = z.infer<typeof companyEditorSchema>;

export function suggestCompanySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
