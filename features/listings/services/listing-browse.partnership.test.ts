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
});
