import { describe, expect, it, vi } from 'vitest';
import { ListingBrowseService } from '@/features/listings/services/listing-browse.service';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000077');

function partnerListing(title: string, intent?: 'seeking' | 'joining'): Listing {
  return createListing({
    ownerId: OWNER,
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title,
    shortDescription: 'Ortaklık ilanı kısa açıklama metnidir.',
    status: 'published',
    workflowStatus: 'published',
    customFields: intent ? { partnershipIntent: intent } : {},
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
  const favoriteRepo = {};
  const profileRepo = {
    findByUserIds: vi.fn(async () => []),
  };
  const companyRepo = {
    findByIds: vi.fn(async () => []),
  };
  const imageRepo = {
    findByListingId: vi.fn(async () => []),
  };

  return new ListingBrowseService(
    listingRepo as never,
    favoriteRepo as never,
    profileRepo as never,
    companyRepo as never,
    imageRepo as never,
  );
}

describe('ListingBrowseService partnership intent', () => {
  const legacy = partnerListing('Eski ortak arıyorum');
  const seeking = partnerListing('Yeni ortak arıyorum', 'seeking');
  const joining = partnerListing('Ortak olmak istiyorum', 'joining');

  it('defaults ortak-bul browse to seeking and keeps legacy listings', async () => {
    const service = createService([legacy, seeking, joining]);
    const result = await service.browse({ categorySlug: 'ortak-bul' });

    expect(result.data.map((item) => item.title)).toEqual([
      'Eski ortak arıyorum',
      'Yeni ortak arıyorum',
    ]);
    expect(result.total).toBe(2);
  });

  it('shows only joining listings when intent=joining', async () => {
    const service = createService([legacy, seeking, joining]);
    const result = await service.browse({
      categorySlug: 'ortak-bul',
      partnershipIntent: 'joining',
    });

    expect(result.data.map((item) => item.title)).toEqual(['Ortak olmak istiyorum']);
    expect(result.data[0]?.listingTypeLabel).toBe('ORTAK OLMAK İSTİYORUM');
    expect(result.data[0]?.type).toBe('person');
  });

  it('filters strictly to isletme-devri category without leaking other categories', async () => {
    const jobListing = createListing({
      ownerId: OWNER,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'Kıdemli Yazılım Mühendisi',
      shortDescription: 'İş ilanı açıklaması',
      status: 'published',
      workflowStatus: 'published',
    });

    const transferListing = createListing({
      ownerId: OWNER,
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      title: 'Devren Satılık Butik Kafe',
      shortDescription: 'Hazır müşteri portföylü devir',
      status: 'published',
      workflowStatus: 'published',
    });

    const mockRepo = {
      findPublished: vi.fn(async (filter) => {
        let items = [legacy, seeking, joining, jobListing, transferListing];
        if (filter.categoryId) {
          items = items.filter((i) => i.categoryId === filter.categoryId);
        }
        return {
          data: items,
          total: items.length,
          page: 1,
          limit: items.length,
          hasMore: false,
        };
      }),
      count: vi.fn(async () => 0),
    };

    const service = new ListingBrowseService(
      mockRepo as never,
      {} as never,
      { findByUserIds: vi.fn(async () => []) } as never,
      { findByIds: vi.fn(async () => []) } as never,
      { findByListingId: vi.fn(async () => []) } as never,
    );

    const result = await service.browse({ categorySlug: 'isletme-devri' });

    expect(mockRepo.findPublished).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: CATEGORY_IDS.isletmeDevri }),
      expect.anything(),
    );
    expect(result.data.map((item) => item.title)).toEqual(['Devren Satılık Butik Kafe']);
    expect(result.total).toBe(1);
  });

  it('returns empty result (0 listings) for isletme-devri when no transfer listings exist', async () => {
    const mockRepo = {
      findPublished: vi.fn(async (filter) => {
        let items = [legacy, seeking, joining];
        if (filter.categoryId) {
          items = items.filter((i) => i.categoryId === filter.categoryId);
        }
        return {
          data: items,
          total: items.length,
          page: 1,
          limit: items.length,
          hasMore: false,
        };
      }),
      count: vi.fn(async () => 0),
    };

    const service = new ListingBrowseService(
      mockRepo as never,
      {} as never,
      { findByUserIds: vi.fn(async () => []) } as never,
      { findByIds: vi.fn(async () => []) } as never,
      { findByListingId: vi.fn(async () => []) } as never,
    );

    const result = await service.browse({ categorySlug: 'isletme-devri' });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
