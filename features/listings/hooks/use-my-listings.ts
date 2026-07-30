'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useListingEngine } from '@/features/listings/hooks/use-listing-engine';
import { getClientContainer } from '@/lib/persistence/container';
import type { ListingId, UserId } from '@/lib/domain/ids';
import type { ListingStatus } from '@/features/listings/types/listing.entity.types';
import type {
  MyListingItem,
  MyListingSortBy,
  MyListingStatusFilter,
  MyListingViewMode,
} from '@/features/listings/types/my-listings.types';
import { sortMyListings } from '@/features/listings/utils/my-listings-sort';

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
    searchListings,
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
      const repositorySort =
        sortBy === 'recently_updated' ? 'recently_updated' : 'newest';

      const result = await searchListings(
        {
          ownerId: user.id as UserId,
          status: STATUS_FILTER_MAP[statusFilter],
          query: debouncedQuery || undefined,
          sortBy: repositorySort,
        },
        { page: 1, limit: 100 },
      );

      const { favoriteRepository, listingImageRepository } = getClientContainer();

      const enriched = await Promise.all(
        result.data.map(async (listing) => {
          const [images, favoriteCount] = await Promise.all([
            listingImageRepository.findByListingId(listing.id),
            favoriteRepository.countByListingId(listing.id),
          ]);
          const sortedImages = [...images].sort(
            (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
          );
          return {
            listing,
            thumbnailUrl: sortedImages[0]?.url ?? null,
            favoriteCount,
          };
        }),
      );

      setItems(sortMyListings(enriched, sortBy));
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlanlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter, debouncedQuery, sortBy, searchListings]);

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
