import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from '@/lib/domain/validation';

const franchiseContactFields = {
  aciklama: z.string().max(5000).nullable().optional(),
  telefon: phoneSchema,
  eposta: emailSchema.nullable().optional(),
  website: urlSchema,
  onboardingStep: z.number().int().min(0).optional(),
};

export const franchiseBuyProfileSchema = z.object({
  subcategorySlug: z.literal('franchise-buy').optional(),
  adSoyad: z.string().max(200).nullable().optional(),
  sehir: z.string().max(100).nullable().optional(),
  ilce: z.string().max(100).nullable().optional(),
  sektor: z.string().max(100).nullable().optional(),
  minimumYatirim: z.number().int().min(0).nullable().optional(),
  maksimumYatirim: z.number().int().min(0).nullable().optional(),
  tercihEdilenLokasyon: z.string().max(200).nullable().optional(),
  isletmeTecrubesi: z.string().max(500).nullable().optional(),
  ...franchiseContactFields,
});

export const franchiseGiveProfileSchema = z.object({
  subcategorySlug: z.literal('franchise-give').optional(),
  markaAdi: z.string().max(200).nullable().optional(),
  sektor: z.string().max(100).nullable().optional(),
  sehir: z.string().max(100).nullable().optional(),
  franchiseBedeli: z.number().int().min(0).nullable().optional(),
  minimumSermaye: z.number().int().min(0).nullable().optional(),
  tahminiAylikCiro: z.number().int().min(0).nullable().optional(),
  subeSayisi: z.number().int().min(0).nullable().optional(),
  egitimDestegi: z.boolean().nullable().optional(),
  operasyonDestegi: z.boolean().nullable().optional(),
  pazarlamaDestegi: z.boolean().nullable().optional(),
  ...franchiseContactFields,
});

/** Merged schema for generic franchise profile upsert (all fields optional) */
export const franchiseProfileSchema = z
  .object({
    subcategorySlug: z.enum(['franchise-buy', 'franchise-give']).nullable().optional(),
  })
  .merge(franchiseBuyProfileSchema.omit({ subcategorySlug: true }))
  .merge(franchiseGiveProfileSchema.omit({ subcategorySlug: true }));

export function parseFranchiseProfileUpsert(body: unknown) {
  const hint = z
    .object({
      subcategorySlug: z.enum(['franchise-buy', 'franchise-give']).optional(),
      flow: z.enum(['buy', 'give']).optional(),
    })
    .passthrough()
    .safeParse(body);

  if (!hint.success) {
    return franchiseProfileSchema.parse(body);
  }

  const slug =
    hint.data.subcategorySlug ??
    (hint.data.flow === 'buy' ? 'franchise-buy' : hint.data.flow === 'give' ? 'franchise-give' : undefined);

  if (slug === 'franchise-buy') {
    return franchiseBuyProfileSchema.parse(body);
  }
  if (slug === 'franchise-give') {
    return franchiseGiveProfileSchema.parse(body);
  }

  return franchiseProfileSchema.parse(body);
}
