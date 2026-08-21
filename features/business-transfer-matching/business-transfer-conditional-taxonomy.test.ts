import { describe, it, expect } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  getListingFormSteps,
} from '@/features/listings/config/listing-form-steps.config';
import {
  buildCreateListingFormSchema,
  buildDraftListingFormSchema,
} from '@/features/listings/form/build-dynamic-schema';
import {
  CANONICAL_BUSINESS_TRANSFER_TYPES,
  BUSINESS_TYPE_TO_SECTOR_MAP,
  getSectorsForBusinessTypes,
  pruneUnsupportedSectors,
  resolveCanonicalBusinessType,
  areBusinessTypesRelated,
} from '@/features/listings/config/business-type-sector-map';
import { buildListingDraftStorageKey } from '@/features/listings/hooks/use-listing-form-autosave';
import { calculateBusinessTransferMatch } from '@/features/business-transfer-matching/engine';
import {
  extractBusinessTransferOpportunity,
  extractBusinessTransferSeeker,
} from '@/features/business-transfer-matching/normalize';
import { areEcosystemsCompatible, classifyListingEcosystem } from '@/features/listings/config/ecosystem-invariants';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';

describe('GİRİŞİMBEE — Business Transfer Step 1 Conditional Taxonomy & Matching (13 Tests)', () => {
  // TEST 1: Hiç işletme türü seçilmedi → sektör alanı görünmez / boş liste üretir
  it('TEST 1: When no business type is selected, sector union is empty', () => {
    const emptySectors = getSectorsForBusinessTypes([]);
    expect(emptySectors).toEqual([]);

    const nullSectors = getSectorsForBusinessTypes(undefined as unknown as string[]);
    expect(nullSectors).toEqual([]);
  });

  // TEST 2: Restoran seç → yalnızca restoranla ilişkili sektörler gelir
  it('TEST 2: Selecting Restaurant yields only restaurant-related canonical sectors', () => {
    const restaurantSectors = getSectorsForBusinessTypes(['Kafe / Restoran / Yeme-İçme']);
    expect(restaurantSectors).toContain('Gıda / Restoran');
    expect(restaurantSectors).toContain('Turizm / Otelcilik');
    expect(restaurantSectors).not.toContain('Oto servis / Yetkili servis');
    expect(restaurantSectors).not.toContain('Bilişim / Yazılım');

    // Alias resolution test
    const aliasSectors = getSectorsForBusinessTypes(['Restoran']);
    expect(aliasSectors).toEqual(restaurantSectors);
  });

  // TEST 3: E-Ticaret seç → yalnızca e-ticaretle ilişkili sektörler gelir
  it('TEST 3: Selecting E-Commerce yields only e-commerce related sectors', () => {
    const ecomSectors = getSectorsForBusinessTypes(['E-Ticaret / Dijital İşletme']);
    expect(ecomSectors).toContain('E-ticaret / Pazaryeri');
    expect(ecomSectors).toContain('Bilişim / Yazılım');
    expect(ecomSectors).toContain('Perakende / Mağaza');
    expect(ecomSectors).not.toContain('Oto servis / Yetkili servis');
    expect(ecomSectors).not.toContain('Veteriner / Pet');
  });

  // TEST 4: Restoran + E-Ticaret seç → iki taxonomy\'nin union sektörleri gelir, duplicate yok
  it('TEST 4: Selecting Restaurant + E-Commerce produces a clean union with zero duplicates', () => {
    const unionSectors = getSectorsForBusinessTypes([
      'Kafe / Restoran / Yeme-İçme',
      'E-Ticaret / Dijital İşletme',
    ]);

    expect(unionSectors).toContain('Gıda / Restoran');
    expect(unionSectors).toContain('E-ticaret / Pazaryeri');
    expect(unionSectors).toContain('Bilişim / Yazılım');
    expect(unionSectors).toContain('Perakende / Mağaza');

    // Assert zero duplicates
    const uniqueSet = new Set(unionSectors);
    expect(uniqueSet.size).toBe(unionSectors.length);
  });

  // TEST 5: Restoran seç → Gıda/Restoran seç → Restoran kaldır → desteklenmeyen sektör temizlenir
  it('TEST 5: Deselecting business type prunes unsupported sectors and reports removed sectors', () => {
    const selectedTypesBefore = ['Kafe / Restoran / Yeme-İçme', 'E-Ticaret / Dijital İşletme'];
    const selectedSectors = ['Gıda / Restoran', 'E-ticaret / Pazaryeri'];

    // User removes Restaurant, leaving only E-Commerce
    const selectedTypesAfter = ['E-Ticaret / Dijital İşletme'];
    const { prunedSectors, removedSectors } = pruneUnsupportedSectors(
      selectedSectors,
      selectedTypesAfter,
    );

    // Gıda / Restoran is not in E-Commerce, so it must be removed
    expect(prunedSectors).toEqual(['E-ticaret / Pazaryeri']);
    expect(removedSectors).toEqual(['Gıda / Restoran']);
  });

  // TEST 6: Çok sayıda işletme türü seç → sektör listesi yönetilebilir kalır
  it('TEST 6: Multiple business types selection remains strictly deduplicated and manageable', () => {
    const allTypes = CANONICAL_BUSINESS_TRANSFER_TYPES.filter((t) => t !== 'Diğer');
    const sectors = getSectorsForBusinessTypes(allTypes);

    expect(sectors.length).toBeGreaterThan(10);
    const uniqueSet = new Set(sectors);
    expect(uniqueSet.size).toBe(sectors.length);
  });

  // TEST 7: İşletme türü seçmeden ileri → validation doğru çalışır
  it('TEST 7: Form schema validation fails when required business type is missing', () => {
    const buyType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault)!;
    const schema = buildCreateListingFormSchema(buyType.fieldSchema);

    const invalidPayload = {
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferBuyDefault,
      core: {
        title: 'İstanbul Kafe Arayışı',
        shortDescription: 'Faal ve cirolu işletme devralmak istiyoruz.',
        longDescription: 'Kadıköy veya Beşiktaş çevresinde hazır müşteri portföyü olan kafe veya restoran devralmak için ilan oluşturuyoruz.',
        city: 'İstanbul',
      },
      customFields: {
        budgetMax: 1000000,
        preferredBusinessTypes: [], // Missing required selection
        operationalPreference: 'Kendisi İşletecek',
      },
      tags: [],
      images: [],
    };

    const parsed = schema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  // TEST 8: İşletme türü + sektör seç → canonical değerler doğru doğrulanır
  it('TEST 8: Valid business types and conditional sectors pass full create validation', () => {
    const buyType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault)!;
    const schema = buildCreateListingFormSchema(buyType.fieldSchema);

    const validPayload = {
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferBuyDefault,
      core: {
        title: 'Kadıköy Faal Kafe Devralmak İstiyorum',
        shortDescription: 'Kadıköy Moda civarında faal kafe devralma talebimiz bulunmaktadır.',
        longDescription: 'Gıda ve yeme-içme sektöründe deneyimli ekibimizle faal, ruhsatlı ve kurulu bir kafe devralmak istiyoruz.',
        city: 'İstanbul',
      },
      customFields: {
        preferredBusinessTypes: ['Kafe / Restoran / Yeme-İçme'],
        preferredSectors: ['Gıda / Restoran'],
        budgetMax: 1200000,
        operationalPreference: 'Kendisi İşletecek',
        district: 'Kadıköy',
        relevantExperience: '4 yıl kafe işletmeciliği',
      },
      tags: ['Kafe', 'Devir'],
      images: [],
    };

    const parsed = schema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  // TEST 9: Draft restore → businessTypes ve preferredSectors doğru geri gelir
  it('TEST 9: Draft schema restores partial businessTypes and sectors without data loss', () => {
    const buyType = categoryRegistry.getListingType(LISTING_TYPE_IDS.businessTransferBuyDefault)!;
    const draftSchema = buildDraftListingFormSchema(buyType.fieldSchema);

    const draftData = {
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferBuyDefault,
      core: {
        title: 'Taslak Kafe Talebi',
        shortDescription: '',
        longDescription: '',
        city: 'İzmir',
      },
      customFields: {
        preferredBusinessTypes: ['Kafe / Restoran / Yeme-İçme', 'E-Ticaret / Dijital İşletme'],
        preferredSectors: ['Gıda / Restoran', 'E-ticaret / Pazaryeri'],
      },
      tags: [],
      images: [],
    };

    const parsed = draftSchema.safeParse(draftData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.customFields.preferredBusinessTypes).toEqual([
        'Kafe / Restoran / Yeme-İçme',
        'E-Ticaret / Dijital İşletme',
      ]);
      expect(parsed.data.customFields.preferredSectors).toEqual([
        'Gıda / Restoran',
        'E-ticaret / Pazaryeri',
      ]);
    }
  });

  // TEST 10: Refresh → draft storage key ayrımı sağlanır
  it('TEST 10: Storage key correctly partitions transfer buy drafts by category and type', () => {
    const key = buildListingDraftStorageKey(
      CATEGORY_IDS.isletmeDevri,
      LISTING_TYPE_IDS.businessTransferBuyDefault,
    );

    expect(key).toContain(CATEGORY_IDS.isletmeDevri);
    expect(key).toContain(LISTING_TYPE_IDS.businessTransferBuyDefault);
  });

  // TEST 11: Preview → Step 1'den Step 4'e akış ve alan bütünlüğü korunur
  it('TEST 11: Form steps definition contains the correct basics and details pipeline for preview', () => {
    const steps = getListingFormSteps(CATEGORY_IDS.isletmeDevri);
    expect(steps.length).toBe(4);
    expect(steps[0].id).toBe('basics');
    expect(steps[0].customFieldKeys).toContain('preferredBusinessTypes');
    expect(steps[0].customFieldKeys).toContain('preferredSectors');
    expect(steps[3].publish).toBe(true);
  });

  // TEST 12: BusinessTransferMatchService → yeni alanları ve yakınlık modelini doğru değerlendirir
  it('TEST 12: Matching engine evaluates business types and sectors with high accuracy', () => {
    const opportunityListing: Listing = {
      id: ids.listing('opp-100'),
      ownerId: ids.user('user-seller'),
      categoryId: CATEGORY_IDS.isletmeDevri,
      listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
      slug: 'kadikoy-faal-kafe',
      title: 'Kadıköy Moda Faal Kafe',
      description: 'Hazır müşteri portföyü ile devredilecektir.',
      status: 'active',
      city: 'İstanbul',
      location: 'Kadıköy',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customFields: {
        businessName: 'Moda Kafe',
        businessType: 'Kafe / Restoran / Yeme-İçme',
        sector: 'Gıda / Restoran',
        transferPrice: 800000,
        monthlyRent: 30000,
        operationalStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
        transferScope: ['Demirbaşlar & Ekipmanlar'],
      },
    };

    const opportunity = extractBusinessTransferOpportunity(opportunityListing);

    const seeker = extractBusinessTransferSeeker({
      city: 'İstanbul',
      district: 'Kadıköy',
      budgetMax: 1000000,
      preferredBusinessTypes: ['Kafe / Restoran / Yeme-İçme'],
      preferredSectors: ['Gıda / Restoran'],
      operationalPreference: 'Kendisi İşletecek',
      preferredStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
    });

    const matchResult = calculateBusinessTransferMatch(seeker, opportunity);

    expect(matchResult.score).toBeGreaterThanOrEqual(90);
    expect(matchResult.band).toBe('very_strong');
    expect(matchResult.recommendable).toBe(true);
    const sectorDim = matchResult.dimensions.find((d) => d.key === 'sector');
    const typeDim = matchResult.dimensions.find((d) => d.key === 'businessType');
    expect(sectorDim?.score).toBe(1.0);
    expect(typeDim?.score).toBe(1.0);
  });

  // TEST 13: Cross ecosystem → Diğer ekosistemlerin matching izolasyonu etkilenmez
  it('TEST 13: Business transfer matching remains isolated from Career, Partnership, and Franchise', () => {
    const transferListing = { categoryId: CATEGORY_IDS.isletmeDevri };
    const careerListing = { categoryId: CATEGORY_IDS.isBul };
    const partnerListing = { categoryId: CATEGORY_IDS.ortakBul };
    const franchiseListing = { categoryId: CATEGORY_IDS.bayilikAl };

    expect(classifyListingEcosystem(transferListing)).toBe('venture_transfer');
    expect(classifyListingEcosystem(careerListing)).toBe('employment');
    expect(classifyListingEcosystem(partnerListing)).toBe('venture_partnership');
    expect(classifyListingEcosystem(franchiseListing)).toBe('venture_franchise');

    expect(areEcosystemsCompatible(transferListing, careerListing)).toBe(false);
    expect(areEcosystemsCompatible(transferListing, partnerListing)).toBe(false);
    expect(areEcosystemsCompatible(transferListing, franchiseListing)).toBe(false);
    expect(areEcosystemsCompatible(transferListing, transferListing)).toBe(true);
  });
});
