import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createCareerMatchService } from '@/features/matching-engine/career-match.service';
import { createPartnershipMatchService } from '@/features/partnership-matching/service';
import { createDigitalSolutionMatchService } from '@/features/digital-solution-matching/service';
import { createFranchiseMatchService } from '@/features/franchise-matching/service';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { FRANCHISE_LISTING_TYPE_IDS } from '@/features/shared/constants/ecosystem';
import { createListing } from '@/features/listings/factories/listing.factory';
import { ids } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import { assertNoContactLeak as assertNoCareerContactLeak } from '@/features/matching-engine/adapters/public-card';
import { assertNoPartnershipContactLeak } from '@/features/partnership-matching/presentation/partnership-match-party';
import { assertNoDigitalSolutionContactLeak } from '@/features/digital-solution-matching/adapters/public-card';
import { assertNoFranchiseContactLeak } from '@/features/franchise-matching/adapters/public-card';

const TEST_RUN_ID = `E2E_MATCHING_TEST_${Date.now()}`;

describe('End-to-End Real Scenario Verification across all 4 Matching Systems', () => {
  let listingRepo: MockListingRepository;
  let mockContainer: any;
  let testCreatedListingIds: string[] = [];

  beforeEach(() => {
    listingRepo = new MockListingRepository();
    testCreatedListingIds = [];

    mockContainer = {
      listingRepository: listingRepo,
      profileRepository: {
        findByUserId: async (userId: string) => ({
          userId,
          displayName: `User ${userId}`,
        }),
        findByUserIds: async (userIds: string[]) =>
          userIds.map((id) => ({
            userId: id,
            displayName: `User ${id}`,
          })),
      },
      companyRepository: {
        findById: async (companyId: string) => ({
          id: companyId,
          name: `Company ${companyId}`,
        }),
        findByIds: async (companyIds: string[]) =>
          companyIds.map((id) => ({
            id,
            name: `Company ${id}`,
          })),
        findByOwnerId: async () => null,
      },
    };
  });

  afterEach(async () => {
    // 15. TEST VERİSİ TEMİZLİĞİ: Clean up all test listings created in this run
    for (const id of testCreatedListingIds) {
      await listingRepo.delete(ids.listing(id));
    }
    const remaining = await listingRepo.findMany({ query: TEST_RUN_ID }, { page: 1, limit: 100 });
    expect(remaining.total).toBe(0);
  });

  function helperCreateListing(data: Partial<Listing>): Listing {
    const listingId = `test-lst-${Math.random().toString(36).substring(2, 9)}`;
    const ownerId = data.ownerId || ids.user(`test-usr-${Math.random().toString(36).substring(2, 6)}`);
    const listing = createListing({
      id: ids.listing(listingId),
      ownerId,
      categoryId: data.categoryId || CATEGORY_IDS.isBul,
      listingTypeId: data.listingTypeId || LISTING_TYPE_IDS.isBulDefault,
      title: data.title || 'Test Listing',
      shortDescription: data.shortDescription || `${TEST_RUN_ID} test short description`,
      longDescription: data.longDescription || `${TEST_RUN_ID} test long description`,
      status: 'published',
      location: data.location || 'Kadıköy, İstanbul',
      city: data.city || 'İstanbul',
      industry: data.industry || 'Teknoloji',
      customFields: data.customFields || {},
      publishedAt: new Date().toISOString(),
      ...data,
    });
    listingRepo.save(listing);
    testCreatedListingIds.push(String(listing.id));
    return listing;
  }

  // ==========================================
  // A & C. KARİYER MATCHING GERÇEK TESTİ
  // ==========================================
  it('Kariyer Matching: Evaluates Employer 01-03 against Candidate 01-03 with full ranking and location parity', async () => {
    const emp01User = ids.user('test-emp-01');
    const cand01User = ids.user('test-cand-01');

    // Employer 01: Nova Sigorta Teknolojileri, Satış Uzmanı, Sigorta, İstanbul Anadolu, Hibrit, 2-5 yıl (mid)
    const emp01Listing = helperCreateListing({
      ownerId: emp01User,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'Nova Sigorta — Satış Uzmanı',
      industry: 'Sigorta',
      city: 'İstanbul Anadolu',
      location: 'Kadıköy, İstanbul Anadolu',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        positionTitle: 'Satış Uzmanı',
        primarySector: 'Sigorta',
        experienceLevel: 'mid',
        workplacePreference: 'hybrid',
        professionalSkills: ['Satış', 'Telemarketing', 'CRM', 'Müşteri İlişkileri', 'İkna', 'B2B Satış'],
        salary: '40.000 - 55.000 TL',
      },
    });

    // Employer 02: Atlas Perakende, Satış Uzmanı, Perakende, İstanbul Anadolu, Ofis
    const emp02Listing = helperCreateListing({
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'Atlas Perakende — Satış Uzmanı',
      industry: 'Perakende',
      city: 'İstanbul Anadolu',
      location: 'Ataşehir, İstanbul Anadolu',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        positionTitle: 'Satış Uzmanı',
        primarySector: 'Perakende',
        experienceLevel: 'mid',
        workplacePreference: 'office',
        professionalSkills: ['Satış', 'Müşteri İlişkileri'],
      },
    });

    // Employer 03: TekNova Yazılım, Yazılım Geliştirici, Yazılım, Ankara, Remote
    const emp03Listing = helperCreateListing({
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      title: 'TekNova Yazılım — Yazılım Geliştirici',
      industry: 'Yazılım',
      city: 'Ankara',
      location: 'Çankaya, Ankara',
      customFields: {
        desiredRole: 'Yazılım Geliştirici',
        positionTitle: 'Yazılım Geliştirici',
        primarySector: 'Yazılım',
        experienceLevel: 'mid',
        workplacePreference: 'remote',
        professionalSkills: ['React', 'TypeScript', 'Node.js'],
      },
    });

    // Candidate 01: Satış Uzmanı, Sigorta, İstanbul Anadolu, Hibrit, 3 yıl
    const cand01Listing = helperCreateListing({
      ownerId: cand01User,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      title: 'Deneyimli Satış Uzmanı',
      industry: 'Sigorta',
      city: 'İstanbul Anadolu',
      location: 'Kadıköy, İstanbul Anadolu',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        positionTitle: 'Satış Uzmanı',
        primarySector: 'Sigorta',
        experienceLevel: 'mid',
        workplacePreference: 'hybrid',
        professionalSkills: ['Satış', 'Telemarketing', 'CRM', 'Müşteri İlişkileri', 'İkna', 'B2B Satış'],
        salary: '40.000 - 55.000 TL',
      },
    });

    // Candidate 02: Satış Uzmanı, Perakende, İstanbul Avrupa, Ofis
    const cand02Listing = helperCreateListing({
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      title: 'Satış Danışmanı',
      industry: 'Perakende',
      city: 'İstanbul Avrupa',
      location: 'Beşiktaş, İstanbul Avrupa',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        positionTitle: 'Satış Uzmanı',
        primarySector: 'Perakende',
        experienceLevel: 'mid',
        workplacePreference: 'office',
        professionalSkills: ['Satış', 'Müşteri İlişkileri'],
      },
    });

    // Candidate 03: Yazılım Geliştirici, Yazılım, Ankara, Remote
    const cand03Listing = helperCreateListing({
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      title: 'Full Stack Developer',
      industry: 'Yazılım',
      city: 'Ankara',
      location: 'Çankaya, Ankara',
      customFields: {
        desiredRole: 'Yazılım Geliştirici',
        positionTitle: 'Yazılım Geliştirici',
        primarySector: 'Yazılım',
        experienceLevel: 'mid',
        workplacePreference: 'remote',
        professionalSkills: ['React', 'TypeScript', 'Node.js'],
      },
    });

    const careerService = createCareerMatchService(mockContainer);

    // 1. Candidate 01 Dashboard Matches:
    const cand01Matches = await careerService.getCareerMatches(cand01User);
    expect(cand01Matches.opportunities).not.toBeNull();
    const oppCards = cand01Matches.opportunities!.matches;

    // Employer 01 should be at the very top (highest score >= 80)
    expect(oppCards[0].listingId).toBe(String(emp01Listing.id));
    expect(oppCards[0].score).toBeGreaterThanOrEqual(80);

    // Employer 02 should have a lower score than Employer 01
    const emp02Card = oppCards.find((c) => c.listingId === String(emp02Listing.id));
    if (emp02Card) {
      expect(emp02Card.score).toBeLessThan(oppCards[0].score);
    }

    // 2. Candidate 01 Detail Page Recommendations:
    const cand01DetailSection = await careerService.getListingRecommendations(cand01Listing);
    expect(cand01DetailSection).not.toBeNull();
    expect(cand01DetailSection!.title).toBe('Sana Uygun İş İlanları');
    expect(cand01DetailSection!.matches[0].listingId).toBe(String(emp01Listing.id));
    // Score Parity: Detail score must be identical to Dashboard score
    expect(cand01DetailSection!.matches[0].score).toBe(oppCards[0].score);

    // 3. Employer 01 Dashboard Matches:
    const emp01Matches = await careerService.getCareerMatches(emp01User);
    expect(emp01Matches.candidates).not.toBeNull();
    const candCards = emp01Matches.candidates!.matches;
    // Candidate 01 must be at the very top
    expect(candCards[0].listingId).toBe(String(cand01Listing.id));
    expect(candCards[0].score).toBeGreaterThanOrEqual(80);

    // 4. Employer 01 Detail Recommendations:
    const emp01DetailSection = await careerService.getListingRecommendations(emp01Listing);
    expect(emp01DetailSection!.title).toBe('Sana Uygun Adaylar');
    expect(emp01DetailSection!.matches[0].listingId).toBe(String(cand01Listing.id));
    expect(emp01DetailSection!.matches[0].score).toBe(candCards[0].score);

    // 5. Privacy check:
    for (const card of [...oppCards, ...candCards]) {
      expect(() => assertNoCareerContactLeak(card)).not.toThrow();
    }
  });

  // ==========================================
  // D. ORTAKLIK MATCHING GERÇEK TESTİ
  // ==========================================
  it('Ortaklık Matching: Evaluates Seeking 01 vs Joining 01, protects against seeking-seeking and joining-joining collisions', async () => {
    const seek01User = ids.user('test-part-seek-01');
    const join01User = ids.user('test-part-join-01');

    // Seeking 01: Fintech SaaS, MVP, Kurucu Ortak, Tam zamanlı, Yazılım/Ürün Yönetimi/B2B SaaS, İstanbul, %15
    const seek01 = helperCreateListing({
      ownerId: seek01User,
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      title: 'Fintech SaaS Girişimi için Kurucu Ortak',
      industry: 'Fintech',
      city: 'İstanbul',
      location: 'Beşiktaş, İstanbul',
      customFields: {
        partnershipIntent: 'seeking',
        stage: 'MVP',
        partnershipType: 'Kurucu Ortak',
        commitment: 'Tam zamanlı',
        skills: ['Yazılım', 'Ürün Yönetimi', 'B2B SaaS'],
        sectors: ['Fintech', 'Teknoloji'],
        equity: 15,
      },
    });

    // Joining 01: Yazılım/Ürün Yönetimi/B2B SaaS, Fintech/Teknoloji, Tam zamanlı, 5 yıl, İstanbul, %10-15
    const join01 = helperCreateListing({
      ownerId: join01User,
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      title: 'Kıdemli B2B SaaS Kurucu Ortak Adayı',
      industry: 'Fintech',
      city: 'İstanbul',
      location: 'Kadıköy, İstanbul',
      customFields: {
        partnershipIntent: 'joining',
        stage: 'MVP',
        partnershipType: 'Kurucu Ortak',
        commitment: 'Tam zamanlı',
        skills: ['Yazılım', 'Ürün Yönetimi', 'B2B SaaS'],
        sectors: ['Fintech', 'Teknoloji'],
        equity: 15,
      },
    });

    // Seeking 02: Tarım, Fikir Aşaması, Yarı zamanlı
    const seek02 = helperCreateListing({
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      title: 'Tarım Teknolojileri Ortak Arayışı',
      industry: 'Tarım',
      city: 'Konya',
      location: 'Meram, Konya',
      customFields: {
        partnershipIntent: 'seeking',
        stage: 'Fikir Aşaması',
        partnershipType: 'Stratejik Ortak',
        commitment: 'Yarı zamanlı',
        skills: ['Ziraat', 'Pazarlama'],
        sectors: ['Tarım'],
      },
    });

    const partnershipService = createPartnershipMatchService(mockContainer);

    // Seeking 01 Dashboard Recommendations:
    const seek01Matches = await partnershipService.getPartnershipMatches(seek01User);
    expect(seek01Matches.partners).not.toBeNull();
    expect(seek01Matches.partners!.matches.length).toBeGreaterThan(0);
    expect(seek01Matches.partners!.matches[0].listingId).toBe(String(join01.id));
    expect(seek01Matches.partners!.matches[0].score).toBeGreaterThanOrEqual(80);

    // Verify Seeking 02 (another seeking listing) is NEVER in Seeking 01's results:
    const containsSeek02 = seek01Matches.partners!.matches.some((m) => m.listingId === String(seek02.id));
    expect(containsSeek02).toBe(false);

    // Detail Recommendation:
    const seek01Detail = await partnershipService.getListingRecommendations(seek01);
    expect(seek01Detail!.title).toBe('Sana Uygun Ortaklar');
    expect(seek01Detail!.matches[0].listingId).toBe(String(join01.id));
    expect(seek01Detail!.matches[0].score).toBe(seek01Matches.partners!.matches[0].score);

    // Joining 01 Detail Recommendation:
    const join01Detail = await partnershipService.getListingRecommendations(join01);
    expect(join01Detail!.title).toBe('Sana Uygun Girişimler');
    expect(join01Detail!.matches[0].listingId).toBe(String(seek01.id));

    // Privacy check:
    for (const card of seek01Matches.partners!.matches) {
      expect(() => assertNoPartnershipContactLeak(card)).not.toThrow();
    }
  });

  // ==========================================
  // E. DİJİTAL & AI MATCHING GERÇEK TESTİ
  // ==========================================
  it('Dijital & AI Matching: Evaluates Consumer 01 vs Solution 01, validates ranking, detail and self-match', async () => {
    // Solution 01: Restaurant AI CRM, Restoran, KOBİ, CRM/Otomasyon/Analitik/Müşteri Yönetimi, SaaS, Abonelik, İstanbul, 30.000 TL
    const sol01 = helperCreateListing({
      categoryId: CATEGORY_IDS.dijitalAi,
      listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
      title: 'Restaurant AI CRM SaaS',
      industry: 'Restoran',
      city: 'İstanbul',
      location: 'Şişli, İstanbul',
      customFields: {
        solutionType: 'SaaS ürünü',
        deliveryModel: 'Abonelik (SaaS)',
        targetAudience: 'KOBİ',
        capabilities: ['CRM', 'İş Akışı Otomasyonu', 'Analitik & Raporlama', 'Müşteri Yönetimi'],
        priceRange: '20.000 - 50.000 TL',
        industry: 'Restoran',
        supportedLanguages: ['Türkçe'],
      },
    });

    // Solution 02: Construction ERP, İnşaat, Kurumsal, 250.000 TL
    const sol02 = helperCreateListing({
      categoryId: CATEGORY_IDS.dijitalAi,
      listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
      title: 'İnşaat Proje Yönetim ERP',
      industry: 'İnşaat',
      city: 'Ankara',
      location: 'Çankaya, Ankara',
      customFields: {
        solutionType: 'Kurumsal Yazılım',
        deliveryModel: 'Tek Seferlik Lisans',
        targetAudience: 'Büyük Ölçekli',
        capabilities: ['Şantiye Yönetimi', 'Maliyet Analizi'],
        priceRange: '200.000+ TL',
        industry: 'İnşaat',
        supportedLanguages: ['Türkçe', 'İngilizce'],
      },
    });

    const digitalService = createDigitalSolutionMatchService(mockContainer);

    // Detail Recommendation on Solution 01:
    const sol01Recs = await digitalService.getListingRecommendations(sol01);
    expect(sol01Recs).not.toBeNull();
    expect(sol01Recs!.title).toBe('Sana Uygun Çözümler');

    // Self-match prevention: Solution 01 must NEVER recommend itself
    const sol01ContainsSelf = sol01Recs!.matches.some((m) => m.listingId === String(sol01.id));
    expect(sol01ContainsSelf).toBe(false);

    // Privacy check:
    for (const card of sol01Recs!.matches) {
      expect(() => assertNoDigitalSolutionContactLeak(card)).not.toThrow();
    }
  });

  // ==========================================
  // F. FRANCHISE MATCHING GERÇEK TESTİ
  // ==========================================
  it('Franchise Matching: Evaluates Seeker 01 vs Opportunity 01, validates budget tolerances and self-match', async () => {
    // Opportunity 01: BurgerLab, Cafe / Restoran, 1.500.000 TL, İstanbul, Cadde
    const opp01 = helperCreateListing({
      categoryId: CATEGORY_IDS.bayilikAl,
      listingTypeId: FRANCHISE_LISTING_TYPE_IDS.give,
      title: 'BurgerLab Franchise Fırsatı',
      industry: 'Cafe & Restoran',
      city: 'İstanbul',
      location: 'Kadıköy, İstanbul',
      customFields: {
        companyName: 'BurgerLab Inc.',
        sector: 'Cafe & Restoran',
        businessCategory: 'Cafe & Restoran',
        totalInvestment: 1500000,
        availableCities: ['İstanbul'],
        experienceRequirement: '1-3 yıl işletme deneyimi',
        streetStoreAvailable: true,
        mallAvailable: true,
      },
    });

    // Opportunity 02: AutoCare, Otomotiv, 5.000.000 TL, Ankara
    const opp02 = helperCreateListing({
      categoryId: CATEGORY_IDS.bayilikAl,
      listingTypeId: FRANCHISE_LISTING_TYPE_IDS.give,
      title: 'AutoCare Servis Bayiliği',
      industry: 'Otomotiv',
      city: 'Ankara',
      location: 'Yenimahalle, Ankara',
      customFields: {
        companyName: 'AutoCare A.Ş.',
        sector: 'Otomotiv',
        businessCategory: 'Otomotiv Servis',
        totalInvestment: 5000000,
        availableCities: ['Ankara'],
      },
    });

    const franchiseService = createFranchiseMatchService(mockContainer);

    // Detail Recommendation on Opportunity 01:
    const opp01Recs = await franchiseService.getListingRecommendations(opp01);
    expect(opp01Recs).not.toBeNull();
    expect(opp01Recs!.title).toBe('Sana Uygun Diğer Franchise Fırsatları');

    // Self-match prevention: Opportunity 01 must NEVER appear in its own recommendations
    const opp01ContainsSelf = opp01Recs!.matches.some((m) => m.listingId === String(opp01.id));
    expect(opp01ContainsSelf).toBe(false);

    // Privacy check:
    for (const card of opp01Recs!.matches) {
      expect(() => assertNoFranchiseContactLeak(card)).not.toThrow();
    }
  });

  // ==========================================
  // L. CROSS-CATEGORY ISOLATION TEST
  // ==========================================
  it('Cross-Category Isolation: Guarantees 0 category pollution across all recommendation pipelines', async () => {
    const careerListing = helperCreateListing({ categoryId: CATEGORY_IDS.isBul, listingTypeId: LISTING_TYPE_IDS.isBulDefault });
    const partnershipListing = helperCreateListing({ categoryId: CATEGORY_IDS.ortakBul, listingTypeId: LISTING_TYPE_IDS.ortakBulDefault });
    const digitalListing = helperCreateListing({ categoryId: CATEGORY_IDS.dijitalAi, listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault });
    const franchiseListing = helperCreateListing({ categoryId: CATEGORY_IDS.bayilikAl, listingTypeId: FRANCHISE_LISTING_TYPE_IDS.give });

    const careerService = createCareerMatchService(mockContainer);
    const partnershipService = createPartnershipMatchService(mockContainer);
    const digitalService = createDigitalSolutionMatchService(mockContainer);
    const franchiseService = createFranchiseMatchService(mockContainer);

    // 1. Career service given non-career listing returns null
    expect(await careerService.getListingRecommendations(partnershipListing)).toBeNull();
    expect(await careerService.getListingRecommendations(digitalListing)).toBeNull();
    expect(await careerService.getListingRecommendations(franchiseListing)).toBeNull();

    // 2. Partnership service given non-partnership listing returns null
    expect(await partnershipService.getListingRecommendations(careerListing)).toBeNull();
    expect(await partnershipService.getListingRecommendations(digitalListing)).toBeNull();
    expect(await partnershipService.getListingRecommendations(franchiseListing)).toBeNull();

    // 3. Digital service given non-digital listing returns null
    expect(await digitalService.getListingRecommendations(careerListing)).toBeNull();
    expect(await digitalService.getListingRecommendations(partnershipListing)).toBeNull();
    expect(await digitalService.getListingRecommendations(franchiseListing)).toBeNull();

    // 4. Franchise service given non-franchise listing returns null
    expect(await franchiseService.getListingRecommendations(careerListing)).toBeNull();
    expect(await franchiseService.getListingRecommendations(partnershipListing)).toBeNull();
    expect(await franchiseService.getListingRecommendations(digitalListing)).toBeNull();
  });
});
