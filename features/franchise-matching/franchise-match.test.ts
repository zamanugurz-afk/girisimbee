import { describe, expect, it } from 'vitest';
import {
  buildFranchiseSeekerProfile,
  extractFranchiseOpportunityProfile,
  formatFranchiseMoney,
  isFranchiseListing,
  normalizeNumber,
  normalizeString,
  normalizeStringArray,
} from '@/features/franchise-matching/normalize';
import {
  FRANCHISE_MATCH_WEIGHTS,
  normalizeMatchScore,
  resolveScoreBand,
  scoreBudget,
  scoreBusinessModel,
  scoreExperience,
  scoreFranchiseDimensions,
  scoreLocation,
  scoreSector,
  scoreStoreType,
} from '@/features/franchise-matching/scoring';
import { calculateFranchiseMatch } from '@/features/franchise-matching/engine';
import { generateFranchiseMatchReasons } from '@/features/franchise-matching/explain';
import {
  assertNoFranchiseContactLeak,
  toPublicFranchiseMatchCard,
} from '@/features/franchise-matching/adapters/public-card';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import type {
  FranchiseOpportunityProfile,
  FranchiseSeekerProfile,
} from '@/features/franchise-matching/types';

const BASE_SEEKER: FranchiseSeekerProfile = {
  sector: 'Gıda & İçecek',
  city: 'İstanbul',
  district: 'Kadıköy',
  minimumInvestment: 500000,
  maximumInvestment: 1500000,
  preferredLocation: 'Cadde Mağazası',
  businessCategory: 'Cafe & Restoran',
  experience: '3-5 yıl işletme deneyimi',
  mallPreference: false,
  streetStorePreference: true,
};

const BASE_OPP: FranchiseOpportunityProfile = {
  listingId: 'opp-1',
  slug: 'kahve-dunyasi-franchise',
  title: 'Kahve & Bistro Franchise Fırsatı',
  companyName: 'Kahve Dünyası A.Ş.',
  sector: 'Gıda & İçecek',
  businessCategory: 'Cafe & Restoran',
  totalInvestment: 1000000,
  minCapitalRequirement: 800000,
  franchiseFee: 200000,
  availableCities: ['İstanbul', 'Ankara', 'İzmir'],
  districts: 'Kadıköy, Beşiktaş',
  minSquareMeters: 80,
  storeSize: '50-100 m²',
  mallAvailable: true,
  streetStoreAvailable: true,
  experienceRequirement: '1-3 yıl işletme deneyimi',
  returnPeriod: '18-24 ay',
  branchCount: 45,
  publishedAt: '2026-08-01T10:00:00Z',
};

