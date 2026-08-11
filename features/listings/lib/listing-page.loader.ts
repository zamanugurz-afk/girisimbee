import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import type { ListingDetail } from '@/features/listings/types/listing.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ListingId } from '@/lib/domain/ids';
import { uuidSchema } from '@/lib/domain/validation';
import { profileSpan, recordCacheMiss } from '@/lib/perf/navigation-profile';
import { parseListingNumberQuery } from '@/features/listings/utils/listing-number';

export type ListingPagePayload =
  | { kind: 'detail'; listing: ListingDetail }
  | { kind: 'franchise-redirect'; href: string };

async function resolveListingRow(
  idOrSlug: string,
  container: ReturnType<typeof getServerContainer>,
): Promise<Listing | null> {
  const raw = idOrSlug.trim();
  const isUuid = uuidSchema.safeParse(raw).success;

  let listing = isUuid
    ? await container.listingRepository.findById(raw as ListingId)
    : await container.listingRepository.findBySlug(raw);

  if (!listing && parseListingNumberQuery(raw)) {
    const byNumber = await container.listingRepository.findMany(
      { query: raw, status: 'published', includeDeleted: false },
      { page: 1, limit: 1 },
    );
    listing = byNumber.data[0] ?? null;
  }

  return listing;
}

/**
 * Single cached load for /ilan/[id] page + metadata.
 * One listing-row fetch; franchise redirects without tags/images/profile.
 * Detail path loads tags, images, profile, and company in one parallel wave.
 */
export const loadListingPagePayload = cache(
  async (idOrSlug: string): Promise<ListingPagePayload | null> => {
    recordCacheMiss();
    return profileSpan('loadListingPagePayload', async () => {
      try {
        const container = getServerContainer(createClient());
        const listing = await resolveListingRow(idOrSlug, container);
        if (!listing) return null;

        if (listing.moduleKey === 'franchise' && listing.slug) {
          return {
            kind: 'franchise-redirect',
            href: `/franchise/buy/${listing.slug}`,
          };
        }

        // Public owner display uses marketplace_profiles only — never cross-user
        // public.profiles (phone/email/role) after own-only RLS hardening.
        const [tags, images, profile, company] = await Promise.all([
          container.tagRepository.findByListingId(listing.id),
          container.listingImageRepository.findByListingId(listing.id),
          container.profileService.getByUserId(listing.ownerId),
          listing.companyId
            ? container.companyService.getById(listing.companyId)
            : Promise.resolve(null),
        ]);

        return {
          kind: 'detail',
          listing: aggregateToListingDetail(
            {
              listing,
              tags,
              images,
              attachments: [],
              activityHistory: [],
            },
            {
              profile,
              company,
            },
          ),
        };
      } catch (error: unknown) {
        const err = error as { message?: string; details?: string; hint?: string; code?: string };
        console.error('MESSAGE:', err?.message);
        console.error('DETAILS:', err?.details);
        console.error('HINT:', err?.hint);
        console.error('CODE:', err?.code);
        console.error('FULL ERROR:', error);
        throw error;
      }
    });
  },
);

/** Shared loader for callers that only need the detail DTO. */
export const loadListingDetail = cache(async (idOrSlug: string): Promise<ListingDetail | null> => {
  const payload = await loadListingPagePayload(idOrSlug);
  if (!payload || payload.kind !== 'detail') return null;
  return payload.listing;
});
