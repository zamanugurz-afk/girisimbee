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
  const preview: CareerCardInput = {
    variant: input.kind === 'hire' ? 'hire' : 'seeker',
    desiredRole: values.role || null,
    experienceLevel: getExperienceLevelLabel(values.experienceLevel) || values.experienceLevel || null,
    primarySector: values.sector || null,
    workType: values.workType || null,
    professionalSkills: values.professionalSkills || null,
    technicalSkills: values.technicalSkills || null,
    educationLevel: values.educationLevel || null,
    languages: values.languages || null,
    preferredCity: values.city || null,
    workplacePreference: values.workplacePreference || null,
    availability: values.availability || null,
    requiredResponsibilities: values.candidateTraits || null,
    displayName: null,
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
