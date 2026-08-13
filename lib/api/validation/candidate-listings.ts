import { z } from 'zod';

const careerExperienceSchema = z.object({
  id: z.string().min(1),
  sector: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  duration: z.string().trim().min(1).max(120),
  responsibilities: z.string().trim().min(20).max(2000),
  achievements: z.string().trim().max(2000).optional().default(''),
});

export const candidateListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
});

export const candidateListingCreateSchema = z
  .object({
    title: z.string().min(2).max(200),
    shortDescription: z.string().min(5).max(500),
    longDescription: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.string().min(40).max(10000).optional(),
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
    professionalSkills: z.string().max(1000).nullable().optional(),
    technicalSkills: z.string().max(1000).nullable().optional(),
    leadershipExperience: z.string().max(1000).nullable().optional(),
    tools: z.string().max(500).nullable().optional(),
    educationLevel: z.string().max(100).nullable().optional(),
    educationField: z.string().max(200).nullable().optional(),
    languages: z.string().max(500).nullable().optional(),
    certificates: z.string().max(500).nullable().optional(),
    preferredSectors: z.array(z.string()).nullable().optional(),
    preferredRoles: z
      .union([
        z.array(z.string()),
        z.string().transform((value) =>
          value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean),
        ),
      ])
      .nullable()
      .optional(),
    preferredCity: z.string().max(100).nullable().optional(),
    workplacePreference: z.string().max(100).nullable().optional(),
    availability: z.string().max(100).nullable().optional(),
    experiences: z.array(careerExperienceSchema).min(1).optional(),
    contactPhone: z.string().max(40).nullable().optional(),
    publishConsents: z.record(z.boolean()).nullable().optional(),
    /** Legacy — ignored for anonymous profiles */
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
