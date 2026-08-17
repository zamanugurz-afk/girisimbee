import { describe, expect, it } from 'vitest';
import { calculateCareerMatch } from '@/features/matching-engine/engine';
import { scorePartnershipProfiles } from '@/features/partnership-matching/engine';
import { calculateDigitalSolutionMatch } from '@/features/digital-solution-matching/engine';
import { calculateFranchiseMatch } from '@/features/franchise-matching/engine';
import type { CareerMatchProfile } from '@/features/matching-engine/types';
import type { PartnershipMatchProfile } from '@/features/partnership-matching/types';
import type { DigitalSolutionConsumerProfile, DigitalSolutionProfile } from '@/features/digital-solution-matching/types';
import type { FranchiseSeekerProfile, FranchiseOpportunityProfile } from '@/features/franchise-matching/types';
import { assertNoContactLeak as assertNoCareerContactLeak } from '@/features/matching-engine/adapters/public-card';
import { assertNoPartnershipContactLeak } from '@/features/partnership-matching/presentation/partnership-match-party';
import { assertNoDigitalSolutionContactLeak } from '@/features/digital-solution-matching/adapters/public-card';
import { assertNoFranchiseContactLeak } from '@/features/franchise-matching/adapters/public-card';

describe('Real Data QA & End-to-End Verification across all 4 Matching Systems', () => {
  // ==========================================
  // 1. KARİYER REAL SCENARIO QA
  // ==========================================
  describe('1. Kariyer Matching Real Scenarios', () => {
    const candidate: CareerMatchProfile = {
      role: 'Satış Uzmanı',
      roles: ['Satış Uzmanı'],
      sector: 'Sigorta',
      sectors: ['Sigorta'],
      experienceLevel: 'mid', // 3-5 yıl
      professionalSkills: ['Satış', 'Müşteri İlişkileri', 'İkna'],
      technicalSkills: ['CRM', 'Excel'],
      workType: 'full_time',
      workplacePreference: 'hybrid',
      city: 'İstanbul Anadolu',
      languages: ['Türkçe'],
      educationLevel: 'Lisans',
      salary: '45.000 TL',
      availability: '1 ay içinde',
    };

    it('Scenario A: Same position + same sector + same location -> Very Strong score (>= 80)', () => {
      const jobA: CareerMatchProfile = {
        role: 'Satış Uzmanı',
        roles: ['Satış Uzmanı'],
        sector: 'Sigorta',
        sectors: ['Sigorta'],
        experienceLevel: 'mid',
        professionalSkills: ['Satış', 'Müşteri İlişkileri', 'İkna'],
        technicalSkills: ['CRM', 'Excel'],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul Anadolu',
        languages: ['Türkçe'],
        educationLevel: 'Lisans',
      };

      const resA = calculateCareerMatch(candidate, jobA);
      expect(resA.score).toBeGreaterThanOrEqual(80);
      expect(resA.band).toBe('very_strong');
      expect(resA.reasons.length).toBeGreaterThanOrEqual(3);
    });

    it('Scenario B: Same position + different sector -> Score drops', () => {
      const jobA: CareerMatchProfile = {
        role: 'Satış Uzmanı',
        roles: ['Satış Uzmanı'],
        sector: 'Sigorta',
        sectors: ['Sigorta'],
        experienceLevel: 'mid',
        professionalSkills: [],
        technicalSkills: [],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul Anadolu',
        languages: [],
        educationLevel: null,
      };
      const jobB: CareerMatchProfile = {
        role: 'Satış Uzmanı',
        roles: ['Satış Uzmanı'],
        sector: 'Perakende',
        sectors: ['Perakende'],
        experienceLevel: 'mid',
        professionalSkills: [],
        technicalSkills: [],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul Anadolu',
        languages: [],
        educationLevel: null,
      };

      const resA = calculateCareerMatch(candidate, jobA);
      const resB = calculateCareerMatch(candidate, jobB);
      expect(resB.score).toBeLessThan(resA.score);
    });

    it('Scenario C: Same sector + different position -> Score drops significantly', () => {
      const jobA: CareerMatchProfile = {
        role: 'Satış Uzmanı',
        roles: ['Satış Uzmanı'],
        sector: 'Sigorta',
        sectors: ['Sigorta'],
        experienceLevel: 'mid',
        professionalSkills: ['Satış', 'Müşteri İlişkileri', 'İkna'],
        technicalSkills: ['CRM', 'Excel'],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul Anadolu',
        languages: ['Türkçe'],
        educationLevel: 'Lisans',
      };

      const jobC: CareerMatchProfile = {
        role: 'Yazılım Geliştirici',
        roles: ['Yazılım Geliştirici'],
        sector: 'Sigorta',
        sectors: ['Sigorta'],
        experienceLevel: 'mid',
        professionalSkills: ['React', 'Node.js'],
        technicalSkills: ['TypeScript', 'Git'],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul Anadolu',
        languages: ['Türkçe'],
        educationLevel: 'Lisans',
      };

      const resA = calculateCareerMatch(candidate, jobA);
      const resC = calculateCareerMatch(candidate, jobC);
      expect(resC.score).toBeLessThan(resA.score);
      expect(resC.score).toBeLessThan(60);
    });

    it('Scenario D: Istanbul Anadolu <-> Istanbul Avrupa -> 85% location factor, never filtered out', () => {
      const jobD: CareerMatchProfile = {
        role: 'Satış Uzmanı',
        roles: ['Satış Uzmanı'],
        sector: 'Sigorta',
        sectors: ['Sigorta'],
        experienceLevel: 'mid',
        professionalSkills: ['Satış'],
        technicalSkills: ['CRM'],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'İstanbul Avrupa',
        languages: [],
        educationLevel: null,
      };

      const resD = calculateCareerMatch(candidate, jobD);
      const locDim = resD.dimensions.find((d) => d.key === 'location');
      expect(locDim?.score).toBe(0.85);
      expect(resD.score).toBeGreaterThanOrEqual(75);
    });

    it('Scenario E: Istanbul <-> Ankara -> 50% location factor, not filtered out', () => {
      const jobE: CareerMatchProfile = {
        role: 'Satış Uzmanı',
        roles: ['Satış Uzmanı'],
        sector: 'Sigorta',
        sectors: ['Sigorta'],
        experienceLevel: 'mid',
        professionalSkills: ['Satış'],
        technicalSkills: ['CRM'],
        workType: 'full_time',
        workplacePreference: 'hybrid',
        city: 'Ankara',
        languages: [],
        educationLevel: null,
      };

      const resE = calculateCareerMatch(candidate, jobE);
      const locDim = resE.dimensions.find((d) => d.key === 'location');
      expect(locDim?.score).toBe(0.50);
      expect(resE.score).toBeGreaterThanOrEqual(50);
    });

    it('Scenario F: Remote -> 100% location factor', () => {
      const jobF: CareerMatchProfile = {
        role: 'Satış Uzmanı',
        roles: ['Satış Uzmanı'],
        sector: 'Sigorta',
        sectors: ['Sigorta'],
        experienceLevel: 'mid',
        professionalSkills: ['Satış'],
        technicalSkills: ['CRM'],
        workType: 'full_time',
        workplacePreference: 'remote',
        city: 'İzmir',
        languages: [],
        educationLevel: null,
      };

      const resF = calculateCareerMatch(candidate, jobF);
      const locDim = resF.dimensions.find((d) => d.key === 'location');
      expect(locDim?.score).toBe(1.0);
    });
  });

  // ==========================================
  // 2. ORTAKLIK REAL SCENARIO QA
  // ==========================================
  describe('2. Ortaklık Matching Real Scenarios', () => {
    const seekingProfile: PartnershipMatchProfile = {
      intent: 'seeking',
      title: 'Teknoloji Girişimi için Kurucu Ortak',
      description: 'Yazılım ve pazarlama yetkinliklerine sahip ortak aranıyor.',
      skills: ['Yazılım', 'Satış', 'Pazarlama'],
      sectors: ['Teknoloji'],
      partnershipTypes: ['Kurucu ortak'],
      commitment: 'Tam zamanlı',
      stage: 'MVP',
      experience: '3-5 yıl',
      location: 'İstanbul',
      equity: 20,
    };

    const joiningProfile: PartnershipMatchProfile = {
      intent: 'joining',
      title: 'Kıdemli Yazılımcı / Kurucu Ortak Olmak İstiyorum',
      description: 'Erken aşama teknoloji girişimlerine katılmak istiyorum.',
      skills: ['Yazılım'],
      sectors: ['Teknoloji'],
      partnershipTypes: ['Kurucu ortak'],
      commitment: 'Tam zamanlı',
      stage: 'MVP',
      experience: '3-5 yıl',
      location: 'İstanbul',
      equity: 20,
    };

    it('High match between compatible seeking and joining profiles', () => {
      const res = scorePartnershipProfiles(seekingProfile, joiningProfile);
      expect(res.score).toBeGreaterThanOrEqual(80);
      expect(res.band).toBe('very_strong');
      expect(res.reasons.length).toBeGreaterThanOrEqual(3);
    });

    it('Sensitivity: changing sector, commitment or stage predictably changes score', () => {
      const base = scorePartnershipProfiles(seekingProfile, joiningProfile);

      const diffSector = scorePartnershipProfiles(seekingProfile, { ...joiningProfile, sectors: ['Tarım'] });
      expect(diffSector.score).toBeLessThan(base.score);

      const diffStage = scorePartnershipProfiles(seekingProfile, { ...joiningProfile, stage: 'Büyüme (Scale-up)' });
      expect(diffStage.score).toBeLessThan(base.score);

      const diffCommitment = scorePartnershipProfiles(seekingProfile, { ...joiningProfile, commitment: 'Danışmanlık' });
      expect(diffCommitment.score).toBeLessThan(base.score);
    });

    it('Asymmetry / Direction Protection: same intent pairings do not match', () => {
      // Seeking <-> Seeking
      const resSeekingSeeking = scorePartnershipProfiles(seekingProfile, { ...seekingProfile, intent: 'seeking' });
      expect(resSeekingSeeking.score).toBe(0);
      expect(resSeekingSeeking.recommendable).toBe(false);

      // Joining <-> Joining
      const resJoiningJoining = scorePartnershipProfiles(joiningProfile, { ...joiningProfile, intent: 'joining' });
      expect(resJoiningJoining.score).toBe(0);
      expect(resJoiningJoining.recommendable).toBe(false);
    });
  });

  // ==========================================
  // 3. FRANCHISE REAL SCENARIO QA
  // ==========================================
  describe('3. Franchise Matching Real Scenarios', () => {
    const seeker: FranchiseSeekerProfile = {
      sector: 'Cafe & Restoran',
      city: 'İstanbul Anadolu',
      minimumInvestment: 1000000,
      maximumInvestment: 2000000,
      businessCategory: 'Cafe & Restoran',
      experience: '3-5 yıl işletme deneyimi',
      mallPreference: true,
      streetStorePreference: true,
      district: 'Kadıköy',
      preferredLocation: 'Cadde / AVM',
    };

    const baseOpp: FranchiseOpportunityProfile = {
      listingId: 'f-1',
      slug: 'f-1',
      title: 'Cafe Franchise',
      companyName: 'Cafe Brand',
      sector: 'Cafe & Restoran',
      businessCategory: 'Cafe & Restoran',
      totalInvestment: 1500000,
      minCapitalRequirement: 1200000,
      franchiseFee: 300000,
      availableCities: ['İstanbul'],
      districts: 'Kadıköy',
      minSquareMeters: 100,
      storeSize: '100-200 m²',
      mallAvailable: true,
      streetStoreAvailable: true,
      experienceRequirement: '1-3 yıl işletme deneyimi',
      returnPeriod: '12-18 ay',
      branchCount: 20,
      publishedAt: '2026-08-01T00:00:00Z',
    };

    it('1. In-budget (1.5M TL within [1M, 2M]) -> Very high score (>= 85)', () => {
      const res = calculateFranchiseMatch(seeker, baseOpp);
      expect(res.score).toBeGreaterThanOrEqual(85);
      expect(res.band).toBe('very_strong');
    });

    it('2. 25% tolerance (e.g. 2.2M TL) -> 0.65 budget score', () => {
      const res = calculateFranchiseMatch(seeker, { ...baseOpp, totalInvestment: 2200000 });
      const bDim = res.dimensions.find((d) => d.key === 'budget');
      expect(bDim?.score).toBe(0.65);
    });

    it('3. Far outside (e.g. 5M TL) -> 0.30 budget score', () => {
      const res = calculateFranchiseMatch(seeker, { ...baseOpp, totalInvestment: 5000000 });
      const bDim = res.dimensions.find((d) => d.key === 'budget');
      expect(bDim?.score).toBe(0.30);
    });

    it('4. Istanbul Anadolu <-> Avrupa -> 0.85 location score', () => {
      const res = calculateFranchiseMatch(seeker, { ...baseOpp, availableCities: ['İstanbul Avrupa'] });
      const lDim = res.dimensions.find((d) => d.key === 'location');
      expect(lDim?.score).toBe(0.85);
    });

    it('5. Istanbul <-> Ankara -> 0.50 location score (never hard filter)', () => {
      const res = calculateFranchiseMatch(seeker, { ...baseOpp, availableCities: ['Ankara'] });
      const lDim = res.dimensions.find((d) => d.key === 'location');
      expect(lDim?.score).toBe(0.50);
      expect(res.score).toBeGreaterThanOrEqual(50);
    });

    it('6. All Turkey (Tüm Türkiye) -> 1.0 location score', () => {
      const res = calculateFranchiseMatch(seeker, { ...baseOpp, availableCities: ['Tüm Türkiye'] });
      const lDim = res.dimensions.find((d) => d.key === 'location');
      expect(lDim?.score).toBe(1.0);
    });

    it('7. Sector mismatch -> Serious score drop', () => {
      const res = calculateFranchiseMatch(seeker, { ...baseOpp, sector: 'Otomotiv' });
      expect(res.score).toBeLessThan(75);
    });
  });

  // ==========================================
  // 4. DİJİTAL & AI REAL SCENARIO QA
  // ==========================================
  describe('4. Dijital & AI Matching Real Scenarios', () => {
    const consumer: DigitalSolutionConsumerProfile = {
      industry: 'Restoran',
      companySize: '11-50',
      targetAudienceHints: ['KOBİ', 'Startup'],
      neededCapabilities: ['CRM', 'İş Akışı Otomasyonu', 'Analitik & Raporlama'],
      preferredSolutionTypes: ['SaaS ürünü'],
      preferredDeliveryModels: ['Abonelik (SaaS)'],
      priceBudget: '5.000 - 25.000 TL',
      city: 'İstanbul',
      location: 'İstanbul',
      languages: ['Türkçe'],
    };

    const solution: DigitalSolutionProfile = {
      listingId: 'd-1',
      title: 'Restoran & Cafe Operasyon ve CRM SaaS',
      shortDescription: 'Restoranlar için sipariş, CRM ve analitik çözümü.',
      solutionType: 'SaaS ürünü',
      deliveryModel: 'Abonelik (SaaS)',
      targetAudience: 'KOBİ',
      priceRange: '5.000 - 25.000 TL',
      demoUrl: 'https://demo.restosmart.com',
      capabilities: ['CRM', 'İş Akışı Otomasyonu', 'Analitik & Raporlama'],
      supportedLanguages: ['Türkçe', 'İngilizce'],
      industry: 'Restoran',
      city: 'İstanbul',
      location: 'İstanbul',
      publishedAt: '2026-08-01T00:00:00Z',
    };

    it('High match for matching consumer and digital solution (100%)', () => {
      const res = calculateDigitalSolutionMatch(consumer, solution);
      expect(res.score).toBe(100);
      expect(res.band).toBe('very_strong');
      expect(res.reasons.length).toBeGreaterThanOrEqual(3);
    });

    it('Sensitivity: changing sector, target audience or capabilities drops score', () => {
      const base = calculateDigitalSolutionMatch(consumer, solution);

      const diffSector = calculateDigitalSolutionMatch(consumer, { ...solution, industry: 'İnşaat' });
      expect(diffSector.score).toBeLessThan(base.score);

      const diffAudience = calculateDigitalSolutionMatch(consumer, { ...solution, targetAudience: 'Kurumsal' });
      expect(diffAudience.score).toBeLessThan(base.score);

      const diffCaps = calculateDigitalSolutionMatch(consumer, { ...solution, capabilities: ['Siber Güvenlik'] });
      expect(diffCaps.score).toBeLessThan(base.score);
    });
  });

  // ==========================================
  // 5. PUBLIC CARD PRIVACY & ANTI-LEAK QA
  // ==========================================
  describe('5. Public DTO Privacy & Anti-Leak QA', () => {
    it('prevents contact, identity, or customFields leak across all 4 modules', () => {
      const leakedItem = {
        title: 'Leaked Card',
        score: 95,
        contactPhone: '05559998877',
        contactEmail: 'leak@target.com',
        contactWhatsapp: '+905559998877',
        ownerUserId: 'user-secret',
        createdBy: 'user-secret',
        customFields: { secretKey: 'secretVal' },
      };

      expect(() => assertNoCareerContactLeak(leakedItem)).toThrow();
      expect(() => assertNoPartnershipContactLeak(leakedItem)).toThrow();
      expect(() => assertNoDigitalSolutionContactLeak(leakedItem)).toThrow();
      expect(() => assertNoFranchiseContactLeak(leakedItem)).toThrow();
    });
  });
});
