/**
 * Shared customField keys for future İş Arıyorum ↔ İşe Alıyorum matching.
 * Same taxonomy values on both cards; hire is the employer's need, seeker is the candidate profile.
 */
export const JOB_MATCH_FIELD_KEYS = [
  'primarySector',
  'desiredRole',
  'experienceLevel',
  'workType',
  'workplacePreference',
  'preferredCity',
  'professionalSkills',
  'technicalSkills',
  'tools',
  'educationLevel',
  'educationField',
  'languages',
  'certificates',
  'availability',
] as const;

export type JobMatchFieldKey = (typeof JOB_MATCH_FIELD_KEYS)[number];

/** Same meaning, different stored keys — map these when matching. */
export const JOB_MATCH_ALIASES = {
  salary: { seeker: 'salaryExpectation', hire: 'salaryRange' },
  duties: { seeker: 'experiences.responsibilities', hire: 'requiredResponsibilities' },
  achievements: { seeker: 'experiences.achievements', hire: 'requiredAchievements' },
  relatedOccupations: { seeker: 'desiredRole', hire: 'desiredRole' },
} as const;
