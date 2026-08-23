import { withAuth, type RouteContext } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { calculateJobMatch } from '@/features/career-profile/canonical-job-matching';
import { createProvenanceField, type MasterCareerProfile, type JobPostingRequirement } from '@/features/career-profile/canonical-career-contract';

/**
 * GET /api/jobs/[id]/match
 * Computes deterministic multi-dimension compatibility score between
 * the authenticated user's Career Profile and the specific Job Posting.
 */
export const GET = withAuth(async (ctx, request, routeContext: RouteContext) => {
  const jobId = routeContext?.params?.id;

  if (!jobId) {
    return apiError('İlan ID belirtilmedi.', 400);
  }

  try {
    const listingId = ids.listing(jobId);
    const jobListing = await ctx.container.listingRepository.findById(listingId);

    if (!jobListing) {
      return apiError('İlan bulunamadı.', 404);
    }

    // Load candidate's career profile
    const profileService = new CareerProfileService(ctx.container.listingRepository);
    const profileData = await profileService.getPageData(ctx.userId);
    const activeRecord = profileData.seek || profileData.hire;

    const formVals = (activeRecord?.values || {}) as any;

    // Build canonical Master Career Profile representation
    const masterProfile: MasterCareerProfile = {
      id: activeRecord?.listingId || 'temp_profile',
      userId: ctx.userId,
      fullName: createProvenanceField(formVals.fullName || 'Aday', 'USER', 1.0, undefined, true),
      email: createProvenanceField(formVals.email || '', 'USER', 1.0, undefined, true),
      phone: createProvenanceField(formVals.phone || '', 'USER', 1.0, undefined, true),
      residenceCity: createProvenanceField(formVals.city || formVals.residenceCity || '', 'USER', 1.0, undefined, true),
      residenceDistrict: formVals.residenceDistrict ? createProvenanceField(formVals.residenceDistrict, 'USER', 1.0, undefined, true) : undefined,
      primaryRole: createProvenanceField(formVals.desiredRole || formVals.role || '', 'USER', 1.0, undefined, true),
      primarySector: createProvenanceField(formVals.primarySector || formVals.sector || '', 'USER', 1.0, undefined, true),
      experienceLevel: createProvenanceField(formVals.experienceLevel || 'Mid', 'USER', 1.0, undefined, true),
      experiences: formVals.experiences || [],
      educationList: formVals.educationHistory || [],
      skills: createProvenanceField(formVals.professionalSkillsList || [], 'USER', 1.0, undefined, true),
      tools: createProvenanceField(formVals.toolsList || [], 'USER', 1.0, undefined, true),
      languages: createProvenanceField(formVals.languages ? [formVals.languages] : [], 'USER', 1.0, undefined, true),
      certificates: createProvenanceField(formVals.certificates ? [formVals.certificates] : [], 'USER', 1.0, undefined, true),
      preferences: {
        workType: formVals.workType,
        workplacePreference: formVals.workplacePreference,
        preferredCity: formVals.city,
      },
      activeIntentMode: 'seek',
      version: 1,
    };

    // Build job requirement representation
    const jobFields = (jobListing as any).customFields || {};
    const jobRequirement: JobPostingRequirement = {
      id: jobId,
      employerId: jobListing.ownerId,
      title: jobListing.title,
      sector: jobFields.primarySector || jobFields.sector || 'Genel',
      requiredRole: jobFields.desiredRole || jobFields.role || jobListing.title,
      requiredSeniority: jobFields.experienceLevel || 'Mid',
      requiredSkills: jobFields.professionalSkillsList || (jobFields.skills ? String(jobFields.skills).split(',') : []),
      location: {
        city: (jobListing as any).city || jobFields.city || '',
        district: (jobListing as any).district || jobFields.district || '',
      },
      workType: jobFields.workType || 'Tam Zamanlı',
      workplacePreference: jobFields.workplacePreference || 'Ofiste',
    };

    const matchResult = calculateJobMatch({
      candidateProfile: masterProfile,
      jobRequirement,
    });

    return ok({ match: matchResult });
  } catch (error: any) {
    console.error('API /api/jobs/[id]/match error:', error?.message || error);
    return apiError(error instanceof Error ? error.message : 'Eşleşme hesaplanırken hata oluştu.', 400);
  }
});
