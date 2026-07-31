import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { investorFavoriteSchema } from '@/lib/api/validation/investor-applications';
import { ids } from '@/lib/domain/ids';

/** POST — favorite listing; DELETE — remove favorite */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = investorFavoriteSchema.parse(body);
  const favorite = await ctx.container.ecosystem.investorApplicationService.favoriteListing(
    ctx.userId,
    ids.listing(parsed.listingId),
  );
  return created({ favorite });
});

export const DELETE = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const parsed = investorFavoriteSchema.parse({ listingId: url.searchParams.get('listingId') });
  await ctx.container.ecosystem.investorApplicationService.unfavoriteListing(
    ctx.userId,
    ids.listing(parsed.listingId),
  );
  return ok({ removed: true });
});
