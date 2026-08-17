import { describe, expect, it, vi } from 'vitest';
import { ListingBrowseService } from '@/features/listings/services/listing-browse.service';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000202');

function published(overrides: Parameters<typeof createListing>[0]): Listing {
  return createListing({
    ...overrides,
    ownerId: overrides.ownerId ?? OWNER,
    status: 'published',
    workflowStatus: 'published',
    isFeatured: true,
    publishedAt: '2026-08-01T10:00:00.000Z',
  });
}

function createService(listings: Listing[]) {
  const listingRepo = {
    findPublished: vi.fn(async () => ({
      data: listings,
      total: listings.length,
      page: 1,
      limit: listings.length,
      hasMore: false,
    })),
    count: vi.fn(async () => listings.length),
  };

  return new ListingBrowseService(
    listingRepo as never,
    {} as never,
    { findByUserIds: vi.fn(async () => []) } as never,
    { findByIds: vi.fn(async () => []) } as never,
    { findByListingId: vi.fn(async () => []) } as never,
  );
}

const investment = published({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.yatirimBul,
  listingTypeId: LISTING_TYPE_IDS.yatirimBulDefault,
  moduleKey: 'entrepreneurs',
  title: 'Yatırım arayan ilan',
  shortDescription: 'Yayınlanmış yatırım arıyorum ilanıdır.',
});

const career = published({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.iseAl,
  listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
  moduleKey: 'employers',
  title: 'Kariyer ilanı',
  shortDescription: 'Yayınlanmış işveren kariyer ilanıdır.',
});

describe('ListingBrowseService user-facing investment discovery', () => {
  it('hides investment listings from unscoped home / keşfet aggregation', async () => {
    const service = createService([investment, career]);
    const result = await service.browse({});

    expect(result.data.map((item) => item.title)).toEqual(['Kariyer ilanı']);
  });

  it('does not serve retired yatırım-arama browse', async () => {
    const service = createService([investment]);
    const result = await service.browse({ categorySlug: 'yatirim-bul' });

    expect(result.data).toEqual([]);
  });

  it('does not change career browse results', async () => {
    const service = createService([investment, career]);
    const result = await service.browse({ categorySlug: 'ise-al' });

    expect(result.data.map((item) => item.title)).toEqual(['Kariyer ilanı']);
  });
});
