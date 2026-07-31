import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  candidateApplicationSubmitSchema,
  candidateApplicationListQuerySchema,
} from '@/lib/api/validation/candidate-applications';

import { ids } from '@/lib/domain/ids';

/** GET — list candidate's own job applications */
/** POST — apply to employer job listing */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = candidateApplicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const applications = await ctx.container.ecosystem.candidateApplicationService.listMyApplications(
    ctx.profileId,
    {
      status: query.status,
      submittedAfter: query.submittedAfter,
      submittedBefore: query.submittedBefore,
    },
  );
  return ok({ applications });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = candidateApplicationSubmitSchema.parse(body);
  const application = await ctx.container.ecosystem.candidateApplicationService.submitApplication(
    ctx.profileId,
    ids.listing(parsed.listingId),
    parsed.coverMessage,
    parsed.initialNote,
  );
  return created({ application });
});
