import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import type { ListingDetail } from '@/features/listings/types/listing.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { ListingId, UserId } from '@/lib/domain/ids';
import { uuidSchema } from '@/lib/domain/validation';
import { profileSpan, recordCacheMiss } from '@/lib/perf/navigation-profile';
import { parseListingNumberQuery } from '@/features/listings/utils/listing-number';
import {
  isIdentityGatedListing,
  resolveContactDisclosure,
} from '@/features/contact-requests/lib/contact-disclosure';
import { isAdmin } from '@/features/authorization/rbac.service';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { isUserDiscoverableListing } from '@/features/listings/config/marketplace-category-map';

/** display_name only — never email/phone. Bypasses unpublished-profile RLS for career-card masking. */
async function loadCareerOwnerDisplayName(ownerId: string | null | undefined): Promise<string | null> {
  const id = (ownerId ?? '').trim();
  if (!id) return null;
  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from('marketplace_profiles')
      .select('display_name')
      .eq('user_id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) return null;
    const name = typeof data?.display_name === 'string' ? data.display_name.trim() : '';
    return name || null;
  } catch {
    return null;
  }
}

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
        const supabase = createClient();
        const container = getServerContainer(supabase);
        const listing = await resolveListingRow(idOrSlug, container);
        if (!listing) return null;
        if (!isUserDiscoverableListing(listing)) return null;

        if (listing.moduleKey === 'franchise' && listing.slug) {
          return {
            kind: 'franchise-redirect',
            href: `/franchise/buy/${listing.slug}`,
          };
        }

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        const viewerUserId = authUser?.id ?? null;

        let viewerIsAdmin = false;
        let hasAcceptedContactRequest = false;
        let acceptedOwnerDisplayName: string | null = null;

        if (viewerUserId && isIdentityGatedListing(listing)) {
          const isOwner = Boolean(listing.ownerId && viewerUserId === String(listing.ownerId));
          if (!isOwner) {
            const [accountProfile, mine] = await Promise.all([
              container.accountService
                .getProfile(viewerUserId as UserId)
                .catch(() => null),
              container.contactRequestService.getMineForListing(
                listing.id,
                viewerUserId as UserId,
              ),
            ]);
            viewerIsAdmin = isAdmin(accountProfile?.role);
            hasAcceptedContactRequest = mine?.effectiveStatus === 'accepted';
            if (hasAcceptedContactRequest) {
              const fromParts = [mine?.ownerFirstName, mine?.ownerLastName]
                .filter((part): part is string => Boolean(part && part.trim()))
                .join(' ')
                .trim();
              acceptedOwnerDisplayName =
                mine?.ownerFullName?.trim()
                || fromParts
                || mine?.ownerDisplayName?.trim()
                || null;
            }
          }
        }

        const disclosure = resolveContactDisclosure({
          listing: {
            moduleKey: listing.moduleKey,
            anonymousMode: listing.anonymousMode,
            ownerId: String(listing.ownerId),
          },
          viewerUserId,
          viewerIsAdmin,
          hasAcceptedContactRequest,
        });

        // Full profile/company only when the viewer may see owner identity.
        // Career cards still need display_name for surname masking (profiles are often draft).
        const loadIdentity = disclosure.canRevealOwnerIdentity;
        const loadCareerDisplayName = listing.moduleKey === 'candidates';

        const [tags, images, profile, company, privilegedDisplayName] = await Promise.all([
          container.tagRepository.findByListingId(listing.id),
          container.listingImageRepository.findByListingId(listing.id),
          loadIdentity
            ? container.profileService.getByUserId(listing.ownerId)
            : Promise.resolve(null),
          loadIdentity && listing.companyId
            ? container.companyService.getById(listing.companyId)
            : Promise.resolve(null),
          loadCareerDisplayName
            ? loadCareerOwnerDisplayName(listing.ownerId)
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
              disclosure,
              ownerDisplayName:
                acceptedOwnerDisplayName
                || privilegedDisplayName
                || profile?.displayName
                || null,
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