describe('Franchise Matching Engine', () => {
  it('weights sum exactly to 100%', () => {
    const sum = Object.values(FRANCHISE_MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
    expect(FRANCHISE_MATCH_WEIGHTS.sector).toBe(30);
    expect(FRANCHISE_MATCH_WEIGHTS.budget).toBe(25);
    expect(FRANCHISE_MATCH_WEIGHTS.location).toBe(20);
    expect(FRANCHISE_MATCH_WEIGHTS.businessModel).toBe(15);
    expect(FRANCHISE_MATCH_WEIGHTS.experience).toBe(5);
    expect(FRANCHISE_MATCH_WEIGHTS.storeType).toBe(5);
  });

  it('calculates 100% score for a perfect match', () => {
    const result = calculateFranchiseMatch(BASE_SEEKER, BASE_OPP);
    expect(result.score).toBe(100);
    expect(result.band).toBe('very_strong');
    expect(result.bandLabel).toBe('Çok Güçlü Franchise Eşleşmesi');
    expect(result.recommendable).toBe(true);
    expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    expect(result.reasons.length).toBeLessThanOrEqual(5);
  });

  it('scores exact sector match 1.0 and mismatch 0.0', () => {
    expect(scoreSector(BASE_SEEKER, BASE_OPP)).toBe(1.0);
    expect(scoreSector(BASE_SEEKER, { ...BASE_OPP, sector: 'Otomotiv' })).toBe(0.0);
    expect(scoreSector({ ...BASE_SEEKER, sector: null }, BASE_OPP)).toBeNull();
  });

  it('scores investment budget: exact (1.0), near (0.65), far (0.30)', () => {
    // Exact within [500k, 1.5M] -> 1.000.000 TL
    expect(scoreBudget(BASE_SEEKER, BASE_OPP)).toBe(1.0);

    // Near within 25% tolerance (e.g. 1.700.000 TL vs 1.500.000 TL max)
    expect(scoreBudget(BASE_SEEKER, { ...BASE_OPP, totalInvestment: 1700000 })).toBe(0.65);

    // Far (e.g. 4.000.000 TL)
    expect(scoreBudget(BASE_SEEKER, { ...BASE_OPP, totalInvestment: 4000000 })).toBe(0.30);

    // Missing
    expect(scoreBudget({ ...BASE_SEEKER, minimumInvestment: null, maximumInvestment: null }, BASE_OPP)).toBeNull();
  });

  it('scores location: same city (1.0), All Turkey (1.0), Istanbul Anadolu <-> Avrupa (0.85), different city (0.50)', () => {
    // Same city
    expect(scoreLocation(BASE_SEEKER, BASE_OPP)).toBe(1.0);

    // All Turkey
    expect(scoreLocation(BASE_SEEKER, { ...BASE_OPP, availableCities: ['Tüm Türkiye'] })).toBe(1.0);

    // Istanbul Anadolu <-> Avrupa cross side
    const anadoluSeeker = { ...BASE_SEEKER, city: 'İstanbul Anadolu' };
    const avrupaOpp = { ...BASE_OPP, availableCities: ['İstanbul Avrupa'] };
    expect(scoreLocation(anadoluSeeker, avrupaOpp)).toBe(0.85);

    // Different city (Never 0, always 0.50 - Hard filter strictly prohibited)
    const ankaraSeeker = { ...BASE_SEEKER, city: 'Antalya' };
    const ankaraOpp = { ...BASE_OPP, availableCities: ['Bursa'] };
    expect(scoreLocation(ankaraSeeker, ankaraOpp)).toBe(0.50);

    // Missing
    expect(scoreLocation({ ...BASE_SEEKER, city: null }, BASE_OPP)).toBeNull();
  });

  it('scores business model, experience and store type', () => {
    expect(scoreBusinessModel(BASE_SEEKER, BASE_OPP)).toBe(1.0);
    expect(scoreBusinessModel(BASE_SEEKER, { ...BASE_OPP, businessCategory: 'Fast food / Quick service' })).toBe(0.65);

    expect(scoreExperience(BASE_SEEKER, BASE_OPP)).toBe(1.0);
    expect(scoreExperience({ ...BASE_SEEKER, experience: null }, { ...BASE_OPP, experienceRequirement: 'Deneyim gerekmez' })).toBe(1.0);

    expect(scoreStoreType(BASE_SEEKER, BASE_OPP)).toBe(1.0);
  });

  it('renormalizes missing criteria without penalty', () => {
    const seekerNoExpNoStore: FranchiseSeekerProfile = {
      ...BASE_SEEKER,
      experience: null,
      mallPreference: null,
      streetStorePreference: null,
    };
    // Used weights: sector (30) + budget (25) + location (20) + model (15) = 90 -> 90/90 = 100%
    const result = calculateFranchiseMatch(seekerNoExpNoStore, BASE_OPP);
    expect(result.score).toBe(100);
  });

  it('categorizes scores into bands and drops below 50', () => {
    expect(resolveScoreBand(85)).toEqual({ band: 'very_strong', bandLabel: 'Çok Güçlü Franchise Eşleşmesi', recommendable: true });
    expect(resolveScoreBand(70)).toEqual({ band: 'strong', bandLabel: 'Güçlü Franchise Eşleşmesi', recommendable: true });
    expect(resolveScoreBand(55)).toEqual({ band: 'suitable', bandLabel: 'Uygun Franchise Fırsatı', recommendable: true });
    expect(resolveScoreBand(45)).toEqual({ band: 'below_threshold', bandLabel: 'Uyumsuz', recommendable: false });
  });

  it('generates 3 to 5 unique positive reasons without duplicates', () => {
    const dimensions = scoreFranchiseDimensions(BASE_SEEKER, BASE_OPP);
    const reasons = generateFranchiseMatchReasons(dimensions, BASE_SEEKER, BASE_OPP);
    expect(reasons.length).toBeGreaterThanOrEqual(3);
    expect(reasons.length).toBeLessThanOrEqual(5);

    const texts = reasons.map((r) => r.text);
    const unique = new Set(texts);
    expect(unique.size).toBe(texts.length);
  });

  it('creates public card safely and asserts no contact leak', () => {
    const listing = createListing({
      ownerId: ids.user('owner-franchise'),
      categoryId: CATEGORY_IDS.bayilikAl,
      listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
      title: 'Kahve & Bistro Fırsatı',
      shortDescription: 'Franchise fırsatı',
      contactPhone: '05321112233',
      contactEmail: 'bayilik@kahvedunyasi.com',
      contactWhatsapp: '+905321112233',
      customFields: {
        companyName: 'Kahve Dünyası',
        sector: 'Gıda & İçecek',
        businessCategory: 'Cafe & Restoran',
        totalInvestment: 1000000,
        availableCities: ['İstanbul'],
        contactPhone: '05321112233',
      },
    });

    const matchResult = calculateFranchiseMatch(BASE_SEEKER, BASE_OPP);
    const card = toPublicFranchiseMatchCard(listing, matchResult);

    expect(card).not.toBeNull();
    expect(card?.title).toBe('Kahve & Bistro Fırsatı');
    expect(card?.score).toBe(100);

    const json = JSON.stringify(card);
    expect(json).not.toContain('05321112233');
    expect(json).not.toContain('bayilik@kahvedunyasi.com');
    expect(json).not.toMatch(/contactPhone|contactEmail|contactWhatsapp|customFields|ownerUserId/);

    expect(() => assertNoFranchiseContactLeak(card)).not.toThrow();

    const leakingData = { ...card, contactPhone: '05321112233' };
    expect(() => assertNoFranchiseContactLeak(leakingData)).toThrow();
  });

  it('normalizes Turkish characters correctly', () => {
    expect(normalizeString('Gıda & İçecek')).toBe('gida & icecek');
    expect(normalizeString('İstanbul')).toBe('istanbul');
    expect(normalizeString('Çankaya / Şişli / Ödemiş')).toBe('cankaya / sisli / odemis');
  });
});
