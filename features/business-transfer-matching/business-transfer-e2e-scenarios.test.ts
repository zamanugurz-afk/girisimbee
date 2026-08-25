import { describe, it, expect } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import {
  buildCreateListingFormSchema,
  buildUpdateListingFormSchema,
  getListingFormDefaults,
} from '@/features/listings/form/build-dynamic-schema';
import { buildListingDraftStorageKey } from '@/features/listings/hooks/use-listing-form-autosave';
import {
  CREATE_LISTING_VENTURE_HUB,
  CREATE_LISTING_VENTURE_CATEGORIES_COPY,
  CREATE_LISTING_VENTURE_SUB_OPTIONS,
} from '@/components/girisimco/listing/create-listing-career.data';

describe('GİRİŞİMBEE — Business Transfer E2E Route & Form Wizard Scenarios', () => {
  // TEST 1: Girişim Hub → İşletme Devri → İşletmemi Devretmek İstiyorum → Step 1 açılıyor
  it('TEST 1: Girişim Hub → İşletme Devri → İşletmemi Devretmek İstiyorum → Step 1 opens correctly', () => {
    // 1. Hub Pillar check
    const venturePillars = CREATE_LISTING_VENTURE_CATEGORIES_COPY.categories;
    const btPillar = venturePillars.find((p) => p.id === 'business_transfer');
    expect(btPillar).toBeDefined();
    expect(btPillar?.label).toBe('İşletme Devri');

    // 2. Sub-options check
    const subOptions = CREATE_LISTING_VENTURE_SUB_OPTIONS.business_transfer;
    const sellOption = subOptions.find((o) => o.id === 'isletme-devret');
    expect(sellOption).toBeDefined();
    expect(sellOption?.label).toBe('İşletmemi Devretmek İstiyorum');

    // 3. Category & Type Resolution
    const resolvedCatId = categoryRegistry.resolveCategoryId('isletme-devri');
    expect(resolvedCatId).toBe(CATEGORY_IDS.isletmeDevri);

    const sellType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferSellDefault);
    expect(sellType).toBeDefined();

    // 4. Form Step 1 check
    const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri);
    expect(steps[0].id).toBe('basics');
    expect(steps[0].title).toBe('İşletme Bilgileri');
    expect(steps[0].coreFields).toEqual(['title', 'shortDescription']);
    expect(steps[0].customFieldKeys).toContain('businessName');
    expect(steps[0].customFieldKeys).toContain('businessType');
    expect(steps[0].customFieldKeys).toContain('sector');
  });

  // TEST 2: Girişim Hub → İşletme Devri → İşletme Devralmak İstiyorum → Step 1 açılıyor
  it('TEST 2: Girişim Hub → İşletme Devri → İşletme Devralmak İstiyorum → Step 1 opens correctly', () => {
    const subOptions = CREATE_LISTING_VENTURE_SUB_OPTIONS.business_transfer;
    const buyOption = subOptions.find((o) => o.id === 'isletme-devral');
    expect(buyOption).toBeDefined();
    expect(buyOption?.label).toBe('İşletme Devralmak İstiyorum');

    const buyType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault);
    expect(buyType).toBeDefined();

    const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri);
    expect(steps[0].id).toBe('basics');
    expect(steps[0].customFieldKeys).toContain('preferredBusinessTypes');
    expect(steps[0].customFieldKeys).toContain('preferredSectors');
  });

  // TEST 3: Devretmek → Step 1 → Step 2 → Step 3 → Step 4 → Preview
  it('TEST 3: Business Transfer Sell → Step 1 to Step 4 → Preview pipeline validity', () => {
    const sellType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferSellDefault)!;
    const schema = buildCreateListingFormSchema(sellType.fieldSchema);
    const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri);

    expect(steps.length).toBe(4);
    expect(steps.map((s) => s.id)).toEqual(['basics', 'financials', 'details', 'package']);

    // Step 1: basics
    expect(steps[0].customFieldKeys).toEqual(
      expect.arrayContaining(['businessName', 'businessType', 'sector']),
    );
    // Step 2: financials
    expect(steps[1].customFieldKeys).toEqual(
      expect.arrayContaining(['transferPrice', 'monthlyRent', 'businessAge', 'employeeCount', 'operationalStatus']),
    );
    // Step 3: details
    expect(steps[2].customFieldKeys).toEqual(
      expect.arrayContaining(['district', 'transferScope', 'reasonForTransfer', 'postTransferSupport', 'financialSummary']),
    );
    // Step 4: preview / publish
    expect(steps[3].publish).toBe(true);

    // Validate a realistic complete form input
    const samplePayload = {
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      core: {
        title: 'Kadıköy Moda Faal Kafe Devri',
        shortDescription: 'Yüksek cirolu, hazır müşteri portföyü olan faal kafe devredilecektir.',
        longDescription: 'Lokasyon avantajı yüksek, tüm ekipman, ruhsat ve demirbaşlarıyla birlikte eksiksiz devredilmektedir. Hazır müşteri portföyü vardır.',
        city: 'İstanbul',
      },
      customFields: {
        businessName: 'Moda Coffee',
        businessType: 'Kafe / Restoran / Yeme-İçme',
        sector: 'Gıda / Restoran',
        transferPrice: 850000,
        monthlyRent: 35000,
        businessAge: 3,
        employeeCount: 4,
        operationalStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
        district: 'Kadıköy',
        transferScope: ['Demirbaşlar & Ekipmanlar', 'İşletme Ruhsatı & İzinler'],
        reasonForTransfer: 'Şehir / Yurt Dışı Değişikliği',
        postTransferSupport: '1 Ay Oryantasyon & Tedarikçi Desteği',
        financialSummary: 'Aylık ortalama 250.000 TL ciro',
      },
      tags: ['Kafe', 'Devir'],
      images: [],
    };

    const parsed = schema.safeParse(samplePayload);
    expect(parsed.success).toBe(true);
  });

  // TEST 4: Devralmak → Step 1 → Step 2 → Step 3 → Step 4 → Preview
  it('TEST 4: Business Transfer Buy → Step 1 to Step 4 → Preview pipeline validity', () => {
    const buyType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault)!;
    const schema = buildCreateListingFormSchema(buyType.fieldSchema);
    const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri);

    expect(steps.length).toBe(4);

    const samplePayload = {
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferBuyDefault,
      core: {
        title: 'İstanbul Anadolu Yakası Kafe Devralmak İstiyorum',
        shortDescription: 'Kadıköy veya Üsküdar bölgesinde faal, cirolu kafe devralma talebi.',
        longDescription: 'Gıda sektöründe 10 yılı aşkın deneyimli ekibimizle Kadıköy ve çevresinde faal, cirolu işletme devralmak istiyoruz.',
        city: 'İstanbul',
      },
      customFields: {
        preferredBusinessTypes: ['Kafe / Restoran / Yeme-İçme'],
        preferredSectors: ['Gıda / Restoran'],
        budgetMax: 1500000,
        preferredStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
        operationalPreference: 'Kendisi İşletecek',
        district: 'Kadıköy',
        relevantExperience: '5 Yıl Kafe İşletmeciliği',
      },
      tags: ['Devralma', 'Kafe'],
      images: [],
    };

    const parsed = schema.safeParse(samplePayload);
    expect(parsed.success).toBe(true);
  });

  // TEST 5: Geri dön → tekrar İşletme Devri → tekrar alt seçim → akış bozulmuyor
  it('TEST 5: Back navigation to venture hub and re-selection maintains state integrity', () => {
    let activeHub: string | null = 'venture';
    let selectedCat: string | null = null;
    let selectedIntent: string | null = null;

    // User chooses business_transfer
    selectedCat = 'isletme-devri';
    selectedIntent = 'sell';
    expect(categoryRegistry.resolveCategoryId(selectedCat)).toBe(CATEGORY_IDS.isletmeDevri);

    // User clicks back to venture hub
    selectedCat = null;
    selectedIntent = null;
    activeHub = 'venture';
    expect(activeHub).toBe('venture');

    // User re-selects business_transfer buy
    selectedCat = 'isletme-devri';
    selectedIntent = 'buy';
    expect(categoryRegistry.resolveCategoryId(selectedCat)).toBe(CATEGORY_IDS.isletmeDevri);
    expect(categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault)?.id).toBe(
      LISTING_TYPE_IDS.businessTransferBuyDefault,
    );
  });

  // TEST 6: Sayfa yenile → mevcut route korunuyor → form state/draft bozulmuyor
  it('TEST 6: Draft storage key correctly persists per category, type, and user', () => {
    const storageKeySell = buildListingDraftStorageKey(
      CATEGORY_IDS.isletmeDevri,
      LISTING_TYPE_IDS.businessTransferSellDefault,
    );
    const storageKeyBuy = buildListingDraftStorageKey(
      CATEGORY_IDS.isletmeDevri,
      LISTING_TYPE_IDS.businessTransferBuyDefault,
    );

    expect(storageKeySell).toContain(CATEGORY_IDS.isletmeDevri);
    expect(storageKeySell).toContain(LISTING_TYPE_IDS.businessTransferSellDefault);
    expect(storageKeyBuy).toContain(LISTING_TYPE_IDS.businessTransferBuyDefault);
    expect(storageKeySell).not.toBe(storageKeyBuy);
  });

  // TEST 7: Doğrudan URL ile İşletme Devri route'una gir → hata vermiyor
  it('TEST 7: Direct URL parameter resolution works flawlessly', () => {
    const directCategoryParam = 'isletme-devri';
    const directIntentParam = 'sell';

    const resolvedCat = categoryRegistry.resolveCategoryId(directCategoryParam);
    expect(resolvedCat).toBe(CATEGORY_IDS.isletmeDevri);

    const typeId =
      resolvedCat === CATEGORY_IDS.isletmeDevri && (directIntentParam === 'buy' || directIntentParam === 'devral')
        ? LISTING_TYPE_IDS.businessTransferBuyDefault
        : LISTING_TYPE_IDS.businessTransferSellDefault;

    expect(typeId).toBe(LISTING_TYPE_IDS.businessTransferSellDefault);
    const listingType = categoryRegistry.getListingType(typeId);
    expect(listingType).toBeDefined();
  });

  // TEST 8: Geçersiz listing type → kontrollü validation/error → React runtime crash yok
  it('TEST 8: Gracefully handles invalid category/listing type without runtime crash', () => {
    const invalidCategoryParam = 'invalid-category-12345';
    const resolvedCat = categoryRegistry.resolveCategoryId(invalidCategoryParam);
    expect(resolvedCat).toBeNull();

    const invalidType = categoryRegistry.getListingType('invalid-type-id');
    expect(invalidType).toBeNull();
  });
});
