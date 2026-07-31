import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  founderApplicationSubmitSchema,
  founderApplicationListQuerySchema,
} from '@/lib/api/validation/founder-applications';
import { ids } from '@/lib/domain/ids';

/** POST — submit partnership interest; GET — list applications */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = founderApplicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const service = ctx.container.ecosystem.founderApplicationService;

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
  const parsed = founderApplicationSubmitSchema.parse(body);
  const application = await ctx.container.ecosystem.founderApplicationService.submitInterest(
    ctx.profileId,
    ids.listing(parsed.listingId),
    parsed.coverMessage,
    parsed.initialNote,
  );
  return created({ application });
});
