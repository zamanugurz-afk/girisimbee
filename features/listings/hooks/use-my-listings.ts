'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useListingEngine } from '@/features/listings/hooks/use-listing-engine';
import { getClientContainer } from '@/lib/persistence/container';
import { resolvePersistenceDriver } from '@/lib/persistence/types';
import { createClient } from '@/lib/supabase/client';
import type { ListingImageRepository } from '@/features/listings/repository/listing-image.repository';
import type { ListingId } from '@/lib/domain/ids';
import type { Listing, ListingStatus } from '@/features/listings/types/listing.entity.types';
import type {
  MyListingItem,
  MyListingSortBy,
  MyListingStatusFilter,
  MyListingViewMode,
} from '@/features/listings/types/my-listings.types';
import { sortMyListings } from '@/features/listings/utils/my-listings-sort';

const LISTING_IMAGES_TABLE = 'marketplace_listing_images';
const BATCH_CHUNK_SIZE = 200;

async function loadThumbnailUrlsByListingIds(
  listingIds: ListingId[],
  listingImageRepository: ListingImageRepository,
): Promise<Map<ListingId, string | null>> {
  const thumbnails = new Map<ListingId, string | null>();
  if (listingIds.length === 0) return thumbnails;

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
        thumbnails.set(listingId, images[0]?.url ?? null);
      }
    }

    return thumbnails;
  }

  const results = await Promise.all(
    listingIds.map(async (listingId) => {
      const images = await listingImageRepository.findByListingId(listingId);
      const sortedImages = [...images].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      return [listingId, sortedImages[0]?.url ?? null] as const;
    }),
  );

  for (const [listingId, url] of results) {
    thumbnails.set(listingId, url);
  }

  return thumbnails;
}

const OWNER_STATUSES: ListingStatus[] = [
  'draft',
  'pending_review',
  'published',
  'paused',
  'expired',
  'archived',
  'rejected',
  'sold',
];

const STATUS_FILTER_MAP: Record<MyListingStatusFilter, ListingStatus[] | undefined> = {
  all: OWNER_STATUSES,
  draft: ['draft'],
  pending_review: ['pending_review'],
  published: ['published'],
  paused: ['paused'],
  rejected: ['rejected'],
  archived: ['archived'],
  sold: ['sold'],
  expired: ['expired'],
};

export function useMyListings() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    publishListing,
    renewListing,
    markListingSold,
    pauseListing,
    archiveListing,
    softDeleteListing,
  } = useListingEngine();

  const [items, setItems] = useState<MyListingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MyListingStatusFilter>('all');
  const [sortBy, setSortBy] = useState<MyListingSortBy>('newest');
  const [viewMode, setViewMode] = useState<MyListingViewMode>('grid');
  const [actionId, setActionId] = useState<ListingId | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Owner-scoped listing reads go through server API (owner_id not selectable via PostgREST).
      const params = new URLSearchParams();
      params.set('status', statusFilter);
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (sortBy === 'recently_updated') params.set('sortBy', 'recently_updated');

      const response = await fetch(`/api/account/listings?${params.toString()}`, {
        method: 'GET',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        throw new Error('İlanlar yüklenemedi');
      }
      const payload = (await response.json()) as {
        data?: {
          listings?: Listing[];
          pagination?: { total?: number };
        };
      };
      const listings = payload.data?.listings ?? [];
      const total = payload.data?.pagination?.total ?? listings.length;

      const listingIds = listings.map((listing) => listing.id);
      const { favoriteRepository, listingImageRepository } = getClientContainer();

      const [thumbnailUrls, favoriteCounts] = await Promise.all([
        loadThumbnailUrlsByListingIds(listingIds, listingImageRepository),
        favoriteRepository.countActiveByListingIds(listingIds),
      ]);

      const enriched = listings.map((listing) => ({
        listing,
        thumbnailUrl: thumbnailUrls.get(listing.id) ?? null,
        favoriteCount: favoriteCounts.get(listing.id) ?? 0,
      }));

      setItems(sortMyListings(enriched, sortBy));
      setTotal(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlanlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter, debouncedQuery, sortBy]);

  useEffect(() => {
    if (!authLoading) {
      void load();
    }
  }, [authLoading, load]);

  const runAction = useCallback(
    async (id: ListingId, action: () => Promise<unknown>, successMessage: string) => {
      setActionId(id);
      try {
        await action();
        toast.success(successMessage);
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'İşlem başarısız');
      } finally {
        setActionId(null);
      }
    },
    [load],
  );

  const handlePublish = useCallback(
    (id: ListingId) => runAction(id, () => publishListing(id), 'İlan durumu güncellendi'),
    [publishListing, runAction],
  );

  const handleRenew = useCallback(
    (id: ListingId) => runAction(id, () => renewListing(id), 'İlan yenilendi'),
    [renewListing, runAction],
  );

  const handleMarkSold = useCallback(
    (id: ListingId) => runAction(id, () => markListingSold(id), 'İlan satıldı olarak işaretlendi'),
    [markListingSold, runAction],
  );

  const handlePause = useCallback(
    (id: ListingId) => runAction(id, () => pauseListing(id), 'İlan duraklatıldı'),
    [pauseListing, runAction],
  );

  const handleArchive = useCallback(
    (id: ListingId) => runAction(id, () => archiveListing(id), 'İlan arşivlendi'),
    [archiveListing, runAction],
  );

  const handleDelete = useCallback(
    (id: ListingId) =>
      runAction(id, () => softDeleteListing(id), 'İlan silindi'),
    [runAction, softDeleteListing],
  );

  return {
    items,
    total,
    isLoading: authLoading || isLoading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    actionId,
    refresh: load,
    handlePublish,
    handleRenew,
    handleMarkSold,
    handlePause,
    handleArchive,
    handleDelete,
    isAuthenticated: Boolean(user),
  };
}
