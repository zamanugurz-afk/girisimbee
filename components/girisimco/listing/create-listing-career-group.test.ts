import { describe, expect, it } from 'vitest';
import {
  CAREER_FLOW_OPTIONS,
  CAREER_HUB_LANDING,
} from '@/components/girisimco/home/home-marketplace.data';
import {
  CREATE_LISTING_CAREER_CATEGORY_IDS,
  CREATE_LISTING_CAREER_COPY,
  CREATE_LISTING_CAREER_HUB,
  CREATE_LISTING_FRANCHISE_HUB,
  CREATE_LISTING_PICKER_ORDER,
  CREATE_LISTING_ROOT_HIDDEN_CATEGORY_IDS,
  CREATE_LISTING_VENTURE_CATEGORY_IDS,
  CREATE_LISTING_VENTURE_CATEGORIES_COPY,
  CREATE_LISTING_VENTURE_COPY,
  CREATE_LISTING_VENTURE_HUB,
} from '@/components/girisimco/listing/create-listing-career.data';
import {
  CATEGORY_IDS,
  CATEGORY_SLUG_TO_ID,
  CREATE_LISTING_TYPE_CONFIGS,
} from '@/features/listings/config/listing-type-config';
import { categoryRegistry } from '@/features/listings/config/category-registry';

describe('create listing career group', () => {
  it('shows only hub cards on the root picker and keeps leaf types hidden', () => {
    expect(CREATE_LISTING_PICKER_ORDER).toEqual([]);
    expect(CREATE_LISTING_ROOT_HIDDEN_CATEGORY_IDS).toEqual([
      CATEGORY_IDS.yatirimBul,
      CATEGORY_IDS.ortakBul,
      CATEGORY_IDS.bayilikAl,
      CATEGORY_IDS.dijitalAi,
    ]);
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.isBul);
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.iseAl);
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.yatirimYap);
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.yatirimBul);
    expect(CREATE_LISTING_TYPE_CONFIGS.some((item) => item.categoryId === CATEGORY_IDS.yatirimBul)).toBe(false);
    expect(CREATE_LISTING_TYPE_CONFIGS.some((item) => item.categoryId === CATEGORY_IDS.dijitalAi)).toBe(true);
  });

  it('uses a single parent hub card before İş Arıyorum / İşe Alıyorum', () => {
    expect(CREATE_LISTING_CAREER_HUB.title).toBe('Kariyer ve İş Fırsatları');
    expect(CREATE_LISTING_CAREER_HUB.title).not.toContain('&');
    expect(CREATE_LISTING_CAREER_HUB.description).toBe(
      'Kariyer profili yayınlayın veya açık pozisyon ilanı oluşturun.',
    );
    expect(CAREER_HUB_LANDING.badge).toBe(CREATE_LISTING_CAREER_HUB.title);
    expect(CAREER_HUB_LANDING.title).toBe('Kariyer ve İş Fırsatları');
    expect(CREATE_LISTING_CAREER_COPY.title).toBe(
      'Ne tür bir kariyer ilanı vermek istiyorsunuz?',
    );
    expect(CREATE_LISTING_CAREER_COPY.title).not.toBe(CAREER_HUB_LANDING.title);
  });

  it('maps career create cards to the existing isBul / iseAl category IDs', () => {
    expect(CREATE_LISTING_CAREER_CATEGORY_IDS).toEqual([
      CATEGORY_IDS.isBul,
      CATEGORY_IDS.iseAl,
    ]);
    expect(CREATE_LISTING_CAREER_COPY.options.map((item) => item.label)).toEqual([
      'İş Arıyorum',
      'İşe Alıyorum',
    ]);
    expect(CREATE_LISTING_CAREER_COPY.options[0]?.categoryId).toBe(CATEGORY_IDS.isBul);
    expect(CREATE_LISTING_CAREER_COPY.options[1]?.categoryId).toBe(CATEGORY_IDS.iseAl);
    expect(CREATE_LISTING_CAREER_COPY.options.map((item) => item.id)).toEqual(
      CAREER_FLOW_OPTIONS.map((item) => item.id),
    );
    expect(CREATE_LISTING_CAREER_COPY.options[0]?.benefits[0]?.title).toBe(
      'Profilinizi oluşturun',
    );
    expect(CREATE_LISTING_CAREER_COPY.options[1]?.benefits[0]?.title).toBe(
      'Pozisyonunuzu tanımlayın',
    );
    expect(CREATE_LISTING_CAREER_COPY.options[0]?.description).not.toBe(
      CAREER_FLOW_OPTIONS[0]?.description,
    );
    expect(CREATE_LISTING_CAREER_COPY.options[1]?.description).not.toBe(
      CAREER_FLOW_OPTIONS[1]?.description,
    );
  });

  it('keeps existing create deep-link slugs for both career types', () => {
    expect(CATEGORY_SLUG_TO_ID['is-bul']).toBe(CATEGORY_IDS.isBul);
    expect(CATEGORY_SLUG_TO_ID['ise-al']).toBe(CATEGORY_IDS.iseAl);
    expect(categoryRegistry.resolveCategoryId('is-bul')).toBe(CATEGORY_IDS.isBul);
    expect(categoryRegistry.resolveCategoryId('is-ariyorum')).toBe(CATEGORY_IDS.isBul);
    expect(categoryRegistry.resolveCategoryId('find-job')).toBe(CATEGORY_IDS.isBul);
    expect(categoryRegistry.resolveCategoryId('ise-al')).toBe(CATEGORY_IDS.iseAl);
    expect(categoryRegistry.resolveCategoryId('hire')).toBe(CATEGORY_IDS.iseAl);
  });

  it('separates Franchise as 3rd root card alongside Kariyer and Ortaklık ve Devir', () => {
    expect(CREATE_LISTING_VENTURE_HUB.title).toBe('Ortaklık ve Devir');
    expect(CREATE_LISTING_VENTURE_HUB.benefits.map((b) => b.title)).toEqual([
      'Ortaklık',
      'İşletme Devri',
    ]);
    expect(CREATE_LISTING_FRANCHISE_HUB.title).toBe('Franchise');
    expect(CREATE_LISTING_FRANCHISE_HUB.description).toBe(
      'Markanız için franchise veya bayilik fırsatınızı yayınlayın.',
    );
    expect(CATEGORY_SLUG_TO_ID['ortak-bul']).toBe(CATEGORY_IDS.ortakBul);
    expect(CATEGORY_SLUG_TO_ID.franchise).toBe(CATEGORY_IDS.bayilikAl);
    expect(categoryRegistry.resolveCategoryId('ortak-bul')).toBe(CATEGORY_IDS.ortakBul);
    expect(categoryRegistry.resolveCategoryId('franchise')).toBe(CATEGORY_IDS.bayilikAl);
  });

  it('orders venture sub-categories as Ortaklık and İşletme Devri', () => {
    expect(CREATE_LISTING_VENTURE_CATEGORIES_COPY.categories.map((c) => c.label)).toEqual([
      'Ortaklık',
      'İşletme Devri',
    ]);
    expect(CREATE_LISTING_VENTURE_CATEGORIES_COPY.categories.map((c) => c.id)).toEqual([
      'partnership',
      'business_transfer',
    ]);
  });
});
