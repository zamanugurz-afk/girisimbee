import { withAuth } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import type { ListingStatus } from '@/features/listings/types/listing.entity.types';

const STATUS_FILTER_MAP: Record<string, ListingStatus[] | undefined> = {
  all: undefined,
  draft: ['draft'],
  pending_review: ['pending_review'],
  published: ['published'],
  paused: ['paused'],
  archived: ['archived'],
  sold: ['sold'],
  expired: ['expired'],
};

/**
 * GET — current user's listings (server-enriched ownerId).
 * Client must not filter marketplace_listings by owner_id via PostgREST after column revoke.
 */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const statusKey = url.searchParams.get('status') ?? 'all';
  const query = url.searchParams.get('query')?.trim() || undefined;
  const sortBy =
    url.searchParams.get('sortBy') === 'recently_updated' ? 'recently_updated' : 'newest';
  const status = STATUS_FILTER_MAP[statusKey];

  const result = await ctx.container.listingRepository.search(
    {
      ownerId: ctx.userId,
      status,
      query,
      sortBy,
    },
    { page: 1, limit: 100 },
  );

  return ok({ listings: result.data, pagination: result });
});
