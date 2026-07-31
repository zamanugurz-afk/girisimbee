import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { employerApplicationsQuerySchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = employerApplicationsQuerySchema.parse(Object.fromEntries(url.searchParams));

  const applications = await ctx.container.ecosystem.employerJobService.listAnonymousApplications(
    ids.listing(query.listingId),
    ctx.profileId,
  );

  return ok({ applications });
});
