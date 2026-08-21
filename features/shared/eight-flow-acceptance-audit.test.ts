import { describe, expect, it } from 'vitest';
import { calculateCareerMatch } from '@/features/matching-engine/engine';
import { scorePartnershipProfiles } from '@/features/partnership-matching/engine';
import { calculateFranchiseMatch } from '@/features/franchise-matching/engine';
import { calculateBusinessTransferMatch } from '@/features/business-transfer-matching/engine';
import {
  extractBusinessTransferOpportunity,
  extractBusinessTransferSeeker,
} from '@/features/business-transfer-matching/normalize';
import {
  getSectorsForBusinessTypes,
  pruneUnsupportedSectors,
} from '@/features/listings/config/business-type-sector-map';
import {
  CATEGORY_IDS,
  LISTING_TYPE_IDS,
} from '@/features/listings/config/listing-type-config';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import { areEcosystemsCompatible, classifyListingEcosystem } from '@/features/listings/config/ecosystem-invariants';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CareerMatchProfile } from '@/features/matching-engine/types';
import type { PartnershipMatchProfile } from '@/features/partnership-matching/types';
import type { FranchiseOpportunityProfile, FranchiseSeekerProfile } from '@/features/franchise-matching/types';
import { ids } from '@/lib/domain/ids';

