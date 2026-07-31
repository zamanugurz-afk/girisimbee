import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { franchiseFavoriteSchema } from '@/lib/api/validation/franchise-applications';
import { ids } from '@/lib/domain/ids';

/** POST — favorite a franchise listing; DELETE — remove favorite */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = franchiseFavoriteSchema.parse(body);
  const favorite = await ctx.container.ecosystem.franchiseApplicationService.favoriteListing(
    ctx.userId,
    ids.listing(parsed.listingId),
  );
  return created({ favorite });
});

export const DELETE = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const parsed = franchiseFavoriteSchema.parse({ listingId: url.searchParams.get('listingId') });
  await ctx.container.ecosystem.franchiseApplicationService.unfavoriteListing(
    ctx.userId,
    ids.listing(parsed.listingId),
  );
  return ok({ removed: true });
});
