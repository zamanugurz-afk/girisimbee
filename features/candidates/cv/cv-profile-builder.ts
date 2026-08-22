import {
  CV_EXTRACTION_VERSION,
  CAREER_TAXONOMY_VERSION,
  CV_PARSER_VERSION,
  type CanonicalTaxonomyMappingResult,
  type CvProfileDraftResult,
} from '@/features/candidates/cv/cv.types';
import type { CareerProfileFormValues } from '@/features/career-profile/types';
import { repairTurkishEncodingAndMojibake } from '@/features/candidates/cv/cv-turkish-encoding';
import { compressCareerSummaryMeaningfully } from '@/features/candidates/lib/career-summary';

/**
 * Builds a safe, normalized CareerProfileFormValues draft from canonical CV extraction results.
 * Strictly leaves user preference fields (salary, availability, target role preference, work model)
 * flagged as requiring explicit confirmation.
 */
export function buildProfileDraftFromCanonicalResult(
  canonical: CanonicalTaxonomyMappingResult,
  cvFileName?: string,
  cvDocumentId?: string,
): CvProfileDraftResult {
  const cvFilledFieldKeys: string[] = [];

  // Calculate experience level from total years
  const sumYears = canonical.experiences.reduce((sum, exp) => {
    const yrs = parseInt(exp.duration, 10) || 1;
    return sum + yrs;
  }, 0);

  const summaryMatch = (canonical.summary || '').match(/(\d{1,2})\s*yıl/i);
  const summaryYears = summaryMatch ? parseInt(summaryMatch[1], 10) : 0;
  const totalYears = Math.max(sumYears, summaryYears);

  let experienceLevel = 'Uzman';
  const roleText = `${canonical.primaryRole || ''} ${canonical.experiences.map((e) => e.role).join(' ')}`.toLowerCase();
  if (roleText.includes('direktör') || roleText.includes('director')) {
    experienceLevel = 'Direktör';
  } else if (roleText.includes('müdür') || roleText.includes('manager') || roleText.includes('head of') || totalYears >= 10) {
    experienceLevel = 'Yönetici';
  } else if (roleText.includes('lider') || roleText.includes('lead') || roleText.includes('şef') || totalYears >= 7) {
    experienceLevel = 'Takım Lideri';
  } else if (totalYears >= 5) {
    experienceLevel = 'Senior';
  } else if (totalYears >= 3) {
    experienceLevel = 'Mid';
  } else if (totalYears >= 1) {
    experienceLevel = 'Junior';
  } else if (totalYears === 0) {
    experienceLevel = 'Yeni Mezun';
  }

  const formValues: Partial<CareerProfileFormValues> = {
    // 1. Role & Sector (extracted from historical CV data)
    role: canonical.primaryRole || '',
    desiredRole: canonical.primaryRole || '',
    roles: canonical.matchedRoles.length > 0 ? canonical.matchedRoles : canonical.primaryRole ? [canonical.primaryRole] : [],
    sector: canonical.primarySector || '',
    primarySector: canonical.primarySector || '',
    sectors: canonical.matchedSectors.length > 0 ? canonical.matchedSectors : canonical.primarySector ? [canonical.primarySector] : [],

    // 2. Experience History & Level
    experienceLevel,
    experiences: canonical.experiences.map((exp) => ({
      ...exp,
      role: repairTurkishEncodingAndMojibake(exp.role),
      sector: repairTurkishEncodingAndMojibake(exp.sector),
      company: repairTurkishEncodingAndMojibake(exp.company),
      responsibilities: repairTurkishEncodingAndMojibake(exp.responsibilities),
      achievements: repairTurkishEncodingAndMojibake(exp.achievements),
    })),

    // 3. Skills & Tools
    professionalSkills: repairTurkishEncodingAndMojibake([...new Set(canonical.professionalSkills.map((s) => s.trim()))].join(', ')),
    professionalSkillsList: [...new Set(canonical.professionalSkills.map((s) => repairTurkishEncodingAndMojibake(s.trim())))],
    technicalSkills: repairTurkishEncodingAndMojibake([...new Set(canonical.technicalSkills.map((s) => s.trim()))].join(', ')),
    technicalSkillsList: [...new Set(canonical.technicalSkills.map((s) => repairTurkishEncodingAndMojibake(s.trim())))],
    tools: repairTurkishEncodingAndMojibake([...new Set(canonical.tools.map((t) => t.trim()))].join(', ')),
    toolsList: [...new Set(canonical.tools.map((t) => repairTurkishEncodingAndMojibake(t.trim())))],

    // 4. Education, Languages & Certificates
    educationLevel: canonical.educationLevel || 'Lisans',
    educationField: repairTurkishEncodingAndMojibake(canonical.educationField || ''),
    educationHistory: canonical.educationList.map((edu) => ({
      ...edu,
      school: repairTurkishEncodingAndMojibake(edu.school || ''),
      field: repairTurkishEncodingAndMojibake(edu.field || ''),
      level: repairTurkishEncodingAndMojibake(edu.level || ''),
    })),
    languages: repairTurkishEncodingAndMojibake(canonical.languages || ''),
    certificates: repairTurkishEncodingAndMojibake(canonical.certificates || ''),

    // 5. Residence Location (from historical location)
    residenceCity: repairTurkishEncodingAndMojibake(canonical.residenceCity || ''),
    city: repairTurkishEncodingAndMojibake(canonical.residenceCity || ''),
    residenceDistrict: repairTurkishEncodingAndMojibake(canonical.residenceDistrict || ''),

    // 6. Career Summary (grounded synthesis)
    candidateTraits: compressCareerSummaryMeaningfully(
      repairTurkishEncodingAndMojibake(canonical.summary || ''),
      1000,
    ),

    // 6.5. Demographics & Identity (from CV)
    fullName: repairTurkishEncodingAndMojibake(canonical.fullName || ''),
    profileGender: canonical.gender || '',
    birthDate: canonical.birthDate || '',
    email: canonical.email || '',
    phone: canonical.phone || '',
    linkedin: canonical.linkedin || '',
    website: canonical.website || '',
    nationality: canonical.nationality || '',
    address: canonical.address || '',

    // 7. CV File Metadata
    cvFileName,
    cvDocumentId,
    cvUploadedAt: new Date().toISOString(),

    // 8. PREFERENCE FIELDS — Deliberately left unforced / empty for user confirmation
    workType: '',
    workplacePreference: '',
    preferredDistrict: '',
    availability: '',
    salaryMin: null,
    salaryMax: null,
    salary: '',
  };

  // Record filled keys
  if (formValues.fullName) cvFilledFieldKeys.push('fullName');
  if (formValues.role) cvFilledFieldKeys.push('role', 'roles');
  if (formValues.sector) cvFilledFieldKeys.push('sector', 'sectors');
  if (formValues.experiences && formValues.experiences.length > 0) cvFilledFieldKeys.push('experiences');
  if (formValues.experienceLevel) cvFilledFieldKeys.push('experienceLevel');
  if (formValues.professionalSkills) cvFilledFieldKeys.push('professionalSkills');
  if (formValues.technicalSkills) cvFilledFieldKeys.push('technicalSkills');
  if (formValues.tools) cvFilledFieldKeys.push('tools');
  if (formValues.educationLevel) cvFilledFieldKeys.push('educationLevel');
  if (formValues.educationField) cvFilledFieldKeys.push('educationField');
  if (formValues.languages) cvFilledFieldKeys.push('languages');
  if (formValues.certificates) cvFilledFieldKeys.push('certificates');
  if (formValues.residenceCity) cvFilledFieldKeys.push('residenceCity', 'city');
  if (formValues.residenceDistrict) cvFilledFieldKeys.push('residenceDistrict');
  if (formValues.profileGender) cvFilledFieldKeys.push('profileGender');
  if (formValues.birthDate) cvFilledFieldKeys.push('birthDate');
  if (formValues.email) cvFilledFieldKeys.push('email');
  if (formValues.phone) cvFilledFieldKeys.push('phone');
  if (formValues.linkedin) cvFilledFieldKeys.push('linkedin');
  if (formValues.website) cvFilledFieldKeys.push('website');
  if (formValues.nationality) cvFilledFieldKeys.push('nationality');
  if (formValues.address) cvFilledFieldKeys.push('address');
  if (formValues.candidateTraits) cvFilledFieldKeys.push('candidateTraits');

  // Explicit unconfirmed preference keys
  const unconfirmedPreferenceKeys = [
    'desiredRole',
    'preferredRoles',
    'preferredSectors',
    'preferredCity',
    'preferredDistrict',
    'workType',
    'workplacePreference',
    'salaryMin',
    'salaryMax',
    'availability',
  ];

  const educationCount = canonical.educationList?.length || (canonical.educationLevel ? 1 : 0);

  const categoriesFound = {
    experiences: canonical.experiences.length,
    roles: canonical.matchedRoles.length || (canonical.primaryRole ? 1 : 0),
    sectors: canonical.matchedSectors.length || (canonical.primarySector ? 1 : 0),
    skills: canonical.professionalSkills.length + canonical.technicalSkills.length,
    tools: canonical.tools.length,
    education: educationCount,
    languages: canonical.languages ? canonical.languages.split(',').length : 0,
    certificates: canonical.certificates ? canonical.certificates.split(',').length : 0,
    locations: canonical.residenceCity ? 1 : 0,
    summary: Boolean(canonical.summary),
  };

  const extractedCount =
    categoriesFound.experiences +
    categoriesFound.roles +
    categoriesFound.sectors +
    categoriesFound.skills +
    categoriesFound.tools +
    categoriesFound.education +
    categoriesFound.languages +
    categoriesFound.certificates +
    categoriesFound.locations +
    (categoriesFound.summary ? 1 : 0);

  return {
    formValues,
    cvFilledFieldKeys: [...new Set(cvFilledFieldKeys)],
    unconfirmedPreferenceKeys,
    ambiguousItems: canonical.ambiguousItems,
    summary: canonical.summary,
    extractedCount,
    categoriesFound,
    metrics: {
      aiCallCount: 0,
      aiCalled: false,
      aiSkipped: true,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      piiMaskedCount: 0,
      deterministicFieldsCount: extractedCount,
      aiExtractedFieldsCount: 0,
      taxonomyMappedCount: categoriesFound.roles + categoriesFound.sectors,
      ambiguousCount: canonical.ambiguousItems.length,
      cacheHit: false,
      extractionVersion: CV_EXTRACTION_VERSION,
      taxonomyVersion: CAREER_TAXONOMY_VERSION,
      parserVersion: CV_PARSER_VERSION,
      coverageScore: 100,
      confidenceScores: {},
    },
  };
}
