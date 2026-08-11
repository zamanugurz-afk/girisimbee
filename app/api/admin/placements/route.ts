import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { createServiceRoleClient } from '@/lib/supabase/service';

type PlacementRow = {
  id: string;
  listing_id: string;
  package_slug: string;
  featured_listing: boolean;
  urgent_listing: boolean;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at: string;
};

/**
 * GET — admin list of homepage / vitrin placements with listing titles.
 */
export const GET = withAdmin(async () => {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('marketplace_listing_placements')
    .select(
      'id, listing_id, package_slug, featured_listing, urgent_listing, starts_at, ends_at, status, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw error;

  const rows = (data ?? []) as PlacementRow[];
  const listingIds = Array.from(new Set(rows.map((r) => r.listing_id)));

  const listingMeta = new Map<string, { title: string; ownerId: string }>();
  if (listingIds.length > 0) {
    const { data: listings, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('id, title, owner_id')
      .in('id', listingIds);
    if (listingError) throw listingError;
    for (const listing of listings ?? []) {
      listingMeta.set(String(listing.id), {
        title: String(listing.title ?? '—'),
        ownerId: String(listing.owner_id ?? ''),
      });
    }
  }

  const placements = rows.map((row) => {
    const meta = listingMeta.get(row.listing_id);
    const isUrgent = row.package_slug === 'hizli_erisim' || row.urgent_listing;
    return {
      id: row.id,
      listing_id: row.listing_id,
      listing_title: meta?.title ?? '—',
      owner: meta?.ownerId ?? '—',
      placement_type: isUrgent ? ('acil_vitrin' as const) : ('vitrin' as const),
      status: row.status,
      started_at: row.starts_at,
      expires_at: row.ends_at,
      created_at: row.created_at,
      package_slug: row.package_slug,
    };
  });

  return ok({ placements });
});