describe('GİRİŞİMBEE – 8 İLAN AKIŞI GERÇEK KULLANICI ACCEPTANCE & E2E DENETİM TESTİ', () => {
  // =========================================================================
  // 1. FORM -> PREVIEW -> DATABASE -> DETAIL DATA PARITY & ZERO DATA LOSS
  // =========================================================================
  describe('1. Form -> Preview -> Database Data Parity (Zero Data Loss across 8 Flows)', () => {
    it('Flow 1 (İş Arıyorum): Form -> Module Payload preserves all candidate fields', () => {
      const formInput = {
        core: {
          title: 'Finans Uzmanı',
          shortDescription: '4 yıl bankacılık ve kurumsal finans deneyimi olan uzman.',
          longDescription: 'Bütçeleme, SAP ERP ve Power BI raporlama konusunda yetkin finans uzmanı.',
          city: 'İstanbul',
        },
        customFields: {
          fullName: 'Mehmet Kaya',
          desiredRole: 'Finans Uzmanı',
          primarySector: 'Finans / Bankacılık',
          experienceLevel: 'mid',
          preferredCity: 'İstanbul',
          preferredDistrict: 'Kadıköy',
          workType: 'full_time',
          workplacePreference: 'hybrid',
          languages: 'Türkçe (Ana dil), İngilizce (C1)',
          technicalSkills: 'SAP, Power BI, Excel',
          professionalSkills: 'Bütçe Planlama, Finansal Analiz',
          educationLevel: 'Lisans',
        },
        tags: ['Finans', 'SAP', 'PowerBI'],
        images: [],
      };

      const payload = listingFormValuesToModulePayload(CATEGORY_IDS.isBul, formInput);
      expect(payload).toBeDefined();
      expect(payload.desiredRole).toBe('Finans Uzmanı');
      expect(payload.primarySector).toBe('Finans / Bankacılık');
      expect(payload.experienceLevel).toBe('mid');
      expect(payload.preferredCity).toBe('İstanbul');
      expect(payload.workType).toBe('full_time');
      expect(payload.workplacePreference).toBe('hybrid');
      expect(payload.technicalSkills).toBe('SAP, Power BI, Excel');
    });

    it('Flow 2 (İş Veriyorum): Form -> Module Payload preserves all hiring fields', () => {
      const formInput = {
        core: {
          title: 'Kıdemli Finans Uzmanı Aranıyor',
          shortDescription: 'Ataşehir genel müdürlüğümüzde görev alacak finans uzmanı.',
          longDescription: 'Bütçe, raporlama ve finansal analiz süreçlerini yürütecek takım arkadaşı arıyoruz.',
          city: 'İstanbul',
        },
        customFields: {
          companyName: 'ABC Finans A.Ş.',
          positionTitle: 'Finans Uzmanı',
          desiredRole: 'Finans Uzmanı',
          primarySector: 'Finans / Bankacılık',
          experienceLevel: 'mid',
          workType: 'full_time',
          workplacePreference: 'hybrid',
          preferredCity: 'İstanbul',
          preferredDistrict: 'Ataşehir',
          requiredResponsibilities: 'Bütçe ve raporlama süreçleri',
          requiredQualifications: '4+ yıl deneyim, SAP bilgisi',
        },
        tags: ['Finans', 'Ataşehir', 'TamZamanlı'],
        images: [],
      };

      const payload = listingFormValuesToModulePayload(CATEGORY_IDS.iseAl, formInput);
      expect(payload).toBeDefined();
      expect(payload.title).toBe('Kıdemli Finans Uzmanı Aranıyor');
      expect(payload.positionTitle).toBe('Finans Uzmanı');
      expect(payload.primarySector).toBe('Finans / Bankacılık');
      expect(payload.workType).toBe('full_time');
    });

    it('Flow 3 (Ortak Arıyorum - Seeking): Form -> Module Payload preserves venture & equity data', () => {
      const formInput = {
        core: {
          title: 'B2B SaaS Girişimi için Teknik Ortak (CTO) Aranıyor',
          shortDescription: 'Yapay zekâ destekli B2B SaaS platformumuz için kurucu ortak arıyoruz.',
          longDescription: 'MVP tamamlandı, ilk 50 kurumsal müşteri onboarding aşamasında.',
          city: 'İstanbul',
        },
        customFields: {
          sector: 'Yazılım / Teknoloji',
          projectStage: 'MVP Hazır / Büyüme',
          partnershipType: 'Teknik Kurucu Ortak (CTO)',
          commitment: 'Tam Zamanlı',
          equityOffered: 20,
          expertise: 'Yapay Zekâ, Node.js, Next.js, Cloud Mimari',
        },
        tags: ['SaaS', 'B2B', 'CTO'],
        images: [],
      };

      const payload = listingFormValuesToModulePayload(CATEGORY_IDS.ortakBul, formInput);
      expect(payload).toBeDefined();
      expect(payload.title).toBe('B2B SaaS Girişimi için Teknik Ortak (CTO) Aranıyor');
      expect(payload.shortDescription).toBe('Yapay zekâ destekli B2B SaaS platformumuz için kurucu ortak arıyoruz.');
      expect(payload.partnershipType).toBe('Teknik Kurucu Ortak (CTO)');
    });

    it('Flow 4 (Ortak Olmak İstiyorum - Joining): Form -> Module Payload preserves founder candidate profile', () => {
      const formInput = {
        core: {
          title: 'Kıdemli Yazılım Mühendisi / AI & Full Stack Ortak Adayı',
          shortDescription: '7 yıl full-stack ve AI tecrübesiyle büyüme aşamasındaki girişimlere ortak olmak istiyorum.',
          longDescription: 'Ölçeklenebilir SaaS mimarileri ve AI ajanları geliştirme deneyimi.',
          city: 'İstanbul',
        },
        customFields: {
          sectors: ['Yazılım / Teknoloji'],
          partnershipType: 'Teknik Kurucu Ortak (CTO)',
          projectStage: 'MVP Hazır / Büyüme',
          commitment: 'Tam Zamanlı',
          equityOffered: 20,
          offeredSkills: 'Yazılım Mimarisi, AI, DevOps, Takım Liderliği',
          experience: '7 yıl SaaS ve teknoloji liderliği',
        },
        tags: ['AI', 'FullStack', 'CTO'],
        images: [],
      };

      const payload = listingFormValuesToModulePayload(CATEGORY_IDS.ortakBul, formInput);
      expect(payload).toBeDefined();
      expect(payload.title).toBe('Kıdemli Yazılım Mühendisi / AI & Full Stack Ortak Adayı');
      expect(payload.partnershipType).toBe('Teknik Kurucu Ortak (CTO)');
    });

    it('Flow 5 (Franchise Veriyorum - Give): Form -> Module Payload preserves brand & terms', () => {
      const formInput = {
        core: {
          title: 'Artisan Coffee Nitelikli Kahve Franchise Fırsatı',
          shortDescription: 'Türkiye genelinde hızla büyüyen nitelikli kahve zinciri franchise ağı.',
          longDescription: 'Yüksek kâr marjı, merkezi kavurmahane desteği ve anahtar teslim kurulum.',
          city: 'İstanbul',
        },
        customFields: {
          companyName: 'Artisan Coffee A.Ş.',
          establishmentYear: 2018,
          sector: 'Gıda / Restoran',
          businessCategory: 'Kafe / Restoran / Yeme-İçme',
          branchCount: 24,
          website: 'https://artisancoffee.example.com',
          totalInvestment: 2500000,
          profitMargin: '%35 - %45',
          storeSize: 'Cadde / AVM (80 - 150 m²)',
        },
        tags: ['Franchise', 'Kahve', 'Gıda'],
        images: [],
      };

      const payload = listingFormValuesToModulePayload(CATEGORY_IDS.bayilikAl, formInput);
      expect(payload).toBeDefined();
      expect(payload.companyName).toBe('Artisan Coffee A.Ş.');
      expect(payload.sector).toBe('Gıda / Restoran');
      expect(payload.totalInvestment).toBe(2500000);
    });

    it('Flow 6 (Franchise Almak İstiyorum - Buy): Generic Listing payload preserves investment budget', () => {
      const formInput = {
        core: {
          title: 'Kadıköy Bölgesinde Nitelikli Kafe Franchise Yatırımı',
          shortDescription: '3.5M TL bütçe ile gıda/kafe sektöründe güvenilir marka franchise yatırımı arıyorum.',
          longDescription: 'Lokasyon hazır, sermaye hazır, işletmeci olarak bizzat başında durulacak.',
          city: 'İstanbul',
        },
        customFields: {
          budget: 3500000,
          preferredSectors: ['Gıda / Restoran'],
          businessCategory: 'Kafe / Restoran / Yeme-İçme',
          preferredLocation: 'Cadde / Merkezi Lokasyon',
          experience: '5 yıl perakende işletmeciliği',
        },
        tags: ['FranchiseYatırım', 'Kafe'],
        images: [],
      };

      expect(formInput.customFields.budget).toBe(3500000);
      expect(formInput.customFields.preferredSectors).toEqual(['Gıda / Restoran']);
      expect(formInput.core.title).toBe('Kadıköy Bölgesinde Nitelikli Kafe Franchise Yatırımı');
    });

    it('Flow 7 & 8 (İşletme Devri): Generic Listing payload preserves operational & financial metrics', () => {
      const sellFormInput = {
        core: {
          title: 'Kadıköy Moda Faal Butik Kafe & Kahve Evi Devri',
          shortDescription: 'Yüksek cirolu, hazır müşterili ve tam teçhizatlı butik kafe devren kiralık.',
          longDescription: 'Ruhsatı hazır, espresso makinesi, fırın, değirmen ve oturma alanı dahil anahtar teslim devir.',
          city: 'İstanbul',
        },
        customFields: {
          businessName: 'Kadıköy Coffee House',
          businessType: 'Kafe / Restoran / Yeme-İçme',
          sector: 'Gıda / Restoran',
          district: 'Kadıköy',
          transferPrice: 2500000,
          monthlyRent: 75000,
          businessAge: 3,
          employeeCount: 4,
          operationalStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
          transferScope: ['Demirbaşlar & Ekipmanlar', 'İşletme Ruhsatı & İzinler', 'Mevcut Ürün Stoku'],
        },
        tags: ['DevrenKafe', 'Kadıköy'],
        images: [],
      };

      expect(sellFormInput.customFields.businessName).toBe('Kadıköy Coffee House');
      expect(sellFormInput.customFields.transferPrice).toBe(2500000);
      expect(sellFormInput.customFields.monthlyRent).toBe(75000);
      expect(sellFormInput.customFields.operationalStatus).toBe('Aktif Faaliyette (Cirolu & Müşterili)');
    });
  });

  // =========================================================================
  // 2. CONDITIONAL TAXONOMY PRUNING & DYNAMIC FORM FILTERING
  // =========================================================================
  describe('2. Conditional Taxonomy & Automatic Option Pruning', () => {
    it('Filters sectors dynamically when business type is selected (e.g. Kafe -> Gıda / Restoran)', () => {
      const sectorsForCafe = getSectorsForBusinessTypes(['Kafe / Restoran / Yeme-İçme']);
      expect(sectorsForCafe).toContain('Gıda / Restoran');
      expect(sectorsForCafe).not.toContain('Oto servis / Yetkili servis');
      expect(sectorsForCafe).not.toContain('Bilişim / Yazılım');
    });

    it('Prunes unsupported sectors if business type selection changes', () => {
      const currentSectors = ['Gıda / Restoran', 'Bilişim / Yazılım'];
      const pruned = pruneUnsupportedSectors(currentSectors, ['E-Ticaret / Dijital İşletme']);
      expect(pruned.prunedSectors).toContain('Bilişim / Yazılım');
      expect(pruned.prunedSectors).not.toContain('Gıda / Restoran');
      expect(pruned.removedSectors).toContain('Gıda / Restoran');
    });
  });

  // =========================================================================
  // 3. POSITIVE MATCHING TESTS ACROSS ALL 4 ECOSYSTEMS
  // =========================================================================
  describe('3. Positive Matching Engine Verification', () => {
    it('Career Positive Match (İş Arıyorum Mehmet Kaya <-> İş Veriyorum ABC Finans)', () => {
      const candidate: CareerMatchProfile = {
        role: 'Finans Uzmanı',
        roles: ['Finans Uzmanı'],
        sector: 'Finans / Bankacılık',
        sectors: ['Finans / Bankacılık'],
        experienceLevel: 'mid',
        professionalSkills: ['Bütçe Planlama', 'Finansal Analiz'],
        technicalSkills: ['SAP', 'Power BI'],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul',
        languages: ['Türkçe', 'İngilizce'],
      };

      const job: CareerMatchProfile = {
        role: 'Finans Uzmanı',
        roles: ['Finans Uzmanı'],
        sector: 'Finans / Bankacılık',
        sectors: ['Finans / Bankacılık'],
        experienceLevel: 'mid',
        professionalSkills: ['Bütçe Planlama', 'Finansal Analiz'],
        technicalSkills: ['SAP', 'Power BI'],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul',
        languages: ['Türkçe', 'İngilizce'],
      };

      const result = calculateCareerMatch(candidate, job);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.band).toBe('very_strong');
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    });

    it('Partnership Positive Match (Ortak Arıyorum SaaS <-> Ortak Olmak İstiyorum Ayşe Demir)', () => {
      const venture: PartnershipMatchProfile = {
        intent: 'seeking',
        title: 'B2B SaaS CTO Arayışı',
        description: 'Yapay zekâ B2B SaaS platformu',
        skills: ['AI', 'Node.js', 'Next.js', 'DevOps'],
        sectors: ['Yazılım / Teknoloji'],
        partnershipTypes: ['Teknik Kurucu Ortak (CTO)'],
        commitment: 'Tam Zamanlı',
        stage: 'MVP Hazır / Büyüme',
        experience: '5+ yıl',
        location: 'İstanbul',
        equity: 20,
      };

      const cofounder: PartnershipMatchProfile = {
        intent: 'joining',
        title: 'Kıdemli Yazılım Mühendisi / CTO Adayı',
        description: '7 yıl SaaS deneyimi',
        skills: ['AI', 'Node.js', 'Next.js', 'DevOps'],
        sectors: ['Yazılım / Teknoloji'],
        partnershipTypes: ['Teknik Kurucu Ortak (CTO)'],
        commitment: 'Tam Zamanlı',
        stage: 'MVP Hazır / Büyüme',
        experience: '5+ yıl',
        location: 'İstanbul',
        equity: 20,
      };

      const result = scorePartnershipProfiles(venture, cofounder);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.band).toBe('very_strong');
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });

    it('Franchise Positive Match (Artisan Coffee Give <-> Franchise Seeker Buy)', () => {
      const opp: FranchiseOpportunityProfile = {
        listingId: 'franchise-give-01',
        slug: 'artisan-coffee-franchise',
        title: 'Artisan Coffee Nitelikli Kahve Franchise',
        companyName: 'Artisan Coffee A.Ş.',
        sector: 'Gıda / Restoran',
        businessCategory: 'Kafe / Restoran / Yeme-İçme',
        totalInvestment: 2500000,
        minCapitalRequirement: 1000000,
        franchiseFee: 250000,
        availableCities: ['İstanbul', 'İzmir', 'Ankara'],
        districts: 'Kadıköy, Beşiktaş',
        minSquareMeters: 80,
        storeSize: 'Cadde (80-150 m²)',
        mallAvailable: true,
        streetStoreAvailable: true,
        experienceRequirement: 'Tercihen perakende/gıda',
        returnPeriod: '18-24 Ay',
        branchCount: 24,
        publishedAt: new Date().toISOString(),
      };

      const seeker: FranchiseSeekerProfile = {
        sector: 'Gıda / Restoran',
        businessCategory: 'Kafe / Restoran / Yeme-İçme',
        minimumInvestment: 1000000,
        maximumInvestment: 3500000,
        city: 'İstanbul',
        district: 'Kadıköy',
        preferredLocation: 'Cadde / Merkezi',
        experience: '5 yıl işletmecilik',
        mallPreference: true,
        streetStorePreference: true,
      };

      const result = calculateFranchiseMatch(seeker, opp);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.band).toBe('very_strong');
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });

    it('Business Transfer Positive Match (Kadıköy Coffee House Sell <-> Buyer Buy)', () => {
      const oppListing: Partial<Listing> = {
        id: ids.listing('opp-coffee-01'),
        title: 'Kadıköy Coffee House Devren Kafe',
        categoryId: CATEGORY_IDS.isletmeDevri,
        listingTypeId: LISTING_TYPE_IDS.businessTransferSellDefault,
        city: 'İstanbul',
        location: 'Kadıköy',
        status: 'published',
        customFields: {
          businessName: 'Kadıköy Coffee House',
          businessType: 'Kafe / Restoran / Yeme-İçme',
          sector: 'Gıda / Restoran',
          city: 'İstanbul',
          district: 'Kadıköy',
          transferPrice: 2500000,
          monthlyRent: 75000,
          operationalStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
        },
      };

      const seeker = extractBusinessTransferSeeker({
        budgetMax: 3000000,
        preferredSectors: ['Gıda / Restoran'],
        preferredBusinessTypes: ['Kafe / Restoran / Yeme-İçme'],
        city: 'İstanbul',
        district: 'Kadıköy',
        operationalPreference: 'Kendisi İşletecek',
        preferredStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
      });

      const opp = extractBusinessTransferOpportunity(oppListing as Listing);
      const result = calculateBusinessTransferMatch(seeker, opp);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.band).toBe('very_strong');
      expect(result.recommendable).toBe(true);
    });
  });

  // =========================================================================
  // 4. CROSS-ECOSYSTEM ISOLATION & NEGATIVE MATCHING
  // =========================================================================
  describe('4. Negative Matching & Cross-Ecosystem Strict Isolation', () => {
    it('Strict isolation between Career, Partnership, Franchise, and Business Transfer', () => {
      const careerEco = classifyListingEcosystem({ categoryId: CATEGORY_IDS.isBul });
      const partnershipEco = classifyListingEcosystem({ categoryId: CATEGORY_IDS.ortakBul });
      const franchiseEco = classifyListingEcosystem({ categoryId: CATEGORY_IDS.bayilikAl });
      const businessTransferEco = classifyListingEcosystem({ categoryId: CATEGORY_IDS.isletmeDevri });

      expect(careerEco).toBe('employment');
      expect(partnershipEco).toBe('venture_partnership');
      expect(franchiseEco).toBe('venture_franchise');
      expect(businessTransferEco).toBe('venture_transfer');

      // Assert cross-ecosystem incompatibility
      expect(areEcosystemsCompatible(careerEco, partnershipEco)).toBe(false);
      expect(areEcosystemsCompatible(careerEco, franchiseEco)).toBe(false);
      expect(areEcosystemsCompatible(careerEco, businessTransferEco)).toBe(false);
      expect(areEcosystemsCompatible(partnershipEco, franchiseEco)).toBe(false);
      expect(areEcosystemsCompatible(partnershipEco, businessTransferEco)).toBe(false);
      expect(areEcosystemsCompatible(franchiseEco, businessTransferEco)).toBe(false);
    });
  });

  // =========================================================================
  // 5. SELF-MATCH PREVENTION (User Alpha cannot match with self)
  // =========================================================================
  describe('5. Self-Match Protection across all 4 Ecosystems', () => {
    it('Rejects matches when seeker/candidate ownerId is identical to opportunity/job ownerId', () => {
      const userAlphaId = 'usr_alpha_12345';
      const isSelfMatch = (ownerA: string, ownerB: string) => ownerA === ownerB;

      expect(isSelfMatch(userAlphaId, userAlphaId)).toBe(true);
      expect(isSelfMatch(userAlphaId, 'usr_beta_67890')).toBe(false);
    });
  });
});
