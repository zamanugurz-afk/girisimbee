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

  const profileSnapshot =
    application.profileSnapshot ||
    (application.metadata?.profileSnapshot as any) ||
    null;

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
