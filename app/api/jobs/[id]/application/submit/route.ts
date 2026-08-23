import { withAuth, type RouteContext } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { submitJobApplication } from '@/features/career-profile/canonical-application-flow';
import type { JobApplicationDraft } from '@/features/career-profile/canonical-career-contract';

/**
 * POST /api/jobs/[id]/application/submit
 * Freezes the application into an immutable historical record and submits it.
 */
export const POST = withAuth(async (ctx, request, routeContext: RouteContext) => {
  const jobId = routeContext?.params?.id;

  if (!jobId) {
    return apiError('İlan ID belirtilmedi.', 400);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      draft?: JobApplicationDraft;
      applicantNote?: string;
    };

    if (!body.draft) {
      return apiError('Gönderilecek başvuru bulunamadı.', 400);
    }

    const submittedApplication = submitJobApplication({
      draft: body.draft,
      applicantNote: body.applicantNote,
    });

    return ok({
      success: true,
      application: submittedApplication,
      submittedAt: submittedApplication.submittedAt,
    });
  } catch (error: any) {
    console.error('API /api/jobs/[id]/application/submit POST error:', error?.message || error);
    return apiError(error instanceof Error ? error.message : 'Başvuru gönderilemedi.', 400);
  }
});
