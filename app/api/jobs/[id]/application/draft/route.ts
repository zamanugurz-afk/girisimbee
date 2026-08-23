import { withAuth, type RouteContext } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { ids } from '@/lib/domain/ids';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { createProvenanceField, type MasterCareerProfile, type JobPostingRequirement } from '@/features/career-profile/canonical-career-contract';
import { createJobApplicationDraft, applyApplicationOverride } from '@/features/career-profile/canonical-application-flow';

/**
 * POST /api/jobs/[id]/application/draft
 * Auto-fills a Job Application draft from the candidate's Master Career Profile
 * (WITHOUT re-parsing the CV).
 */
export const POST = withAuth(async (ctx, request, routeContext: RouteContext) => {
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

    const profileService = new CareerProfileService(ctx.container.listingRepository);
    const profileData = await profileService.getPageData(ctx.userId);
    const activeRecord = profileData.seek || profileData.hire;
    const formVals = (activeRecord?.values || {}) as any;

    const masterProfile: MasterCareerProfile = {
      id: activeRecord?.listingId || 'temp_profile',
      userId: ctx.userId,
      fullName: createProvenanceField(formVals.fullName || 'Aday', 'USER', 1.0, undefined, true),
      email: createProvenanceField(formVals.email || '', 'USER', 1.0, undefined, true),
      phone: createProvenanceField(formVals.phone || '', 'USER', 1.0, undefined, true),
      residenceCity: createProvenanceField(formVals.city || formVals.residenceCity || '', 'USER', 1.0, undefined, true),
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

    const jobFields = (jobListing as any).customFields || {};
    const jobRequirement: JobPostingRequirement = {
      id: jobId,
      employerId: jobListing.ownerId,
      title: jobListing.title,
      sector: jobFields.primarySector || jobFields.sector || 'Genel',
      requiredRole: jobFields.desiredRole || jobFields.role || jobListing.title,
      requiredSeniority: jobFields.experienceLevel || 'Mid',
      requiredSkills: jobFields.professionalSkillsList || [],
      location: {
        city: (jobListing as any).city || jobFields.city || '',
        district: (jobListing as any).district || jobFields.district || '',
      },
      workType: jobFields.workType || 'Tam Zamanlı',
      workplacePreference: jobFields.workplacePreference || 'Ofiste',
    };

    const draft = createJobApplicationDraft({
      masterProfile,
      jobRequirement,
    });

    return ok({ draft });
  } catch (error: any) {
    console.error('API /api/jobs/[id]/application/draft POST error:', error?.message || error);
    return apiError(error instanceof Error ? error.message : 'Başvuru taslağı oluşturulamadı.', 400);
  }
});

/**
 * PATCH /api/jobs/[id]/application/draft
 * Customizes an application draft with job-specific overrides
 * (WITHOUT mutating the Master Career Profile).
 */
export const PATCH = withAuth(async (ctx, request, routeContext: RouteContext) => {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      draft?: any;
      fieldName?: string;
      customValue?: any;
      reason?: string;
    };

    if (!body.draft || !body.fieldName) {
      return apiError('Geçersiz başvuru güncellemesi.', 400);
    }

    const updatedDraft = applyApplicationOverride({
      draft: body.draft,
      fieldName: body.fieldName,
      customValue: body.customValue,
      reason: body.reason,
    });

    return ok({ draft: updatedDraft });
  } catch (error: any) {
    console.error('API /api/jobs/[id]/application/draft PATCH error:', error?.message || error);
    return apiError(error instanceof Error ? error.message : 'Başvuru güncellenemedi.', 400);
  }
});
