import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

/**
 * Returns the job application associated with a conversation, including
 * immutable profile snapshot and viewer role (manager vs applicant).
 */
export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const conversationId = ids.conversation(id);

  // 1. Verify user is participant
  const conversation = await ctx.container.conversationRepository.findById(conversationId);
  if (!conversation || !conversation.participantIds.includes(ctx.userId)) {
    return ok({ hasApplication: false, application: null });
  }

  // 2. Find application linked by conversation_id or applicationId or listingId
  let application = null;
  if (conversation.applicationId) {
    application = await ctx.container.applicationRepository.findById(conversation.applicationId);
  }

  if (!application) {
    const listResult = await ctx.container.applicationRepository.findMany({
      moduleKey: 'candidates',
      listingId: conversation.listingId ?? undefined,
    });
    // Check which one belongs to this conversation or participant
    application = listResult.data.find(
      (app) =>
        app.conversationId === conversationId ||
        (app.metadata?.conversationId === conversationId) ||
        (conversation.listingId && app.listingId === conversation.listingId),
    ) ?? null;
  }

  if (!application) {
    return ok({ hasApplication: false, application: null });
  }

  // 3. Determine whether viewer is listing manager (employer) or applicant
  const listing = conversation.listingId
    ? await ctx.container.listingRepository.findById(conversation.listingId)
    : null;

  const applicantProfile = await ctx.container.profileRepository.findById(application.applicantProfileId);
  const isListingOwner = Boolean(listing && listing.ownerId === ctx.userId && application.listingId === listing.id);
  const isManager = Boolean(listing && listing.ownerId === ctx.userId);
  const isApplicant = Boolean(
    application.applicantProfileId === ctx.profileId ||
    (applicantProfile && applicantProfile.userId === ctx.userId),
  );

  const canViewFullApplicantProfile = Boolean(isApplicant || isListingOwner);

  // If neither manager nor applicant nor participant, deny
  if (!isManager && !isApplicant) {
    return ok({ hasApplication: false, application: null });
  }

  let profileSnapshot =
    application.profileSnapshot ||
    (application.metadata?.profileSnapshot as any) ||
    null;

  if (!profileSnapshot && applicantProfile) {
    try {
      const { CareerProfileService } = await import('@/features/career-profile/career-profile.service');
      const careerService = new CareerProfileService(ctx.container.listingRepository);
      const pageData = await careerService.getPageData(applicantProfile.userId);
      const candidateRecord = pageData.seek;
      if (candidateRecord?.values) {
        const v = candidateRecord.values;
        profileSnapshot = {
          displayName: v.fullName || applicantProfile.displayName || 'Aday',
          contactEmail: v.email || applicantProfile.email,
          contactPhone: v.phone || applicantProfile.phone,
          desiredRole: v.role || v.roles?.[0] || 'Uzman',
          primarySector: v.sector || v.sectors?.[0] || 'Genel',
          experienceLevel: v.experienceLevel || 'Deneyimli',
          residenceCity: v.city || 'İstanbul',
          residenceDistrict: v.preferredDistrict || '',
          preferredCity: v.city || 'İstanbul',
          workType: v.workType || 'Tam Zamanlı',
          workplacePreference: v.workplacePreference || 'Hibrit',
          educationLevel: v.educationLevel || 'Lisans',
          educationHistory: (v.educationHistory || []).map((e) => ({
            level: e.level || 'Lisans',
            field: e.field,
            school: e.school,
            graduationYear: e.graduationYear,
          })),
          experiences: v.experiences || [],
          languages: v.languages || '',
          certificates: v.certificates || '',
          professionalSkills: v.professionalSkillsList?.join(', ') || v.professionalSkills || '',
          technicalSkills: v.technicalSkillsList?.join(', ') || v.technicalSkills || '',
          tools: v.toolsList?.join(', ') || v.tools || '',
          longDescription: v.candidateTraits || '',
          salaryExpectation: v.salaryMin && v.salaryMax ? `${v.salaryMin} - ${v.salaryMax} TL` : '',
          availability: v.availability || 'Hemen',
        };
      } else {
        profileSnapshot = {
          displayName: applicantProfile.displayName || 'Aday',
          contactEmail: applicantProfile.email,
          contactPhone: applicantProfile.phone,
          desiredRole: 'Pozisyon Adayı',
          primarySector: 'Genel',
          residenceCity: 'İstanbul',
          workType: 'Tam Zamanlı',
          educationLevel: 'Lisans',
          experiences: [],
        };
      }
    } catch (e) {
      console.warn('[conversation/application] failed to build snapshot fallback:', e);
      profileSnapshot = {
        displayName: applicantProfile.displayName || 'Aday',
        contactEmail: applicantProfile.email,
        contactPhone: applicantProfile.phone,
        desiredRole: 'Pozisyon Adayı',
        experiences: [],
      };
    }
  }

  return ok({
    hasApplication: true,
    application: {
      id: application.id,
      listingId: application.listingId,
      status: application.status,
      coverMessage: application.coverMessage,
      profileSnapshot,
      submittedAt: application.createdAt,
      updatedAt: application.updatedAt,
      isManager,
      isListingOwner,
      isApplicant,
      canViewFullApplicantProfile,
    },
  });
});
