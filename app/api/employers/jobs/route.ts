import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { created } from '@/lib/api/response';
import { publishJobSchema } from '@/lib/api/validation';

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = publishJobSchema.parse(body);

  const listing = await ctx.container.ecosystem.employerJobService.publishJob({
    ownerId: ctx.userId,
    profileId: ctx.profileId,
    listing: parsed,
  });

  return created({ listing });
});
