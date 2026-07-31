import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { employerApplicationsQuerySchema } from '@/lib/api/validation';
import { employerApplicationListQuerySchema } from '@/lib/api/validation/employer-applications';
import { ids } from '@/lib/domain/ids';

/** GET — list anonymous applications for listing or applicant's own applications */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = employerApplicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const service = ctx.container.ecosystem.employerApplicationService;

  if (query.listingId) {
    const applications = await service.listApplicationsForListing(
      ids.listing(query.listingId),
      ctx.profileId,
      {
        status: query.status,
        submittedAfter: query.submittedAfter,
        submittedBefore: query.submittedBefore,
      },
    );
    return ok({ applications });
  }

  if (query.applicant === 'me') {
    const applications = await service.listApplicationsForApplicant(ctx.profileId, {
      status: query.status,
      submittedAfter: query.submittedAfter,
      submittedBefore: query.submittedBefore,
    });
    return ok({ applications });
  }

  const legacy = employerApplicationsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (legacy.success && legacy.data.listingId) {
    const anonymous = await service.listAnonymousApplications(
      ids.listing(legacy.data.listingId),
      ctx.profileId,
    );
    return ok({ applications: anonymous });
  }

  return ok({ applications: [] });
});
