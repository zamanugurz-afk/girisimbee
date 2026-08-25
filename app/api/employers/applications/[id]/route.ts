import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema } from '@/lib/api/validation';
import {
  employerApplicationStatusUpdateSchema,
  employerApplicationNoteSchema,
  employerApplicationActionSchema,
} from '@/lib/api/validation/employer-applications';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const application = await ctx.container.ecosystem.employerApplicationService.getApplicationDetail(
    ids.application(id),
    ctx.profileId,
  );
  return ok({ application });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const applicationId = ids.application(id);
  const service = ctx.container.ecosystem.employerApplicationService;

  const statusUpdate = employerApplicationStatusUpdateSchema.safeParse(body);
  if (statusUpdate.success) {
    const application = await service.updateApplicationStatus(
      applicationId,
      ctx.profileId,
      statusUpdate.data.status,
      statusUpdate.data.note,
    );

    // If status is 'rejected' and a rejection message is provided, post message into conversation
    if (statusUpdate.data.status === 'rejected' && statusUpdate.data.rejectionMessage?.trim()) {
      try {
        const meta = (application as any).metadata?.employer ?? (application as any).metadata ?? {};
        if (!meta.rejectionMessageSent) {
          let convId = application.conversationId;
          if (!convId) {
            const listResult = await ctx.container.conversationRepository.findMany(
              { participantId: ctx.userId },
              { page: 1, limit: 100 },
            );
            const found = listResult.data.find(
              (c: import('@/features/messaging/types/conversation.types').Conversation) =>
                c.applicationId === applicationId || (c.listingId && c.listingId === application.listingId),
            );
            if (found) convId = found.id;
          }

          if (convId) {
            await ctx.container.messagingService.sendMessage({
              conversationId: convId,
              senderId: ctx.userId,
              body: statusUpdate.data.rejectionMessage.trim(),
            });

            // Mark rejection message as sent to prevent duplicate messages
            await ctx.container.applicationRepository.update(applicationId, {
              metadata: {
                ...((application as any).metadata ?? {}),
                rejectionMessageSent: true,
              },
            });
          }
        }
      } catch (err) {
        console.warn('[rejectionMessage] failed to post in-conversation rejection message:', err);
      }
    }

    return ok({ application });
  }

  const noteBody = employerApplicationNoteSchema.safeParse(body);
  if (noteBody.success) {
    const application = await service.addApplicationNote(
      applicationId,
      ctx.profileId,
      noteBody.data.note,
    );
    return ok({ application });
  }

  const actionBody = employerApplicationActionSchema.safeParse(body);
  if (actionBody.success) {
    switch (actionBody.data.action) {
      case 'review': {
        const application = await service.markReviewing(applicationId, ctx.profileId);
        return ok({ application });
      }
      case 'withdraw': {
        const application = await service.withdrawApplication(applicationId, ctx.profileId);
        return ok({ application });
      }
    }
  }

  throw new ValidationError('Geçersiz istek.', {
    body: ['status, note veya action (review|withdraw) belirtin.'],
  });
});

