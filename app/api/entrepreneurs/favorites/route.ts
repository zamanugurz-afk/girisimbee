import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { entrepreneurFavoriteSchema } from '@/lib/api/validation/entrepreneur-applications';
import { ids } from '@/lib/domain/ids';

/** POST — favorite startup listing; DELETE — remove favorite */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = entrepreneurFavoriteSchema.parse(body);
  const favorite = await ctx.container.ecosystem.entrepreneurApplicationService.favoriteListing(
    ctx.userId,
    ids.listing(parsed.listingId),
  );
  return created({ favorite });
});

export const DELETE = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const parsed = entrepreneurFavoriteSchema.parse({ listingId: url.searchParams.get('listingId') });
  await ctx.container.ecosystem.entrepreneurApplicationService.unfavoriteListing(
    ctx.userId,
    ids.listing(parsed.listingId),
  );
  return ok({ removed: true });
});
