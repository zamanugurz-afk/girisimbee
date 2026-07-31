import { withOptionalAuth, withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import {
  entrepreneurListingIdParamSchema,
  parseEntrepreneurListingUpdate,
} from '@/lib/api/validation/entrepreneur-listings';
import { ids } from '@/lib/domain/ids';

/** GET — startup listing detail by id or slug (?preview=true hides PII) */
export const GET = withOptionalAuth(async (ctx, request, { params }) => {
  const { id } = entrepreneurListingIdParamSchema.parse(params);
  const url = new URL(request.url);
  const preview = url.searchParams.get('preview') === 'true';
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const detail = await container.ecosystem.entrepreneurService.getStartupDetail(id, {
    trackView: true,
    preview,
  });
  if (!detail) {
    return ok({ listing: null });
  }

  return ok({ listing: detail });
});

/** PATCH — update startup listing */
export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = entrepreneurListingIdParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const parsed = parseEntrepreneurListingUpdate(body);

  const listing = await ctx.container.ecosystem.entrepreneurService.updateStartupListing({
    ownerId: ctx.userId,
    listingId: ids.listing(id),
    listing: parsed,
  });

  return ok({ listing });
});
