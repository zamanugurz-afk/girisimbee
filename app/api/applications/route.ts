import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { submitApplicationSchema, applicationListQuerySchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';

export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = applicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const { applicationService } = ctx.container.ecosystem;

  if (query.listingId) {
    const applications = await applicationService.listForListing(ids.listing(query.listingId));
    return ok({ applications });
  }

  const applications = await applicationService.listForApplicant(ctx.profileId);
  return ok({ applications });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = submitApplicationSchema.parse(body);
  const { applicationService } = ctx.container.ecosystem;

  const application = await applicationService.submit({
    moduleKey: 'candidates',
    listingId: ids.listing(parsed.listingId),
    applicantProfileId: ctx.profileId,
    coverMessage: parsed.coverMessage ?? null,
    metadata: parsed.metadata,
  });

  return created({ application });
});
