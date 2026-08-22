import { z } from 'zod';

const careerExperienceSchema = z
  .object({
    id: z.string().min(1),
    sector: z.string().trim().min(1).max(120),
    role: z.string().trim().min(1).max(120),
    roleOther: z.string().trim().max(120).optional().default(''),
    company: z.string().trim().max(120).optional().default(''),
    startMonth: z.number().int().min(1).max(12).nullable().optional(),
    startYear: z.number().int().min(1970).max(2100).nullable().optional(),
    endMonth: z.number().int().min(1).max(12).nullable().optional(),
    endYear: z.number().int().min(1970).max(2100).nullable().optional(),
    isCurrent: z.boolean().optional().default(false),
    duration: z.string().trim().max(120).optional().default(''),
    selectedResponsibilities: z.array(z.string()).optional(),
    responsibilitiesOther: z.string().trim().max(2000).optional().default(''),
    responsibilities: z.string().trim().max(2000).optional().default(''),
    selectedAchievements: z.array(z.string()).optional(),
    achievementsOther: z.string().trim().max(2000).optional().default(''),
    achievementMetric: z.string().trim().max(120).optional().default(''),
    achievements: z.string().trim().max(2000).optional().default(''),
  })
  .superRefine((val, ctx) => {
    const hasDates = Boolean(val.startMonth && val.startYear);
    if (!hasDates && !val.duration.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Deneyim tarihi veya süre zorunludur.',
        path: ['startMonth'],
      });
    }
    const responsibilities = (val.responsibilities || val.responsibilitiesOther || '').trim();
    const selected = (val.selectedResponsibilities ?? []).filter(Boolean);
    if (selected.length === 0 && responsibilities.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Temel sorumluluklar en az 20 karakter olmalıdır.',
        path: ['responsibilities'],
      });
    }
  });

export const candidateListingBrowseQuerySchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
});

export const candidateListingCreateSchema = z
  .object({
    title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır.').max(200, 'Başlık en fazla 200 karakter olabilir.'),
    shortDescription: z.string().min(5, 'Kısa açıklama en az 5 karakter olmalıdır.').max(500, 'Kısa açıklama en fazla 500 karakter olabilir.'),
    longDescription: z.preprocess(
      (val) => (val === '' || val === null ? undefined : val),
      z.string().min(40, 'Kariyer özeti en az 40 karakter olmalıdır.').max(10000, 'Kariyer özeti en fazla 10000 karakter olabilir.').optional(),
    ),
    city: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().min(1).max(100).nullable().optional(),
    ),
    district: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().max(100).nullable().optional(),
    ),
    primarySector: z.string().max(120).nullable().optional(),
    desiredRole: z.string().max(200).nullable().optional(),
    experienceLevel: z.string().max(100).nullable().optional(),
    salaryExpectation: z.string().max(100).nullable().optional(),
    workType: z.string().max(100).nullable().optional(),
    professionalSkills: z.string().max(4000, 'Mesleki yetkinlikler en fazla 4000 karakter olabilir.').nullable().optional(),
    technicalSkills: z.string().max(4000, 'Teknik yetkinlikler en fazla 4000 karakter olabilir.').nullable().optional(),
    leadershipExperience: z.string().max(4000, 'Yönetim/liderlik deneyimi en fazla 4000 karakter olabilir.').nullable().optional(),
    tools: z.string().max(4000, 'Kullanılan araçlar en fazla 4000 karakter olabilir.').nullable().optional(),
    educationLevel: z.string().max(100).nullable().optional(),
    educationField: z.string().max(500, 'Eğitim alanı en fazla 500 karakter olabilir.').nullable().optional(),
    languages: z.string().max(2000, 'Yabancı diller en fazla 2000 karakter olabilir.').nullable().optional(),
    certificates: z.string().max(2000, 'Sertifikalar en fazla 2000 karakter olabilir.').nullable().optional(),
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
    profileGender: z.string().max(40).nullable().optional(),
    birthDate: z.string().max(32).nullable().optional(),
    residenceCity: z.string().max(100).nullable().optional(),
    residenceDistrict: z.string().max(100).nullable().optional(),
    careerAiAnalysis: z.record(z.unknown()).nullable().optional(),
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
