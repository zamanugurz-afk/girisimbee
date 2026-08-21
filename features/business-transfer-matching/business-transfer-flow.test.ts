import { describe, it, expect } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { getListingCategoryTheme } from '@/features/listings/config/listing-form-theme.config';
import {
  buildCreateListingFormSchema,
  buildUpdateListingFormSchema,
  getListingFormDefaults,
} from '@/features/listings/form/build-dynamic-schema';
import { resolveBrowseCategory, resolveBrowseCategorySlug } from '@/features/listings/config/marketplace-category-map';
import { resolveCategorySlug } from '@/features/listings/config/marketplace.config';

describe('Business Transfer (İşletme Devri) End-to-End Flow & Config', () => {
  it('resolves category and listing types from categoryRegistry', () => {
    const category = categoryRegistry.getCategory(CATEGORY_IDS.isletmeDevri);
    expect(category).toBeDefined();
    expect(category?.name).toBe('İşletme Devri');

    const sellType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferSellDefault);
    expect(sellType).toBeDefined();
    expect(sellType?.name).toBe('İşletmemi Devretmek İstiyorum');

    const buyType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault);
    expect(buyType).toBeDefined();
    expect(buyType?.name).toBe('İşletme Devralmak İstiyorum');

    const byCat = categoryRegistry.getListingTypesByCategory(CATEGORY_IDS.isletmeDevri);
    expect(byCat.length).toBe(2);
  });

  it('resolves category aliases correctly', () => {
    expect(categoryRegistry.resolveCategoryId('isletme-devri')).toBe(CATEGORY_IDS.isletmeDevri);
    expect(categoryRegistry.resolveCategoryId('isletme-devret')).toBe(CATEGORY_IDS.isletmeDevri);
    expect(categoryRegistry.resolveCategoryId('isletme-devral')).toBe(CATEGORY_IDS.isletmeDevri);
    expect(categoryRegistry.resolveCategoryId('devret')).toBe(CATEGORY_IDS.isletmeDevri);
    expect(categoryRegistry.resolveCategoryId('devral')).toBe(CATEGORY_IDS.isletmeDevri);
    expect(categoryRegistry.resolveCategoryId('business-transfer')).toBe(CATEGORY_IDS.isletmeDevri);
  });

  it('resolves browse routes and marketplace maps', () => {
    expect(resolveBrowseCategorySlug('isletme-devret')).toBe('isletme-devri');
    expect(resolveBrowseCategorySlug('isletme-devral')).toBe('isletme-devri');
    expect(resolveCategorySlug('isletme-devri')?.slug).toBe('isletme-devri');

    const browseEntry = resolveBrowseCategory('isletme-devri');
    expect(browseEntry).toBeDefined();
    expect(browseEntry?.appCategoryId).toBe(CATEGORY_IDS.isletmeDevri);
    expect(browseEntry?.filterListingTypeIds).toContain(LISTING_TYPE_IDS.businessTransferSellDefault);
    expect(browseEntry?.filterListingTypeIds).toContain(LISTING_TYPE_IDS.businessTransferBuyDefault);
  });

  it('builds valid create/update schemas and defaults for sell flow', () => {
    const sellType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferSellDefault)!;
    const createSchema = buildCreateListingFormSchema(sellType.fieldSchema);
    const updateSchema = buildUpdateListingFormSchema(sellType.fieldSchema);
    const defaults = getListingFormDefaults(sellType.fieldSchema);

    expect(createSchema).toBeDefined();
    expect(updateSchema).toBeDefined();
    expect(defaults).toBeDefined();
    expect(defaults.core.title).toBe('');
    expect(defaults.customFields.businessType).toBe('');
    expect(defaults.customFields.transferPrice).toBe(0);
  });

  it('builds valid create/update schemas and defaults for buy flow', () => {
    const buyType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault)!;
    const createSchema = buildCreateListingFormSchema(buyType.fieldSchema);
    const updateSchema = buildUpdateListingFormSchema(buyType.fieldSchema);
    const defaults = getListingFormDefaults(buyType.fieldSchema);

    expect(createSchema).toBeDefined();
    expect(updateSchema).toBeDefined();
    expect(defaults).toBeDefined();
    expect(defaults.core.title).toBe('');
    expect(defaults.customFields.budgetMax).toBe(0);
  });

  it('provides complete, consolidated steps for isletmeDevri form', () => {
    const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri);
    expect(steps.map((s) => s.id)).toEqual(['basics', 'financials', 'details', 'publish']);
    expect(steps[0].coreFields).toEqual(['title', 'shortDescription']);
    expect(steps[2].coreFields).toEqual(['longDescription', 'city']);
    expect(steps[3].publish).toBe(true);
  });

  it('resolves theme with amber palette for isletmeDevri', () => {
    const theme = getListingCategoryTheme(CATEGORY_IDS.isletmeDevri);
    expect(theme).toBeDefined();
    expect(theme.categoryId).toBe(CATEGORY_IDS.isletmeDevri);
    expect(theme.colorHex).toBe('#D97706');
  });
});
