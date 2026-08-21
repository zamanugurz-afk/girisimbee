import { describe, expect, it } from 'vitest';
import {
  areEcosystemsCompatible,
  classifyListingEcosystem,
} from '@/features/listings/config/ecosystem-invariants';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { CareerMatchService } from '@/features/matching-engine/career-match.service';
import { PartnershipMatchService } from '@/features/partnership-matching/service';
import { FranchiseMatchService } from '@/features/franchise-matching/service';
import { BusinessTransferMatchService } from '@/features/business-transfer-matching/service';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';

function createMockListing(overrides: Partial<Listing>): Listing {
  return {
    id: ids.listing(`list-${Math.random().toString(36).slice(2, 8)}`),
    ownerId: ids.user('usr-001'),
    title: 'Test Listing',
    slug: 'test-listing',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Listing;
}

describe('GİRİŞİMBEE — Cross-Ecosystem Invariant & Negative Matching Test Suite', () => {
  // 1. Listings classification
  const jobSeekListing = createMockListing({
    categoryId: CATEGORY_IDS.isBul,
    listingTypeId: LISTING_TYPE_IDS.isBulDefault,
    moduleKey: 'candidates',
    title: 'Kıdemli Yazılım Geliştirici (İş Arıyorum)',
  });

  const jobHireListing = createMockListing({
    categoryId: CATEGORY_IDS.iseAl,
    listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
    moduleKey: 'employers',
    title: 'Frontend Developer Aranıyor (İş Veriyorum)',
  });

  const partnerSeekListing = createMockListing({
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title: 'Fintech Girişimi İçin CTO (Ortak Arıyorum)',
    customFields: { partnershipIntent: 'seeking' },
  });

  const partnerJoinListing = createMockListing({
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title: '10 Yıl B2B Satış Deneyimi (Ortak Olmak İstiyorum)',
    customFields: { partnershipIntent: 'joining' },
  });

  const franchiseGiveListing = createMockListing({
    categoryId: CATEGORY_IDS.bayilikAl,
    listingTypeId: FRANCHISE_LISTING_TYPE_IDS.give,
    moduleKey: 'franchise',
    title: 'Kahve Zinciri Franchise Fırsatı (Franchise Veriyorum)',
  });

  const franchiseBuyListing = createMockListing({
    categoryId: CATEGORY_IDS.bayilikAl,
    listingTypeId: FRANCHISE_LISTING_TYPE_IDS.buy,
    moduleKey: 'franchise',
    title: '5 Milyon TL Bütçeli Yatırımcı (Franchise Almak İstiyorum)',
  });

  const transferSellListing = createMockListing({
    categoryId: CATEGORY_IDS.isletmeDevri,
    listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
    title: 'Kadıköy Faal Kafe Devri (İşletmemi Devretmek İstiyorum)',
  });

  const transferBuyListing = createMockListing({
    categoryId: CATEGORY_IDS.isletmeDevri,
    listingTypeId: LISTING_TYPE_IDS.businessTransferBuyDefault,
    title: '2 Milyon TL Bütçeli Restoran Devralma (İşletme Devralmak İstiyorum)',
  });

  describe('Ecosystem Invariant Classification', () => {
    it('classifies Employment listings correctly', () => {
      expect(classifyListingEcosystem(jobSeekListing)).toBe('employment');
      expect(classifyListingEcosystem(jobHireListing)).toBe('employment');
    });

    it('classifies Venture Partnership listings correctly', () => {
      expect(classifyListingEcosystem(partnerSeekListing)).toBe('venture_partnership');
      expect(classifyListingEcosystem(partnerJoinListing)).toBe('venture_partnership');
    });

    it('classifies Venture Franchise listings correctly', () => {
      expect(classifyListingEcosystem(franchiseGiveListing)).toBe('venture_franchise');
      expect(classifyListingEcosystem(franchiseBuyListing)).toBe('venture_franchise');
    });

    it('classifies Venture Business Transfer listings correctly', () => {
      expect(classifyListingEcosystem(transferSellListing)).toBe('venture_transfer');
      expect(classifyListingEcosystem(transferBuyListing)).toBe('venture_transfer');
    });
  });

  describe('Negative Cross-Ecosystem Compatibility Boundary', () => {
    it('NEGATIVE: İş Arıyorum ↛ Ortak Arıyorum', () => {
      expect(areEcosystemsCompatible(jobSeekListing, partnerSeekListing)).toBe(false);
    });

    it('NEGATIVE: İş Arıyorum ↛ Ortak Olmak İstiyorum', () => {
      expect(areEcosystemsCompatible(jobSeekListing, partnerJoinListing)).toBe(false);
    });

    it('NEGATIVE: İş Arıyorum ↛ Franchise Veriyorum', () => {
      expect(areEcosystemsCompatible(jobSeekListing, franchiseGiveListing)).toBe(false);
    });

    it('NEGATIVE: İş Arıyorum ↛ Franchise Almak İstiyorum', () => {
      expect(areEcosystemsCompatible(jobSeekListing, franchiseBuyListing)).toBe(false);
    });

    it('NEGATIVE: İş Arıyorum ↛ İşletmemi Devretmek İstiyorum', () => {
      expect(areEcosystemsCompatible(jobSeekListing, transferSellListing)).toBe(false);
    });

    it('NEGATIVE: İş Arıyorum ↛ İşletme Devralmak İstiyorum', () => {
      expect(areEcosystemsCompatible(jobSeekListing, transferBuyListing)).toBe(false);
    });

    it('NEGATIVE: İş Veriyorum ↛ all Venture Listings', () => {
      expect(areEcosystemsCompatible(jobHireListing, partnerSeekListing)).toBe(false);
      expect(areEcosystemsCompatible(jobHireListing, partnerJoinListing)).toBe(false);
      expect(areEcosystemsCompatible(jobHireListing, franchiseGiveListing)).toBe(false);
      expect(areEcosystemsCompatible(jobHireListing, franchiseBuyListing)).toBe(false);
      expect(areEcosystemsCompatible(jobHireListing, transferSellListing)).toBe(false);
      expect(areEcosystemsCompatible(jobHireListing, transferBuyListing)).toBe(false);
    });

    it('NEGATIVE: Ortaklık ↛ Employment Listings', () => {
      expect(areEcosystemsCompatible(partnerSeekListing, jobSeekListing)).toBe(false);
      expect(areEcosystemsCompatible(partnerJoinListing, jobHireListing)).toBe(false);
    });

    it('NEGATIVE: Franchise ↛ Employment Listings', () => {
      expect(areEcosystemsCompatible(franchiseGiveListing, jobSeekListing)).toBe(false);
      expect(areEcosystemsCompatible(franchiseBuyListing, jobHireListing)).toBe(false);
    });

    it('NEGATIVE: İşletme Devri ↛ Employment Listings', () => {
      expect(areEcosystemsCompatible(transferSellListing, jobSeekListing)).toBe(false);
      expect(areEcosystemsCompatible(transferBuyListing, jobHireListing)).toBe(false);
    });

    it('POSITIVE: Intra-ecosystem listings are compatible', () => {
      expect(areEcosystemsCompatible(jobSeekListing, jobHireListing)).toBe(true);
      expect(areEcosystemsCompatible(partnerSeekListing, partnerJoinListing)).toBe(true);
      expect(areEcosystemsCompatible(franchiseGiveListing, franchiseBuyListing)).toBe(true);
      expect(areEcosystemsCompatible(transferSellListing, transferBuyListing)).toBe(true);
    });
  });

  describe('Engine-Level Rejection and Exclusion Guards', () => {
    it('CareerMatchService strictly ignores all venture listings in search pool', async () => {
      const mockStore = {
        search: async () => ({
          data: [partnerSeekListing, franchiseGiveListing, transferSellListing],
          total: 3,
          page: 1,
          limit: 100,
          totalPages: 1,
        }),
        findPublished: async () => ({
          data: [partnerSeekListing, franchiseGiveListing, transferSellListing],
          total: 3,
          page: 1,
          limit: 100,
          totalPages: 1,
        }),
      };

      const careerService = new CareerMatchService(mockStore);
      const result = await careerService.getCareerMatches(ids.user('usr-001'));

      expect(result.opportunities).toBeNull();
      expect(result.candidates).toBeNull();
      expect(result.presence.seek).toBe('none');
      expect(result.presence.hire).toBe('none');
    });

    it('PartnershipMatchService strictly ignores all employment listings', async () => {
      const mockStore = {
        search: async () => ({
          data: [jobSeekListing, jobHireListing, franchiseGiveListing],
          total: 3,
          page: 1,
          limit: 100,
          totalPages: 1,
        }),
        findPublished: async () => ({
          data: [jobSeekListing, jobHireListing, franchiseGiveListing],
          total: 3,
          page: 1,
          limit: 100,
          totalPages: 1,
        }),
      };

      const partnershipService = new PartnershipMatchService(mockStore);
      const result = await partnershipService.getPartnershipMatches(ids.user('usr-001'));

      expect(result.partners).toBeNull();
      expect(result.ventures).toBeNull();
      expect(result.presence.seeking).toBe('none');
      expect(result.presence.joining).toBe('none');
    });

    it('FranchiseMatchService strictly rejects non-franchise source listings', async () => {
      const mockStore = {
        search: async () => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 }),
        findPublished: async () => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 }),
      };

      const franchiseService = new FranchiseMatchService(mockStore);
      const resJob = await franchiseService.getListingRecommendations(jobSeekListing);
      const resPartner = await franchiseService.getListingRecommendations(partnerSeekListing);
      const resTransfer = await franchiseService.getListingRecommendations(transferSellListing);

      expect(resJob).toBeNull();
      expect(resPartner).toBeNull();
      expect(resTransfer).toBeNull();
    });

    it('BusinessTransferMatchService strictly rejects non-transfer source listings', async () => {
      const mockStore = {
        search: async () => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 }),
        findPublished: async () => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 }),
      };

      const transferService = new BusinessTransferMatchService(mockStore);
      const resJob = await transferService.getListingRecommendations(jobSeekListing);
      const resHire = await transferService.getListingRecommendations(jobHireListing);
      const resPartner = await transferService.getListingRecommendations(partnerSeekListing);
      const resFranchise = await transferService.getListingRecommendations(franchiseGiveListing);

      expect(resJob).toBeNull();
      expect(resHire).toBeNull();
      expect(resPartner).toBeNull();
      expect(resFranchise).toBeNull();
    });
  });
});
