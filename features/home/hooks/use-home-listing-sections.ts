'use client';

import { useCallback, useEffect, useState } from 'react';
import { getClientContainer } from '@/lib/persistence/container';
import type { ContentItem } from '@/features/categories/types/category.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { MarketplaceBrowseParams } from '@/features/listings/types/marketplace.types';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { loadListingCoverUrlsByIds } from '@/features/listings/utils/load-listing-cover-urls';
import {
  HOME_LISTING_SECTIONS,
  type HomeListingSectionId,
} from '@/features/home/config/home-sections.config';
import type {
  HomeListingSectionState,
  HomeListingSectionsResult,
} from '@/features/home/types/home-section.types';
import type { ListingId, CompanyId } from '@/lib/domain/ids';
import type { TrustBadges } from '@/features/authentication/types/trust.types';
import {
  hasActivePaidAcil,
  hasActivePaidVitrin,
} from '@/features/monetization/lib/homepage-placement-meta';

function emptySection(id: HomeListingSectionId): HomeListingSectionState {
  return { id, items: [], total: 0, isLoading: true, error: null };
}

async function buildTrustMapForListings(
  listings: Listing[],
): Promise<Map<ListingId, TrustBadges>> {
  const { profileRepository, companyRepository } = getClientContainer();

  const ownerIds = [...new Set(listings.map((listing) => listing.ownerId))];
  const companyIds = [
    ...new Set(listings.map((listing) => listing.companyId).filter(Boolean)),
  ] as CompanyId[];

  const [profiles, companies] = await Promise.all([
    profileRepository
      .findByUserIds(ownerIds)
      .catch(() => [] as Awaited<ReturnType<typeof profileRepository.findByUserIds>>),
    companyRepository
      .findByIds(companyIds)
      .catch(() => [] as Awaited<ReturnType<typeof companyRepository.findByIds>>),
  ]);

  const profileByUser = new Map(profiles.map((profile) => [profile.userId, profile]));
  const companyById = new Map(companies.map((company) => [company.id, company]));

  const map = new Map<ListingId, TrustBadges>();
  for (const listing of listings) {
    const profile = profileByUser.get(listing.ownerId);
    const company = listing.companyId ? companyById.get(listing.companyId) : null;
    map.set(listing.id, {
      user: profile?.isVerified ?? false,
      investor: profile?.investorVerified ?? false,
      company: company?.isVerified ?? false,
    });
  }

  return map;
}

async function fetchHomeSection(
  sectionId: HomeListingSectionId,
  params: MarketplaceBrowseParams,
): Promise<{ listings: Listing[]; total: number }> {
  const { listingRepository } = getClientContainer();
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const { page: _page, limit: _limit, categorySlug: _categorySlug, ...filter } = params;

  const result = await listingRepository.findPublished(filter, { page, limit });

  // Only package-purchased listings in Öne Çıkan / Acil (ignore legacy admin flags).
  if (sectionId === 'featured') {
    const paid = result.data.filter((listing) => hasActivePaidVitrin(listing));
    return { listings: paid, total: paid.length };
  }
  if (sectionId === 'urgent') {
    const paid = result.data.filter((listing) => hasActivePaidAcil(listing));
    return { listings: paid, total: paid.length };
  }

  return { listings: result.data, total: result.total };
}

export function useHomeListingSections(): HomeListingSectionsResult {
  const [sections, setSections] = useState<HomeListingSectionState[]>(() =>
    HOME_LISTING_SECTIONS.map((section) => emptySection(section.id)),
  );
  const [reloadToken, setReloadToken] = useState(0);

  const loadSections = useCallback(async () => {
    setSections(HOME_LISTING_SECTIONS.map((section) => emptySection(section.id)));

    const settled = await Promise.allSettled(
      HOME_LISTING_SECTIONS.map(async (section) => {
        const fetched = await fetchHomeSection(section.id, section.resolveBrowseParams());
        return {
          id: section.id,
          listings: fetched.listings,
          total: fetched.total,
        };
      }),
    );

    const sectionResults: Array<
      | { id: HomeListingSectionId; listings: Listing[]; total: number; error: null }
      | { id: HomeListingSectionId; listings: Listing[]; total: number; error: string }
    > = settled.map((result, index) => {
      const id = HOME_LISTING_SECTIONS[index].id;
      if (result.status === 'fulfilled') {
        return { ...result.value, error: null };
      }
      return {
        id,
        listings: [],
        total: 0,
        error: result.reason instanceof Error ? result.reason.message : 'Yüklenemedi',
      };
    });

    const listingsForTrust = [
      ...new Map(
        sectionResults.flatMap((section) =>
          section.listings.map((listing) => [listing.id, listing] as const),
        ),
      ).values(),
    ];

    let trustByListingId = new Map<ListingId, TrustBadges>();
    let coverByListingId = new Map<ListingId, string>();
    if (listingsForTrust.length > 0) {
      const { listingImageRepository } = getClientContainer();
      const [trustResult, coverResult] = await Promise.allSettled([
        buildTrustMapForListings(listingsForTrust),
        loadListingCoverUrlsByIds(
          listingsForTrust.map((listing) => listing.id),
          listingImageRepository,
        ),
      ]);
      if (trustResult.status === 'fulfilled') trustByListingId = trustResult.value;
      if (coverResult.status === 'fulfilled') coverByListingId = coverResult.value;
    }

    setSections(
      sectionResults.map((section) => ({
        id: section.id,
        items: section.error
          ? ([] as ContentItem[])
          : listingsToContentItems(section.listings, trustByListingId, coverByListingId),
        total: section.total,
        isLoading: false,
        error: section.error,
      })),
    );
  }, []);

  useEffect(() => {
    void loadSections();
  }, [loadSections, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const isLoading = sections.some((section) => section.isLoading);

  return { sections, isLoading, refresh };
}
