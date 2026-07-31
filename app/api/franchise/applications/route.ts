import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  franchiseApplicationSubmitSchema,
  franchiseApplicationListQuerySchema,
} from '@/lib/api/validation/franchise-applications';
import { ids } from '@/lib/domain/ids';

/** POST — Bayilik Al applicant submits application to franchise-give listing */
/** GET — list applications (buyer: own apps; franchisor: by listingId) */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = franchiseApplicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const service = ctx.container.ecosystem.franchiseApplicationService;

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

  const applications = await service.listApplicationsForApplicant(ctx.profileId, {
    status: query.status,
    submittedAfter: query.submittedAfter,
    submittedBefore: query.submittedBefore,
  });
  return ok({ applications });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = franchiseApplicationSubmitSchema.parse(body);
  const application = await ctx.container.ecosystem.franchiseApplicationService.submitApplication(
    ctx.profileId,
    ids.listing(parsed.listingId),
    parsed.coverMessage,
    parsed.initialNote,
  );
  return created({ application });
});
