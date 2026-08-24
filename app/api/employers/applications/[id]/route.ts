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

import { sendJobApplicationStatusNotification } from '@/lib/email/job-application-email';

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

    // Optional status update email to candidate if conversation/profile exists
    try {
      const applicantProfile = await ctx.container.profileRepository.findById(application.applicantProfileId);
      const listing = await ctx.container.listingRepository.findById(application.listingId);
      const convId = application.conversationId;
      if (applicantProfile?.email && listing?.title && convId) {
        const STATUS_LABELS: Record<string, string> = {
          pending: 'Yeni Başvuru',
          reviewing: 'İnceleniyor',
          contacted: 'Mülakat / İletişim',
          accepted: 'Olumlu / Kabul Edildi',
          rejected: 'Olumsuz / Reddedildi',
          withdrawn: 'Geri Çekildi',
        };
        const statusLabel = STATUS_LABELS[statusUpdate.data.status] || statusUpdate.data.status;
        void sendJobApplicationStatusNotification({
          to: applicantProfile.email,
          applicantName: applicantProfile.displayName || 'Değerli Aday',
          positionTitle: listing.title,
          statusLabel,
          conversationId: convId,
        }).catch((err) => {
          console.warn('[email] candidate status notification warning:', err);
        });
      }
    } catch {
      // Non-critical notification failure
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
