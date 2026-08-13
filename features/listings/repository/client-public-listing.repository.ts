/**
 * Client-side listing repository wrapper.
 * Identity-gated public reads never expose ownerId / company identity / PII custom fields.
 * Owners still receive their own unsanitized rows (contact channels remain DB-revoked).
 */
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { PaginatedResult } from '@/lib/domain/pagination';
import { isIdentityGatedListing } from '@/features/contact-requests/lib/contact-disclosure';
import {
  stripListingContactPhone,
  toPublicListingEntity,
} from '@/features/contact-requests/lib/strip-listing-phone';

async function resolveClientUserId(
  getUserId?: () => Promise<string | null>,
): Promise<string | null> {
  if (getUserId) return getUserId();
  try {
    const { createClient } = require('@/lib/supabase/client') as typeof import('@/lib/supabase/client');
    const { data } = await createClient().auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

function sanitizeForClientViewer(
  listing: Listing,
  viewerUserId: string | null,
): Listing {
  const phoneSafe = stripListingContactPhone(listing);
  if (!isIdentityGatedListing(phoneSafe)) return phoneSafe;
  if (viewerUserId && viewerUserId === String(listing.ownerId)) {
    return phoneSafe;
  }
  return toPublicListingEntity(listing);
}

async function mapListingResult(
  result: PaginatedResult<Listing>,
  getUserId?: () => Promise<string | null>,
): Promise<PaginatedResult<Listing>> {
  if (result.data.length === 0) return result;
  const viewerUserId = await resolveClientUserId(getUserId);
  return {
    ...result,
    data: result.data.map((listing) => sanitizeForClientViewer(listing, viewerUserId)),
  };
}

const LIST_READ_METHODS = new Set([
  'findPublished',
  'findMany',
  'paginate',
  'search',
]);

/**
 * Proxy that sanitizes identity-gated listings on client reads.
 * Write / RPC methods pass through unchanged.
 */
export function wrapListingRepositoryForClientPublicReads(
  inner: ListingRepository,
  getUserId?: () => Promise<string | null>,
): ListingRepository {
  return new Proxy(inner, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;
      const key = String(prop);

      if (key === 'findById' || key === 'findBySlug') {
        return async (...args: unknown[]) => {
          const listing = (await value.apply(target, args)) as Listing | null;
          if (!listing) return null;
          const viewerUserId = await resolveClientUserId(getUserId);
          return sanitizeForClientViewer(listing, viewerUserId);
        };
      }

      if (LIST_READ_METHODS.has(key)) {
        return async (...args: unknown[]) => {
          const result = (await value.apply(target, args)) as PaginatedResult<Listing>;
          return mapListingResult(result, getUserId);
        };
      }

      return value.bind(target);
    },
  });
}
