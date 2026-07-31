'use client';

import { useCallback } from 'react';
import { getListingEngine } from '@/lib/persistence/container';
import type { ListingId, UserId } from '@/lib/domain/ids';
import type {
  CreateListingPayload,
  UpdateListingPayload,
  ListingAggregate,
} from '@/features/listings/types/listing-engine.types';
import type { ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { PaginationParams } from '@/lib/domain/pagination';
import { useAuth } from '@/features/authentication/hooks/use-auth';

export function useListingEngine() {
  const { user } = useAuth();

  const ctx = { actorId: (user?.id ?? '00000000-0000-4000-8000-000000000000') as UserId };

  const createListing = useCallback(
    (payload: Omit<CreateListingPayload, 'ownerId'>) => {
      const fullPayload = { ...payload, ownerId: ctx.actorId };
      console.log('[useListingEngine] createListing payload', JSON.stringify(fullPayload, null, 2));
      return getListingEngine().createListing(fullPayload, ctx);
    },
    [ctx.actorId],
  );

  const updateListing = useCallback(
    (id: ListingId, payload: UpdateListingPayload) =>
      getListingEngine().updateListing(id, payload, ctx),
    [ctx.actorId],
  );

  const publishListing = useCallback(
    (id: ListingId) => {
      console.log('[useListingEngine] publishListing payload', JSON.stringify({ listingId: id, actorId: ctx.actorId }, null, 2));
      return getListingEngine().publishListing(id, ctx);
    },
    [ctx.actorId],
  );

  const renewListing = useCallback(
    (id: ListingId) => getListingEngine().renewListing(id, ctx),
    [ctx.actorId],
  );

  const markListingSold = useCallback(
    (id: ListingId) => getListingEngine().markListingSold(id, ctx),
    [ctx.actorId],
  );

  const pauseListing = useCallback(
    (id: ListingId) => getListingEngine().pauseListing(id, ctx),
    [ctx.actorId],
  );

  const archiveListing = useCallback(
    (id: ListingId) => getListingEngine().archiveListing(id, ctx),
    [ctx.actorId],
  );

  const softDeleteListing = useCallback(
    (id: ListingId) => getListingEngine().softDeleteListing(id, ctx),
    [ctx.actorId],
  );

  const restoreListing = useCallback(
    (id: ListingId) => getListingEngine().restoreListing(id, ctx),
    [ctx.actorId],
  );

  const duplicateListing = useCallback(
    (id: ListingId) => getListingEngine().duplicateListing(id, ctx),
    [ctx.actorId],
  );

  const getListing = useCallback(
    (id: ListingId) => getListingEngine().getListing(id),
    [],
  );

  const searchListings = useCallback(
    (filter: ListingFilter, pagination?: PaginationParams) =>
      getListingEngine().searchListings(filter, pagination),
    [],
  );

  return {
    createListing,
    updateListing,
    publishListing,
    renewListing,
    markListingSold,
    pauseListing,
    archiveListing,
    softDeleteListing,
    restoreListing,
    duplicateListing,
    getListing,
    searchListings,
    isAuthenticated: Boolean(user),
    actorId: ctx.actorId,
  };
}

export type { ListingAggregate, CreateListingPayload, UpdateListingPayload };
