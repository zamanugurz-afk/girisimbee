/**
 * GİRİŞİMBEE — CANONICAL CAREER PROFILE & PROVENANCE CONTRACT
 * 
 * Defines the strict production contract separating:
 * RAW CV -> EXTRACTED EVIDENCE -> CANONICAL CV DRAFT -> MASTER CAREER PROFILE ->
 * USER CONFIRMED PROFILE -> JOB-SPECIFIC APPLICATION PROFILE
 * 
 * CORE INVARIANTS:
 * 1. CV evidence NEVER silently overwrites USER overrides.
 * 2. Application overrides NEVER mutate Master Career Profile.
 * 3. New CV extractions NEVER mutate past submitted Applications.
 * 4. User data & evidence is strictly isolated per userId (zero cross-user leakage).
 * 5. Evidence-less fields can never be marked as CONFIRMED without user verification.
 * 6. Application submissions create immutable historical snapshots.
 */

import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

export type FieldProvenanceSource = 'CV' | 'USER' | 'NORMALIZED' | 'TAXONOMY';

export type FieldResolutionStatus = 'RESOLVED' | 'AMBIGUOUS' | 'NOT_FOUND' | 'CONFLICT';

export type CareerIntentMode = 'seek' | 'hire' | 'partner';

export interface ProvenanceField<T> {
  value: T;
  originalEvidenceValue?: T;
  source: FieldProvenanceSource;
  confidence: number;
  evidenceSnippet?: string;
  evidenceId?: string;
  editedAt?: string;
  isConfirmed: boolean;
  status: FieldResolutionStatus;
}

export interface CareerEducationItem {
  id?: string;
  level: string;
  field?: string;
  school?: string;
  graduationYear?: number | null;
  source?: FieldProvenanceSource;
}

export interface CareerPreferences {
  workType?: string; // Tam Zamanlı, Yarı Zamanlı, Staj, vb.
  workplacePreference?: string; // Hibrit, Uzaktan, Ofiste
  preferredCity?: string;
  preferredDistrict?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  availability?: string; // Hemen, 2 hafta, 1 ay
  willingToRelocate?: boolean;
}

/**
 * 1. Single Master Career Profile
 * Contains all core professional, education, experience, and skill evidence.
 */
export interface MasterCareerProfile {
  id: string;
  userId: string;
  fullName: ProvenanceField<string>;
  email: ProvenanceField<string>;
  phone: ProvenanceField<string>;
  residenceCity: ProvenanceField<string>;
  residenceDistrict?: ProvenanceField<string>;
  primaryRole: ProvenanceField<string>;
  desiredRoleOther?: ProvenanceField<string>;
  primarySector: ProvenanceField<string>;
  experienceLevel: ProvenanceField<string>;
  summary?: ProvenanceField<string>;
  experiences: CareerExperience[];
  educationList: CareerEducationItem[];
  skills: ProvenanceField<string[]>;
  tools: ProvenanceField<string[]>;
  languages: ProvenanceField<string[]>;
  certificates: ProvenanceField<string[]>;
  preferences: CareerPreferences;
  cvDocumentId?: string;
  cvUploadedAt?: string;
  activeIntentMode: CareerIntentMode;
  lastConfirmedAt?: string;
  version: number;
}

/**
 * 2. Intent Projections over Master Profile
 */

// A. Job Seeking Projection
export interface JobSeekingProjection {
  userId: string;
  targetRole: string;
  targetRoleOther?: string;
  targetSector: string;
  experienceLevel: string;
  preferredLocation: { city?: string; district?: string };
  salaryExpectation?: { min?: number | null; max?: number | null; currency?: string };
  workType?: string;
  workplacePreference?: string;
  availability?: string;
  highlightedSkills: string[];
  experiences: CareerExperience[];
  educationList: CareerEducationItem[];
}

// B. Hiring Projection
export interface HiringProjection {
  userId: string;
  companyName: string;
  hiringRoles: string[];
  targetSectors: string[];
  requiredSeniority: string;
  location: { city?: string; district?: string };
  requiredSkills: string[];
  workplacePreference?: string;
  employmentType?: string;
}

// C. Partnership Projection
export interface PartnershipProjection {
  userId: string;
  founderName: string;
  expertiseAreas: string[];
  industries: string[];
  startupStage?: string;
  businessModel?: string;
  partnershipType?: string;
  capitalContribution?: number | null;
  equityOffered?: number | null;
  availability?: string;
}

/**
 * 3. Job Posting Requirements Model
 */
export interface JobPostingRequirement {
  id: string;
  employerId: string;
  title: string;
  sector: string;
  requiredRole: string;
  requiredSeniority: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  requiredTools?: string[];
  requiredEducationLevel?: string;
  requiredEducationField?: string;
  location: { city: string; district?: string };
  workType: string;
  workplacePreference: string;
  minExperienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  requiredLanguages?: string[];
}

/**
 * 4. Deterministic Job Match Breakdown
 */
