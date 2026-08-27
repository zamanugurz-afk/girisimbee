import { describe, it, expect } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS, FRANCHISE_GIVE_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import {
  CANONICAL_FRANCHISE_MODELS,
  FRANCHISE_MODEL_TO_SECTOR_MAP,
  getPrimarySectorForFranchiseModel,
  getSectorsForFranchiseModels,
  pruneUnsupportedFranchiseSectors,
  resolveCanonicalFranchiseModel,
  TRADEMARK_STATUS_OPTIONS,
  FRANCHISE_CONTRACT_OPTIONS,
  FRANCHISE_MANUAL_OPTIONS,
  STORE_LOCATION_TYPE_OPTIONS,
} from '@/features/listings/config/franchise-model-sector-map';
import { extractFranchiseListingDetails } from '@/features/franchise/lib/franchise-listing.mapper';
import { extractFranchiseOpportunityProfile } from '@/features/franchise-matching/normalize';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';

describe('GİRİŞİMBEE — Franchise Architecture, Conditional Taxonomy & Legal Compliance Tests', () => {
  // TEST 1: Konsept seçilmediğinde boş döner
  it('TEST 1: Returns null or empty when no franchise model is selected', () => {
    expect(getPrimarySectorForFranchiseModel('')).toBeNull();
    expect(getSectorsForFranchiseModels([])).toEqual([]);
    expect(getSectorsForFranchiseModels(null)).toEqual([]);
  });

  // TEST 2: Kafe / Kahve seçildiğinde Gıda / Restoran önerilir
  it('TEST 2: Selecting Coffee / Cafe concept automatically yields Gıda / Restoran primary sector', () => {
    const primary = getPrimarySectorForFranchiseModel('Kafe & Kahve Zinciri');
    expect(primary).toBe('Gıda / Restoran');

    const aliasPrimary = getPrimarySectorForFranchiseModel('kafe');
    expect(aliasPrimary).toBe('Gıda / Restoran');
  });

  // TEST 3: Oto Ekspertiz seçildiğinde Oto servis / Yetkili servis önerilir
  it('TEST 3: Selecting Auto Inspection / Service yields Oto servis / Yetkili servis primary sector', () => {
    const primary = getPrimarySectorForFranchiseModel('Oto Ekspertiz / Servis & Yıkama');
    expect(primary).toBe('Oto servis / Yetkili servis');

    const aliasPrimary = getPrimarySectorForFranchiseModel('ekspertiz');
    expect(aliasPrimary).toBe('Oto servis / Yetkili servis');
  });

  // TEST 4: Güzellik / Kuaför seçildiğinde Güzellik / Kişisel bakım önerilir
  it('TEST 4: Selecting Beauty / Hair Salon yields Güzellik / Kişisel bakım', () => {
    const primary = getPrimarySectorForFranchiseModel('Güzellik / Kuaför & Estetik Merkezi');
    expect(primary).toBe('Güzellik / Kişisel bakım');
  });

  // TEST 5: Çoklu konsept seçiminde deduplicated sektör listesi üretilir
  it('TEST 5: Selecting multiple franchise models yields deduplicated sector union', () => {
    const sectors = getSectorsForFranchiseModels([
      'Kafe & Kahve Zinciri',
      'Fast Food / Burger & Döner',
    ]);
    expect(sectors).toContain('Gıda / Restoran');
    expect(sectors).toContain('Perakende / Mağaza');
    expect(sectors).toContain('Turizm / Otelcilik');
    const uniqueSet = new Set(sectors);
    expect(uniqueSet.size).toBe(sectors.length);
  });

  // TEST 6: Konsept kaldırıldığında desteklenmeyen sektörler temizlenir
  it('TEST 6: Deselecting franchise model prunes unsupported sectors correctly', () => {
    const beforeSectors = ['Gıda / Restoran', 'Oto servis / Yetkili servis'];
    const afterModels = ['Kafe & Kahve Zinciri'];
    const { prunedSectors, removedSectors } = pruneUnsupportedFranchiseSectors(
      beforeSectors,
      afterModels,
    );

    expect(prunedSectors).toEqual(['Gıda / Restoran']);
    expect(removedSectors).toEqual(['Oto servis / Yetkili servis']);
  });

  // TEST 7: Hukuki ve uyumluluk seçenekleri standartlara uygundur
  it('TEST 7: Legal and compliance options match Turkish IP / Commercial Code requirements', () => {
    expect(TRADEMARK_STATUS_OPTIONS).toContain('Tescilli (TürkPatent)');
    expect(TRADEMARK_STATUS_OPTIONS).toContain('Başvuru / İnceleme Aşamasında');
    expect(FRANCHISE_CONTRACT_OPTIONS).toContain('Hazır ve İmzaya Uygun');
    expect(FRANCHISE_MANUAL_OPTIONS).toContain('Mevcut (Standart Operasyon Kılavuzu Var)');
    expect(STORE_LOCATION_TYPE_OPTIONS).toContain('Cadde Mağazası');
    expect(STORE_LOCATION_TYPE_OPTIONS).toContain('AVM');
  });

  // TEST 8: İlan verme adımları 4 konsolide adımdan oluşur ve gerekli alanları içerir
  it('TEST 8: Form steps contain 4 consolidated steps with core and custom compliance keys', () => {
    const steps = getListingFormSteps(CATEGORY_IDS.bayilikAl);
    expect(steps.length).toBe(4);
    expect(steps.map((s) => s.id)).toEqual(['basics', 'financials', 'details', 'package']);

    const step1Keys = steps[0]?.customFieldKeys as string[];
    expect(step1Keys).toContain('companyName');
    expect(step1Keys).toContain('franchiseModel');
    expect(step1Keys).toContain('sector');

    const step2Keys = steps[1]?.customFieldKeys as string[];
    expect(step2Keys).toContain('totalInvestment');
    expect(step2Keys).toContain('royaltyFee');
    expect(step2Keys).toContain('trainingSupport');
    expect(step2Keys).toContain('exclusiveTerritory');

    const step3Keys = steps[2]?.customFieldKeys as string[];
    expect(step3Keys).toContain('trademarkStatus');
    expect(step3Keys).toContain('contractProvided');
    expect(step3Keys).toContain('minSquareMeters');
  });

  // TEST 9: İlan mapper ve normalizer hukuki/finansal alanları kayıpsız dönüştürür
  it('TEST 9: Listing mapper and normalizer extract compliance fields losslessly', () => {
    const mockListing: Listing = {
      id: ids.listing('l1000001-0001-4000-8000-000000000099'),
      ownerId: ids.user('u1000001-0001-4000-8000-000000000001'),
      categoryId: CATEGORY_IDS.bayilikAl,
      listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
      slug: 'nitelikli-kahve-franchise',
      title: '3. Dalga Nitelikli Kahve Franchise',
      shortDescription: 'Yüksek kâr marjlı kahve franchise fırsatı',
      longDescription: 'Detaylı operasyonel şartlar ve sözleşme detayları.',
      city: 'İstanbul',
      district: 'Kadıköy',
      status: 'active',
      isPublic: true,
      customFields: {
        companyName: 'Artisan Coffee Co.',
        establishmentYear: 2018,
        franchiseModel: 'Kafe & Kahve Zinciri',
        sector: 'Gıda / Restoran',
        totalInvestment: 2500000,
        franchiseFee: 250000,
        royaltyFee: 4,
        advertisingFee: 2,
        profitMargin: 35,
        returnPeriod: '12 - 18 Ay',
        minCapitalRequirement: 1000000,
        trainingSupport: true,
        operationalSupport: true,
        marketingSupport: true,
        locationSupport: true,
        logisticsSupport: true,
        exclusiveTerritory: true,
        trademarkStatus: 'Tescilli (TürkPatent)',
        contractProvided: 'Hazır ve İmzaya Uygun',
        operatingManualProvided: 'Mevcut (Standart Operasyon Kılavuzu Var)',
        minSquareMeters: 80,
        storeLocationType: 'Cadde Mağazası',
        availableCities: ['İstanbul', 'Ankara', 'İzmir'],
      },
      createdAt: '2026-08-27T10:00:00Z',
      updatedAt: '2026-08-27T10:00:00Z',
    };

    const details = extractFranchiseListingDetails(mockListing);
    expect(details.companyName).toBe('Artisan Coffee Co.');
    expect(details.franchiseModel).toBe('Kafe & Kahve Zinciri');
    expect(details.trademarkStatus).toBe('Tescilli (TürkPatent)');
    expect(details.contractProvided).toBe('Hazır ve İmzaya Uygun');
    expect(details.exclusiveTerritory).toBe(true);
    expect(details.locationSupport).toBe(true);
    expect(details.logisticsSupport).toBe(true);

    const profile = extractFranchiseOpportunityProfile(mockListing);
    expect(profile.companyName).toBe('Artisan Coffee Co.');
    expect(profile.franchiseModel).toBe('Kafe & Kahve Zinciri');
    expect(profile.sector).toBe('Gıda / Restoran');
    expect(profile.trademarkStatus).toBe('Tescilli (TürkPatent)');
    expect(profile.contractProvided).toBe('Hazır ve İmzaya Uygun');
    expect(profile.exclusiveTerritory).toBe(true);
  });
});
