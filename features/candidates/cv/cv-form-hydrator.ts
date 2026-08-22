import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';
import type { ListingFieldSchema } from '@/features/listings/types/listing-type.types';
import type { CoreListingFieldsInput } from '@/features/listings/types/listing.entity.types';
import { isForbiddenNameCandidate, formatTurkishTitleCase } from '@/features/candidates/cv/cv-name-extractor';
import { normalizeCvText } from '@/features/candidates/cv/cv-turkish-encoding';
import { resolveEnumOption } from '@/features/listings/form/build-dynamic-schema';
import {
  JOB_SECTOR_OPTIONS,
  EXPERIENCE_LEVELS,
  CAREER_EDUCATION_LEVELS,
  CAREER_PROFILE_GENDER_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import {
  getPositionsForSector,
  getSectorsForPosition,
  getAllTaxonomyPositions,
  MANUAL_OPTION,
  MANUAL_OPTION_SHORT,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { compressCareerSummaryMeaningfully } from '@/features/candidates/lib/career-summary';

export interface HydratedFormResult {
  nextCustomFields: Record<string, unknown>;
  nextCoreFields: Partial<CoreListingFieldsInput>;
  appliedKeys: string[];
}

/**
 * Single, pure, centralized helper that transforms a CV Profile Draft
 * into exact, validated, canonical form fields ready for immediate state assignment.
 */
export function buildHydratedCustomFieldsFromCvDraft(
  draft: CvProfileDraftResult,
  existingCustomFields: Record<string, unknown> = {},
  fieldSchema?: ListingFieldSchema,
): HydratedFormResult {
  const fv = draft.formValues;
  const nextCustomFields: Record<string, unknown> = { ...existingCustomFields };
  const nextCoreFields: Partial<CoreListingFieldsInput> = {};
  const appliedKeys: string[] = [];

  // Helper to mark key applied
  const applyField = (key: string, val: unknown) => {
    nextCustomFields[key] = val;
    appliedKeys.push(key);
  };

  // 1. Full Name (Strict validation against forbidden section headings)
  const rawFullName = fv.fullName ? normalizeCvText(fv.fullName) : '';
  const safeFullName =
    rawFullName && !isForbiddenNameCandidate(rawFullName)
      ? formatTurkishTitleCase(rawFullName)
      : '';
  applyField('fullName', safeFullName);

  // 2. Sector & Role Taxonomy Matching
  const rawRole = normalizeCvText(
    fv.desiredRole || fv.role || (fv.experiences && fv.experiences[0]?.role) || '',
  );
  const rawSector = normalizeCvText(
    fv.primarySector || fv.sector || (fv.experiences && fv.experiences[0]?.sector) || '',
  );

  // Resolve canonical sector & position
  let resolvedSector = resolveEnumOption(rawSector, JOB_SECTOR_OPTIONS) || '';

  // Check role first against all taxonomy positions to ensure coherent sector-role alignment
  if (rawRole) {
    const globalAllPositions = getAllTaxonomyPositions();
    const globalResolved = resolveEnumOption(rawRole, globalAllPositions);

    if (globalResolved && globalResolved !== MANUAL_OPTION && globalResolved !== MANUAL_OPTION_SHORT) {
      applyField('desiredRole', globalResolved);
      applyField('role', globalResolved);
      applyField('desiredRoleOther', '');

      // Inferred sector from canonical position ONLY if sector was not already resolved
      if (!resolvedSector) {
        const inferredSectors = getSectorsForPosition(globalResolved);
        if (inferredSectors && inferredSectors.length > 0) {
          resolvedSector = resolveEnumOption(inferredSectors[0], JOB_SECTOR_OPTIONS) || inferredSectors[0] || '';
        }
      }
    } else {
      // Freeform Custom Role
      applyField('desiredRole', 'Diğer');
      applyField('desiredRoleOther', rawRole);
    }
  }

  if (!resolvedSector && rawSector) {
    resolvedSector = resolveEnumOption(rawSector, JOB_SECTOR_OPTIONS) || '';
  }

  if (resolvedSector) {
    applyField('primarySector', resolvedSector);
    applyField('sector', resolvedSector);
  }

  // 3. Experience Level
  if (fv.experienceLevel) {
    const resolvedLevel = resolveEnumOption(fv.experienceLevel, EXPERIENCE_LEVELS);
    applyField('experienceLevel', resolvedLevel || fv.experienceLevel);
  }

  // 4. Residence Location (City & District)
  const rawCity = normalizeCvText(fv.residenceCity || fv.city || '');
  const rawDistrict = normalizeCvText(fv.residenceDistrict || '');

  let resolvedCity = '';
  if (rawCity) {
    resolvedCity = resolveEnumOption(rawCity, TURKISH_CITIES) || rawCity;
    applyField('residenceCity', resolvedCity);
    applyField('preferredCity', resolvedCity);
    applyField('city', resolvedCity);
    nextCoreFields.city = resolvedCity;
    nextCoreFields.location = resolvedCity;
  }

  if (rawDistrict) {
    const cityDistricts = resolvedCity ? getDistrictsForCity(resolvedCity) : [];
    const resolvedDistrict =
      cityDistricts.length > 0
        ? resolveEnumOption(rawDistrict, cityDistricts) || rawDistrict
        : rawDistrict;
    applyField('residenceDistrict', resolvedDistrict);
    applyField('preferredDistrict', resolvedDistrict);
    applyField('district', resolvedDistrict);
  }

  // 5. Work Experiences
  if (fv.experiences && fv.experiences.length > 0) {
    applyField('experiences', fv.experiences);
  }

  // 6. Skills & Tools
  if (fv.professionalSkillsList && fv.professionalSkillsList.length > 0) {
    applyField('professionalSkills', fv.professionalSkillsList.join(', '));
    applyField('professionalSkillsList', fv.professionalSkillsList);
  } else if (fv.professionalSkills) {
    applyField('professionalSkills', fv.professionalSkills);
  }

  if (fv.technicalSkillsList && fv.technicalSkillsList.length > 0) {
    applyField('technicalSkills', fv.technicalSkillsList.join(', '));
    applyField('technicalSkillsList', fv.technicalSkillsList);
  } else if (fv.technicalSkills) {
    applyField('technicalSkills', fv.technicalSkills);
  }

  if (fv.toolsList && fv.toolsList.length > 0) {
    applyField('tools', fv.toolsList.join(', '));
    applyField('toolsList', fv.toolsList);
  } else if (fv.tools) {
    applyField('tools', fv.tools);
  }

  // 7. Education, Languages & Certificates
  if (fv.educationLevel) {
    const resolvedEdu = resolveEnumOption(fv.educationLevel, CAREER_EDUCATION_LEVELS);
    applyField('educationLevel', resolvedEdu || fv.educationLevel);
  }
  if (fv.educationField) {
    applyField('educationField', fv.educationField);
  }
  if (fv.educationHistory && fv.educationHistory.length > 0) {
    applyField('educationHistory', fv.educationHistory);
  }
  if (fv.languages) {
    applyField('languages', fv.languages);
  }
  if (fv.certificates) {
    applyField('certificates', fv.certificates);
  }

  // 8. Demographics & Identity
  if (fv.profileGender) {
    const resolvedGender = resolveEnumOption(fv.profileGender, CAREER_PROFILE_GENDER_OPTIONS);
    applyField('profileGender', resolvedGender || fv.profileGender);
  }
  if (fv.birthDate) applyField('birthDate', fv.birthDate);
  if (fv.email) applyField('email', fv.email);
  if (fv.phone) applyField('phone', fv.phone);
  if (fv.linkedin) applyField('linkedin', fv.linkedin);
  if (fv.website) applyField('website', fv.website);
  if (fv.nationality) applyField('nationality', fv.nationality);
  if (fv.address) applyField('address', fv.address);

  // 9. Career Summary
  if (fv.candidateTraits) {
    const compressed = compressCareerSummaryMeaningfully(fv.candidateTraits, 1000);
    applyField('candidateTraits', compressed);
    nextCoreFields.longDescription = compressed;
    nextCoreFields.shortDescription = compressed ? compressed.slice(0, 160) : undefined;
  }

  // 10. File Metadata & Analysis Identity Version
  if (fv.cvFileName) applyField('cvFileName', fv.cvFileName);
  if (fv.cvDocumentId) applyField('cvDocumentId', fv.cvDocumentId);
  applyField('cvUploadedAt', fv.cvUploadedAt || new Date().toISOString());
  applyField('cvAnalysisVersion', '3.0.0');

  if (process.env.NODE_ENV !== 'production') {
    console.log('[CV-RUNTIME][07-HYDRATOR]', {
      fullName: nextCustomFields.fullName,
      primarySector: nextCustomFields.primarySector,
      desiredRole: nextCustomFields.desiredRole,
      desiredRoleOther: nextCustomFields.desiredRoleOther,
      experienceLevel: nextCustomFields.experienceLevel,
      residenceCity: nextCustomFields.residenceCity,
      residenceDistrict: nextCustomFields.residenceDistrict,
      experiences: (nextCustomFields.experiences as any[])?.length,
      educationHistory: (nextCustomFields.educationHistory as any[])?.length,
      cvFileName: nextCustomFields.cvFileName,
      appliedKeys,
    });
  }

  return {
    nextCustomFields,
    nextCoreFields,
    appliedKeys: Array.from(new Set(appliedKeys)),
  };
}
