import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  entrepreneurApplicationSubmitSchema,
  entrepreneurApplicationListQuerySchema,
} from '@/lib/api/validation/entrepreneur-applications';
import { ids } from '@/lib/domain/ids';

/** POST — investor submits investment interest; GET — list interests */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = entrepreneurApplicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const service = ctx.container.ecosystem.entrepreneurApplicationService;

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

  const applications = await service.listApplicationsForInvestor(ctx.profileId, {
    status: query.status,
    submittedAfter: query.submittedAfter,
    submittedBefore: query.submittedBefore,
  });
  return ok({ applications });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = entrepreneurApplicationSubmitSchema.parse(body);
  const application = await ctx.container.ecosystem.entrepreneurApplicationService.submitInterest(
    ctx.profileId,
    ids.listing(parsed.listingId),
    parsed.coverMessage,
    parsed.initialNote,
  );
  return created({ application });
});
