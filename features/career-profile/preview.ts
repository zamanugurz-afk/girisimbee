import type { CareerCardInput } from '@/features/candidates/components/CareerProfilePreview';
import { maskDisplaySurname } from '@/features/candidates/lib/career-public-identity';
import { getExperienceLevelLabel } from '@/features/candidates/taxonomy/career-taxonomy';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import type { CareerFieldSource } from '@/features/career-profile/normalize';
import type { CareerListingKind } from '@/features/matching-engine/types';

const CONTACT_KEYS = [
  'contactPhone',
  'contactEmail',
  'contactWhatsapp',
  'contactWebsite',
  'phone',
  'email',
] as const;

export function toSafeCareerPreviewInput(input: {
  kind: CareerListingKind;
  source: CareerFieldSource;
  displayName?: string | null;
}): CareerCardInput {
  const values = valuesFromCareerSource(input.source);
  const cf = (input.source.customFields ?? {}) as Record<string, unknown>;

  const salaryDisplay =
    values.salary ||
    (values.salaryMin && values.salaryMax
      ? `${values.salaryMin.toLocaleString('tr-TR')} - ${values.salaryMax.toLocaleString('tr-TR')} TL`
      : values.salaryMin
        ? `${values.salaryMin.toLocaleString('tr-TR')} TL+`
        : null);

  const preview: CareerCardInput = {
    variant: input.kind === 'hire' ? 'hire' : 'seeker',
    desiredRole: values.role || (typeof cf.desiredRole === 'string' ? cf.desiredRole : null),
    experienceLevel: getExperienceLevelLabel(values.experienceLevel) || values.experienceLevel || null,
    primarySector: values.sector || (typeof cf.primarySector === 'string' ? cf.primarySector : null),
    preferredSectors: values.sectors && values.sectors.length > 0 ? values.sectors : null,
    workType: values.workType || null,
    professionalSkills: values.professionalSkills || null,
    technicalSkills: values.technicalSkills || null,
    tools: values.tools || (typeof cf.tools === 'string' ? cf.tools : null),
    educationLevel: values.educationLevel || null,
    educationField: values.educationField || null,
    educationHistory: values.educationHistory && values.educationHistory.length > 0 ? values.educationHistory : (Array.isArray(cf.educationHistory) ? cf.educationHistory as any : undefined),
    certificates: values.certificates || null,
    languages: values.languages || null,
    preferredCity: values.city || (typeof cf.preferredCity === 'string' ? cf.preferredCity : null),
    workplacePreference: values.workplacePreference || null,
    salaryExpectation: salaryDisplay,
    availability: values.availability || null,
    requiredResponsibilities: values.candidateTraits || null,
    requiredAchievements: values.requiredAchievements || null,
    longDescription: values.candidateTraits || (typeof cf.requiredResponsibilities === 'string' ? cf.requiredResponsibilities : null),
    experiences: values.experiences && values.experiences.length > 0 ? values.experiences : undefined,
    birthDate: values.birthDate || null,
    gender: values.profileGender || null,
    residenceCity: values.residenceCity || null,
    residenceDistrict: values.residenceDistrict || null,
    displayName: input.kind === 'hire' ? input.displayName || values.companyName || null : null,
    displayNameMasked: input.kind === 'seek' ? maskDisplaySurname(input.displayName) : null,
  };

  for (const key of CONTACT_KEYS) {
    delete (preview as Record<string, unknown>)[key];
  }

  return preview;
}

export function previewHasContactLeak(preview: CareerCardInput): boolean {
  const json = JSON.stringify(preview);
  return /contactPhone|contactEmail|contactWhatsapp|0555|@/.test(json);
}
