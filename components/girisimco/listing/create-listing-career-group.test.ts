import { describe, expect, it } from 'vitest';
import { CAREER_FLOW_OPTIONS } from '@/components/girisimco/home/home-marketplace.data';
import {
  CREATE_LISTING_CAREER_CATEGORY_IDS,
  CREATE_LISTING_CAREER_COPY,
  CREATE_LISTING_CAREER_HUB,
  CREATE_LISTING_PICKER_ORDER,
} from '@/components/girisimco/listing/create-listing-career.data';
import { CATEGORY_IDS, CATEGORY_SLUG_TO_ID } from '@/features/listings/config/listing-type-config';
import { categoryRegistry } from '@/features/listings/config/category-registry';

describe('create listing career group', () => {
  it('keeps other picker cards at the same level and out of the career group', () => {
    expect(CREATE_LISTING_PICKER_ORDER).toEqual([
      CATEGORY_IDS.yatirimBul,
      CATEGORY_IDS.ortakBul,
      CATEGORY_IDS.bayilikAl,
      CATEGORY_IDS.dijitalAi,
    ]);
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.isBul);
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.iseAl);
    expect(CREATE_LISTING_PICKER_ORDER).not.toContain(CATEGORY_IDS.yatirimYap);
  });

  it('uses a single parent hub card before İş Arıyorum / İşe Alıyorum', () => {
    expect(CREATE_LISTING_CAREER_HUB.title).toBe('Kariyer ve İş Fırsatları');
    expect(CREATE_LISTING_CAREER_HUB.title).not.toContain('&');
    expect(CREATE_LISTING_CAREER_HUB.description).toBe(
      'İş arayanlar ve işverenler için doğru fırsatı bulun.',
    );
    expect(CREATE_LISTING_CAREER_COPY.title).toBe(
      'Ne tür bir kariyer ilanı vermek istiyorsunuz?',
    );
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
});