export interface DimensionMatchScore {
  score: number; // 0 - 100
  weight: number; // e.g. 0.25
  matchedItems: string[];
  missingItems: string[];
  explanation: string;
}

export interface JobMatchResult {
  jobId: string;
  userId: string;
  overallScore: number; // 0 - 100
  isRecommended: boolean;
  dimensions: {
    role: DimensionMatchScore;
    sector: DimensionMatchScore;
    skills: DimensionMatchScore;
    experience: DimensionMatchScore;
    education: DimensionMatchScore;
    location: DimensionMatchScore;
  };
  whyYouMatch: string[];
  missingQualifications: string[];
  calculatedAt: string;
}

/**
 * 5. Application Draft & Submission Models
 */
export interface ApplicationFieldOverride {
  fieldName: string;
  originalMasterValue: any;
  customApplicationValue: any;
  reason?: string;
}

export interface JobApplicationDraft {
  id: string;
  jobId: string;
  userId: string;
  snapshotFromMasterProfile: {
    fullName: string;
    email: string;
    phone: string;
    residenceCity: string;
    primaryRole: string;
    primarySector: string;
    experienceLevel: string;
    experiences: CareerExperience[];
    educationList: CareerEducationItem[];
    skills: string[];
    tools: string[];
    languages: string[];
  };
  customOverrides: Record<string, ApplicationFieldOverride>;
  applicantNote?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  submittedAt?: string;
}

// --------------------------------------------------------------------------
// PROVENANCE & CONFLICT UTILITIES
// --------------------------------------------------------------------------

export function createProvenanceField<T>(
  value: T,
  source: FieldProvenanceSource = 'CV',
  confidence: number = 0.9,
  evidenceSnippet?: string,
  isConfirmed: boolean = false,
  status: FieldResolutionStatus = 'RESOLVED',
): ProvenanceField<T> {
  return {
    value,
    originalEvidenceValue: value,
    source,
    confidence,
    evidenceSnippet,
    isConfirmed,
    status,
  };
}

/**
 * Invariant 1 Helper: Updating a field with User Override preserves original evidence.
 */
export function applyUserFieldOverride<T>(
  field: ProvenanceField<T>,
  newVal: T,
): ProvenanceField<T> {
  return {
    ...field,
    value: newVal,
    source: 'USER',
    confidence: 1.0,
    isConfirmed: true,
    editedAt: new Date().toISOString(),
    status: 'RESOLVED',
  };
}

/**
 * Merges a newly uploaded CV draft into an existing Master Career Profile
 * strictly preserving any USER overrides and flagging conflicts.
 */
export function mergeCvExtractionWithExistingProfile(params: {
  existingProfile: MasterCareerProfile;
  newCvExtraction: {
    fullName?: string;
    primaryRole?: string;
    primarySector?: string;
    residenceCity?: string;
    skills?: string[];
    experiences?: CareerExperience[];
    educationList?: CareerEducationItem[];
  };
}): {
  updatedProfile: MasterCareerProfile;
  conflicts: Array<{
    field: string;
    existingValue: any;
    existingSource: FieldProvenanceSource;
    newCvValue: any;
  }>;
} {
  const { existingProfile, newCvExtraction } = params;
  const conflicts: Array<{
    field: string;
    existingValue: any;
    existingSource: FieldProvenanceSource;
    newCvValue: any;
  }> = [];

  const updated: MasterCareerProfile = {
    ...existingProfile,
    version: existingProfile.version + 1,
  };

  // Helper for single fields
  const handleField = <K extends 'fullName' | 'primaryRole' | 'primarySector' | 'residenceCity'>(
    key: K,
    newVal?: string,
  ) => {
    if (!newVal) return;
    const current = existingProfile[key];
    if (current && current.source === 'USER' && current.value !== newVal) {
      // Invariant 1: USER override takes precedence, flag conflict for UI
      conflicts.push({
        field: key,
        existingValue: current.value,
        existingSource: 'USER',
        newCvValue: newVal,
      });
    } else {
      // Safe to update with new CV evidence
      (updated[key] as any) = createProvenanceField(newVal, 'CV', 0.9, newVal, false, 'RESOLVED');
    }
  };

  handleField('fullName', newCvExtraction.fullName);
  handleField('primaryRole', newCvExtraction.primaryRole);
  handleField('primarySector', newCvExtraction.primarySector);
  handleField('residenceCity', newCvExtraction.residenceCity);

  // Experience & Education: append or update if not explicitly user customized
  if (newCvExtraction.experiences && newCvExtraction.experiences.length > 0) {
    if (existingProfile.experiences.length === 0) {
      updated.experiences = newCvExtraction.experiences;
    }
  }

  if (newCvExtraction.educationList && newCvExtraction.educationList.length > 0) {
    if (existingProfile.educationList.length === 0) {
      updated.educationList = newCvExtraction.educationList;
    }
  }

  return { updatedProfile: updated, conflicts };
}
