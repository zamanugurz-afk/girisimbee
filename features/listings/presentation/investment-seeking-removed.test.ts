import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  HOME_CATEGORIES,
  HOME_CATEGORIES_CATALOG,
} from '@/components/girisimco/home/home-marketplace.data';
import {
  CREATE_LISTING_PICKER_ORDER,
  CREATE_LISTING_ROOT_HIDDEN_CATEGORY_IDS,
  CREATE_LISTING_VENTURE_COPY,
} from '@/components/girisimco/listing/create-listing-career.data';
import { getAllCategoryIntents } from '@/features/categories/services/category.service';
import { HOME_CATEGORY_TABS } from '@/features/home/config/home-category-tabs';
import { isMarketSafePublicHref } from '@/features/admin/market/presentation/market-copy';
import { isDigitalAiSafePublicHref } from '@/features/listings/presentation/digital-ai-copy';
import {
  CATEGORY_IDS,
  CREATE_LISTING_DEFERRED_CATEGORY_IDS,
  CREATE_LISTING_TYPE_CONFIGS,
} from '@/features/listings/config/listing-type-config';
import {
  BROWSE_DEFERRED_CATEGORY_SLUGS,
  USER_DISCOVERY_HIDDEN_CATEGORY_SLUGS,
} from '@/features/listings/config/marketplace-category-map';
import {
  CATEGORY_ROUTE_PATHS,
  getAllCategoryRoutePaths,
  getCategoryRoutePath,
  getUserDiscoverableCategorySlugs,
  resolveCategorySlug,
} from '@/features/listings/config/marketplace.config';
import { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';

const SEEKING_LABELS = ['Yatırım Arıyorum', 'Yatırım Bul'];

describe('Yatırım Arıyorum product is retired from user-facing surfaces', () => {
  it('keeps header and footer free of yatırım-arama links', () => {
    const header = NAV_LINKS.map((link) => `${link.label} ${link.href}`).join(' ');
    expect(header).not.toMatch(/Yatırım Arıyorum|Yatırım Bul|\/invest(?!ors)/);
    const footer = Object.values(getFooterLinks()).flat();
    expect(footer.some((link) => SEEKING_LABELS.includes(link.label))).toBe(false);
    expect(footer.some((link) => link.href === '/invest')).toBe(false);
  });

  it('keeps home catalog, featured tabs, and gateway free of yatırım-arama', () => {
    expect(HOME_CATEGORIES.map((cat) => cat.slug as string)).not.toContain('yatirim-bul');
    expect(HOME_CATEGORIES.map((cat) => cat.href)).not.toContain('/invest');
    expect(HOME_CATEGORIES_CATALOG.map((cat) => cat.slug as string)).not.toContain('yatirim-bul');
    expect(HOME_CATEGORIES_CATALOG.map((cat) => cat.label)).not.toContain('Yatırım Arıyorum');
    expect(HOME_CATEGORY_TABS.map((tab) => tab.label)).not.toContain('Yatırım Arıyorum');
    expect(HOME_CATEGORY_TABS.map((tab) => tab.viewAllHref)).not.toContain('/invest');
  });

  it('keeps create picker and create configs free of yatırım-arama', () => {
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.yatirimBul);
    expect(CREATE_LISTING_ROOT_HIDDEN_CATEGORY_IDS).toContain(CATEGORY_IDS.yatirimBul);
    expect(CREATE_LISTING_VENTURE_COPY.options.map((item) => item.label)).not.toContain('Yatırım Arıyorum');
    expect(CREATE_LISTING_DEFERRED_CATEGORY_IDS).toContain(CATEGORY_IDS.yatirimBul);
    expect(CREATE_LISTING_TYPE_CONFIGS.some((item) => item.categoryId === CATEGORY_IDS.yatirimBul)).toBe(false);
  });

  it('hides yatırım categories from ara / keşfet pickers and related browse', () => {
    const slugs = getUserDiscoverableCategorySlugs();
    expect(slugs).not.toContain('yatirim-bul');
    expect(slugs).not.toContain('yatirim-yap');
    expect(USER_DISCOVERY_HIDDEN_CATEGORY_SLUGS).toEqual(expect.arrayContaining(['yatirim-bul', 'yatirim-yap']));
    expect(BROWSE_DEFERRED_CATEGORY_SLUGS).toContain('yatirim-bul');
    expect(resolveCategorySlug('yatirim-bul')).toBeNull();
    const relatedDefaults = ['ortak-bul', 'bayilik-al', 'ise-al', 'dijital-ai'];
    expect(relatedDefaults).not.toContain('yatirim-bul');
    expect(relatedDefaults.every((slug) => resolveCategorySlug(slug))).toBe(true);
  });

  it('does not keep /invest as a live category route', () => {
    expect(CATEGORY_ROUTE_PATHS['yatirim-bul']).toBeUndefined();
    expect(getAllCategoryRoutePaths()).not.toContain('/invest');
    expect(getCategoryRoutePath('yatirim-bul')).not.toBe('/invest');
    expect(existsSync(path.join(process.cwd(), 'app/invest/page.tsx'))).toBe(false);
  });

  it('keeps MARKET and Dijital & AI isolated from yatırım-arama destinations', () => {
    expect(isMarketSafePublicHref('/invest')).toBe(false);
    expect(isMarketSafePublicHref('/franchise/buy')).toBe(true);
    expect(isDigitalAiSafePublicHref('/invest')).toBe(false);
    expect(isDigitalAiSafePublicHref('/dijital-ai')).toBe(true);
  });

  it('does not list Yatırım Arıyorum as an active category intent', () => {
    expect(getAllCategoryIntents().some((intent) => intent.label === 'Yatırım Arıyorum')).toBe(false);
    expect(getAllCategoryIntents().some((intent) => intent.id === 'find-investment')).toBe(false);
  });
});
