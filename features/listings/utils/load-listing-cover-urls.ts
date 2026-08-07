/**
 * Batch-load first listing image URL per listing id.
 */
import { resolvePersistenceDriver } from '@/lib/persistence/types';
import { createClient } from '@/lib/supabase/client';
import type { ListingId } from '@/lib/domain/ids';
import type { ListingImageRepository } from '@/features/listings/repository/listing-image.repository';

const LISTING_IMAGES_TABLE = 'marketplace_listing_images';
const BATCH_CHUNK_SIZE = 200;

export async function loadListingCoverUrlsByIds(
  listingIds: ListingId[],
  listingImageRepository?: ListingImageRepository,
): Promise<Map<ListingId, string>> {
  const covers = new Map<ListingId, string>();
  if (listingIds.length === 0) return covers;

  if (resolvePersistenceDriver() === 'supabase') {
    const supabase = createClient();

    for (let i = 0; i < listingIds.length; i += BATCH_CHUNK_SIZE) {
      const chunk = listingIds.slice(i, i + BATCH_CHUNK_SIZE);
      const { data, error } = await supabase
        .from(LISTING_IMAGES_TABLE)
        .select('listing_id, url, sort_order')
        .in('listing_id', chunk)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const imagesByListing = new Map<ListingId, { url: string; sortOrder: number }[]>();
      for (const row of data ?? []) {
        const listingId = row.listing_id as ListingId;
        const existing = imagesByListing.get(listingId) ?? [];
        existing.push({
          url: row.url as string,
          sortOrder: (row.sort_order as number | null) ?? 0,
        });
        imagesByListing.set(listingId, existing);
      }

      for (const listingId of chunk) {
        const images = imagesByListing.get(listingId) ?? [];
        images.sort((a, b) => a.sortOrder - b.sortOrder);
        const url = images[0]?.url;
        if (url) covers.set(listingId, url);
      }
    }

    return covers;
  }

  if (!listingImageRepository) return covers;

  const results = await Promise.all(
    listingIds.map(async (listingId) => {
      const images = await listingImageRepository.findByListingId(listingId);
      const sorted = [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      return [listingId, sorted[0]?.url ?? null] as const;
    }),
  );

  for (const [listingId, url] of results) {
    if (url) covers.set(listingId, url);
  }

  return covers;
}
