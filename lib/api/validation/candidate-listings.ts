import { z } from 'zod';

export const candidateListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
});

export const candidateListingCreateSchema = z
  .object({
    title: z.string().min(3).max(200),
    shortDescription: z.string().min(10).max(500),
    longDescription: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.string().min(20).max(10000).optional(),
    ),
    city: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().min(1).max(100).nullable().optional(),
    ),
    district: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().max(100).nullable().optional(),
    ),
    desiredRole: z.string().max(200).nullable().optional(),
    experienceLevel: z.string().max(100).nullable().optional(),
    salaryExpectation: z.string().max(100).nullable().optional(),
    workType: z.string().max(100).nullable().optional(),
    cvUrl: z.string().max(512).nullable().optional(),
    kvkkConsents: z
      .object({
        cvSharing: z.boolean(),
        thirdPartySharing: z.boolean(),
        employerSharing: z.boolean(),
        clarificationText: z.boolean(),
        explicitConsent: z.boolean(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export function parseCandidateListingCreate(body: unknown) {
  return candidateListingCreateSchema.parse(body);
}
