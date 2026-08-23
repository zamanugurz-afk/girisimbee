/**
 * GİRİŞİMBEE — CANONICAL JOB APPLICATION FLOW & PROJECTION GENERATOR
 * 
 * Implements:
 * 1. Master Career Profile -> Intent Projections (Seek, Hire, Partner)
 * 2. Master Career Profile -> Job Application Draft Auto-Fill (Zero CV Re-parsing)
 * 3. Application-Specific Field Overrides (Zero Master Mutation)
 * 4. Immutable Historical Application Snapshots
 */

import type {
  MasterCareerProfile,
  JobPostingRequirement,
  JobApplicationDraft,
  JobSeekingProjection,
  HiringProjection,
  PartnershipProjection,
  ApplicationFieldOverride,
} from './canonical-career-contract';

/**
 * Generates intent-specific views (projections) over the single Master Career Profile.
 */
export function extractProjectionsFromMasterProfile(profile: MasterCareerProfile): {
  seek: JobSeekingProjection;
  hire: HiringProjection;
  partner: PartnershipProjection;
} {
  const seek: JobSeekingProjection = {
    userId: profile.userId,
    targetRole: profile.primaryRole.value,
    targetRoleOther: profile.desiredRoleOther?.value,
    targetSector: profile.primarySector.value,
    experienceLevel: profile.experienceLevel.value,
    preferredLocation: {
      city: profile.preferences.preferredCity || profile.residenceCity.value,
      district: profile.preferences.preferredDistrict || profile.residenceDistrict?.value,
    },
    salaryExpectation: {
      min: profile.preferences.salaryMin,
      max: profile.preferences.salaryMax,
      currency: profile.preferences.salaryCurrency || 'TRY',
    },
    workType: profile.preferences.workType,
    workplacePreference: profile.preferences.workplacePreference,
    availability: profile.preferences.availability,
    highlightedSkills: profile.skills.value || [],
    experiences: profile.experiences,
    educationList: profile.educationList,
  };

  const hire: HiringProjection = {
    userId: profile.userId,
    companyName: profile.experiences[0]?.company || '',
    hiringRoles: [profile.primaryRole.value],
    targetSectors: [profile.primarySector.value],
    requiredSeniority: profile.experienceLevel.value,
    location: {
      city: profile.residenceCity.value,
      district: profile.residenceDistrict?.value,
    },
    requiredSkills: profile.skills.value || [],
    workplacePreference: profile.preferences.workplacePreference,
    employmentType: profile.preferences.workType,
  };

  const partner: PartnershipProjection = {
    userId: profile.userId,
    founderName: profile.fullName.value,
    expertiseAreas: profile.skills.value || [],
    industries: [profile.primarySector.value],
    startupStage: 'Fikir / Doğrulama',
    partnershipType: 'Kurucu Ortak (Co-founder)',
    capitalContribution: profile.preferences.salaryMin,
    equityOffered: 20,
    availability: profile.preferences.availability,
  };

  return { seek, hire, partner };
}

/**
 * Invariant 2 & 6: Auto-fills a Job Application Draft from Master Profile.
 * CV is NOT re-parsed.
 */
export function createJobApplicationDraft(params: {
  masterProfile: MasterCareerProfile;
  jobRequirement: JobPostingRequirement;
  draftId?: string;
}): JobApplicationDraft {
  const { masterProfile, jobRequirement, draftId } = params;

  return {
    id: draftId || `app_draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    jobId: jobRequirement.id,
    userId: masterProfile.userId,
    snapshotFromMasterProfile: {
      fullName: masterProfile.fullName.value,
      email: masterProfile.email.value,
      phone: masterProfile.phone.value,
      residenceCity: masterProfile.residenceCity.value,
      primaryRole: masterProfile.primaryRole.value,
      primarySector: masterProfile.primarySector.value,
      experienceLevel: masterProfile.experienceLevel.value,
      experiences: [...masterProfile.experiences],
      educationList: [...masterProfile.educationList],
      skills: [...(masterProfile.skills.value || [])],
      tools: [...(masterProfile.tools.value || [])],
      languages: [...(masterProfile.languages.value || [])],
    },
    customOverrides: {},
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Invariant 2: Applying an override to an Application Draft NEVER mutates the Master Profile.
 */
export function applyApplicationOverride(params: {
  draft: JobApplicationDraft;
  fieldName: string;
  customValue: any;
  reason?: string;
}): JobApplicationDraft {
  const { draft, fieldName, customValue, reason } = params;
  const originalMasterValue = (draft.snapshotFromMasterProfile as any)[fieldName];

  const override: ApplicationFieldOverride = {
    fieldName,
    originalMasterValue,
    customApplicationValue: customValue,
    reason,
  };

  return {
    ...draft,
    customOverrides: {
      ...draft.customOverrides,
      [fieldName]: override,
    },
  };
}

/**
 * Invariant 10: Submitting an application freezes it as an immutable snapshot.
 */
export function submitJobApplication(params: {
  draft: JobApplicationDraft;
  applicantNote?: string;
}): JobApplicationDraft {
  const { draft, applicantNote } = params;
  return {
    ...draft,
    applicantNote: applicantNote || draft.applicantNote,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
  };
}
