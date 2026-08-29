import { describe, expect, it } from 'vitest';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import {
  MARKETPLACE_LISTING_TYPE_IDS,
  isUserDiscoverableListing,
} from '@/features/listings/config/marketplace-category-map';
import {
  getCategoryRoutePath,
  getUserDiscoverableCategorySlugs,
} from '@/features/listings/config/marketplace.config';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { ids } from '@/lib/domain/ids';
import {
  HOME_CATEGORY_TABS,
  isHomeFeaturedTabVisible,
  isUserDiscoverableContentItem,
} from '@/features/home/config/home-category-tabs';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000201');

function publishedListing(overrides: Parameters<typeof createListing>[0]) {
  return createListing({
    ...overrides,
    ownerId: overrides.ownerId ?? OWNER,
    status: 'published',
    workflowStatus: 'published',
    isFeatured: overrides.isFeatured ?? true,
    publishedAt: overrides.publishedAt ?? '2026-08-01T10:00:00.000Z',
  });
}

const investmentApp = publishedListing({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.yatirimBul,
  listingTypeId: LISTING_TYPE_IDS.yatirimBulDefault,
  moduleKey: 'entrepreneurs',
  title: 'Yayında yatırım ilanı',
  shortDescription: 'Yatırım arayan yayınlanmış girişim ilanıdır.',
});

const investmentDbType = publishedListing({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.iseAl,
  listingTypeId: MARKETPLACE_LISTING_TYPE_IDS.yatirimAriyorum,
  title: 'DB tip yatırım ilanı',
  shortDescription: 'Listing type id ile yatırım arayan ilandır.',
});

const career = publishedListing({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.iseAl,
  listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
  moduleKey: 'employers',
  title: 'Yayında iş ilanı',
  shortDescription: 'İşveren tarafından yayınlanmış kariyer ilanıdır.',
});

const partnership = publishedListing({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.ortakBul,
  listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
  moduleKey: 'founders',
  title: 'Yayında ortaklık ilanı',
  shortDescription: 'Ortak arayan yayınlanmış girişim ilanıdır.',
});

const franchise = publishedListing({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.bayilikAl,
  listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
  moduleKey: 'franchise',
  title: 'Yayında franchise ilanı',
  shortDescription: 'Franchise fırsatı olarak yayınlanmış ilandır.',
});

const digitalAi = publishedListing({
  ownerId: OWNER,
  categoryId: CATEGORY_IDS.dijitalAi,
  listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
  title: 'Yayında dijital çözüm',
  shortDescription: 'Dijital ve yapay zeka çözümü olarak yayınlanmıştır.',
});

describe('home user-facing investment discovery', () => {
  const allTab = HOME_CATEGORY_TABS.find((tab) => tab.id === 'all');

  it('hides published investment listings from home featured / Tümü', () => {
    expect(isUserDiscoverableListing(investmentApp)).toBe(false);
    expect(isUserDiscoverableListing(investmentDbType)).toBe(false);

    const featuredItems = listingsToContentItems([
      investmentApp,
      career,
      partnership,
    ]);
    const visible = featuredItems.filter(isUserDiscoverableContentItem);
    expect(visible.map((item) => item.title)).toEqual([
      'Yayında iş ilanı',
      'Yayında ortaklık ilanı',
    ]);
    expect(allTab?.match(featuredItems[0]!)).toBe(false);
    expect(allTab?.match(featuredItems[1]!)).toBe(true);
  });

  it('keeps published non-investment listings on home Tümü', () => {
    const items = listingsToContentItems([career, partnership, franchise]);
    expect(items.every(isUserDiscoverableContentItem)).toBe(true);
    expect(items.every((item) => allTab?.match(item))).toBe(true);
    expect(items.map((item) => item.title)).toEqual([
      'Yayında iş ilanı',
      'Yayında ortaklık ilanı',
      'Yayında franchise ilanı',
    ]);
  });

  it('hides yatırım and dijital-ai categories from mixed search / keşfet category pickers', () => {
    const slugs = getUserDiscoverableCategorySlugs();
    expect(slugs).not.toContain('yatirim-bul');
    expect(slugs).not.toContain('yatirim-yap');
    expect(slugs).not.toContain('dijital-ai');
    expect(slugs).toEqual(expect.arrayContaining(['ise-al', 'ortak-bul', 'bayilik-al']));
  });

  it('does not expose a live /invest route or featured investment tab', () => {
    expect(getCategoryRoutePath('yatirim-bul')).not.toBe('/invest');
    expect(HOME_CATEGORY_TABS.map((tab) => String(tab.id))).not.toContain('entrepreneur');
    expect(HOME_CATEGORY_TABS.map((tab) => tab.label)).not.toContain('Yatırım Arıyorum');
    expect(isHomeFeaturedTabVisible('all')).toBe(true);
    expect(isHomeFeaturedTabVisible('job')).toBe(true);
    expect(isHomeFeaturedTabVisible('partner')).toBe(true);
    expect(isHomeFeaturedTabVisible('franchise')).toBe(true);
  });
});
