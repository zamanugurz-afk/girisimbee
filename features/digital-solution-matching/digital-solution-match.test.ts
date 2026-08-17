import { describe, expect, it } from 'vitest';
import {
  buildDigitalSolutionConsumerProfile,
  employeeCountToTargetAudiences,
  extractDigitalSolutionProfile,
  isDigitalSolutionListing,
  normalizeStringList,
  normalizeText,
} from '@/features/digital-solution-matching/normalize';
import {
  DIGITAL_SOLUTION_MATCH_WEIGHTS,
  normalizeMatchScore,
  resolveScoreBand,
  scoreCapabilities,
  scoreDeliveryModel,
  scoreDigitalSolutionDimensions,
  scoreLanguage,
  scoreLocation,
  scorePriceRange,
  scoreSector,
  scoreSolutionType,
  scoreTargetAudience,
} from '@/features/digital-solution-matching/scoring';
import { calculateDigitalSolutionMatch } from '@/features/digital-solution-matching/engine';
import { generateDigitalSolutionMatchReasons } from '@/features/digital-solution-matching/explain';
import {
  assertNoDigitalSolutionContactLeak,
  toPublicDigitalSolutionMatchCard,
} from '@/features/digital-solution-matching/adapters/public-card';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';
import type {
  DigitalSolutionConsumerProfile,
  DigitalSolutionProfile,
} from '@/features/digital-solution-matching/types';

const BASE_CONSUMER: DigitalSolutionConsumerProfile = {
  industry: 'Fintech',
  companySize: '11-50',
  targetAudienceHints: ['KOBİ', 'Startup'],
  neededCapabilities: ['Yapay Zeka Asistanı', 'İş Akışı Otomasyonu', 'Entegrasyon & API'],
  preferredSolutionTypes: ['SaaS ürünü', 'Yapay zeka asistanı / ajan'],
  preferredDeliveryModels: ['Abonelik (SaaS)'],
  priceBudget: '5.000 - 25.000 TL',
  city: 'İstanbul',
  location: 'İstanbul',
  languages: ['Türkçe'],
};

const BASE_SOLUTION: DigitalSolutionProfile = {
  listingId: 'sol-1',
  title: 'FinBot — AI Operasyon Asistanı',
  shortDescription: 'Fintech ve KOBİ süreçlerini otomatikleştiren yapay zeka çözümü.',
  solutionType: 'Yapay zeka asistanı / ajan',
  deliveryModel: 'Abonelik (SaaS)',
  targetAudience: 'KOBİ',
  priceRange: '5.000 - 25.000 TL',
  demoUrl: 'https://demo.finbot.ai',
  capabilities: ['Yapay Zeka Asistanı', 'İş Akışı Otomasyonu', 'Entegrasyon & API'],
  supportedLanguages: ['Türkçe', 'İngilizce'],
  industry: 'Fintech',
  city: 'İstanbul',
  location: 'İstanbul',
  publishedAt: '2026-08-01T10:00:00Z',
};

describe('Digital & AI Solution Matching Engine', () => {
  it('weights sum exactly to 100%', () => {
    const sum = Object.values(DIGITAL_SOLUTION_MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.sector).toBe(25);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.targetAudience).toBe(20);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.capabilities).toBe(20);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.solutionType).toBe(15);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.deliveryModel).toBe(10);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.location).toBe(5);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.priceRange).toBe(3);
    expect(DIGITAL_SOLUTION_MATCH_WEIGHTS.language).toBe(2);
  });

  it('calculates 100% score for a perfect match', () => {
    const result = calculateDigitalSolutionMatch(BASE_CONSUMER, BASE_SOLUTION);
    expect(result.score).toBe(100);
    expect(result.band).toBe('very_strong');
    expect(result.bandLabel).toBe('Çok güçlü uyum');
    expect(result.recommendable).toBe(true);
    expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    expect(result.reasons.length).toBeLessThanOrEqual(5);
  });

  it('scores exact sector match 1.0 and mismatch 0.0', () => {
    expect(scoreSector(BASE_CONSUMER, BASE_SOLUTION)).toBe(1.0);
    expect(scoreSector(BASE_CONSUMER, { ...BASE_SOLUTION, industry: 'Tarım' })).toBe(0.0);
    expect(scoreSector({ ...BASE_CONSUMER, industry: null }, BASE_SOLUTION)).toBeNull();
  });

  it('scores target audience and maps employee count correctly', () => {
    expect(employeeCountToTargetAudiences('1-10')).toEqual(['Startup', 'KOBİ', 'Bireysel girişimci']);
    expect(employeeCountToTargetAudiences('11-50')).toEqual(['KOBİ', 'Startup']);
    expect(employeeCountToTargetAudiences('500+')).toEqual(['Kurumsal']);

    expect(scoreTargetAudience(BASE_CONSUMER, BASE_SOLUTION)).toBe(1.0);
    expect(scoreTargetAudience(BASE_CONSUMER, { ...BASE_SOLUTION, targetAudience: 'Kurumsal' })).toBe(0.4);
  });

  it('scores capability overlap accurately', () => {
    const full = scoreCapabilities(BASE_CONSUMER, BASE_SOLUTION);
    expect(full.score).toBe(1.0);
    expect(full.matchedCount).toBe(3);

    const partial = scoreCapabilities(BASE_CONSUMER, {
      ...BASE_SOLUTION,
      capabilities: ['Yapay Zeka Asistanı'],
    });
    expect(partial.score).toBeCloseTo(1 / 3, 2);
    expect(partial.matchedCount).toBe(1);
    expect(partial.missingCount).toBe(2);
  });

  it('scores solution type and delivery model', () => {
    expect(scoreSolutionType(BASE_CONSUMER, BASE_SOLUTION)).toBe(1.0);
    expect(scoreSolutionType(BASE_CONSUMER, { ...BASE_SOLUTION, solutionType: 'Özel yazılım geliştirme' })).toBe(0.3);

    expect(scoreDeliveryModel(BASE_CONSUMER, BASE_SOLUTION)).toBe(1.0);
    expect(scoreDeliveryModel(BASE_CONSUMER, { ...BASE_SOLUTION, deliveryModel: 'White-label' })).toBe(0.4);
  });

  it('scores location with Istanbul sides, different cities (50%), and remote (100%)', () => {
    // Same city
    expect(scoreLocation(BASE_CONSUMER, BASE_SOLUTION)).toBe(1.0);

    // Istanbul Anadolu <-> Avrupa
    const anadolu = { ...BASE_CONSUMER, city: 'İstanbul Anadolu' };
    const avrupa = { ...BASE_SOLUTION, city: 'İstanbul Avrupa' };
    expect(scoreLocation(anadolu, avrupa)).toBe(0.85);

    // Different city (Never 0, always 0.50)
    const ankara = { ...BASE_SOLUTION, city: 'Ankara', location: 'Ankara' };
    expect(scoreLocation(BASE_CONSUMER, ankara)).toBe(0.50);

    // Remote
    const remote = { ...BASE_SOLUTION, city: 'İzmir', location: 'Online / Remote' };
    expect(scoreLocation(BASE_CONSUMER, remote)).toBe(1.0);

    // Missing city
    expect(scoreLocation({ ...BASE_CONSUMER, city: null, location: null }, { ...BASE_SOLUTION, city: null, location: null })).toBeNull();
  });

  it('renormalizes score when dimensions are missing without treating as mismatch', () => {
    // When consumer has no language and no price range specified:
    const partialConsumer: DigitalSolutionConsumerProfile = {
      ...BASE_CONSUMER,
      languages: [],
      priceBudget: null,
    };
    const result = calculateDigitalSolutionMatch(partialConsumer, BASE_SOLUTION);
    // Active weights: 25 + 20 + 20 + 15 + 10 + 5 = 95 -> all 1.0 -> 95/95 * 100 = 100%
    expect(result.score).toBe(100);
  });

  it('categorizes scores into bands and drops below 50', () => {
    expect(resolveScoreBand(85)).toEqual({ band: 'very_strong', bandLabel: 'Çok güçlü uyum', recommendable: true });
    expect(resolveScoreBand(70)).toEqual({ band: 'strong', bandLabel: 'Güçlü uyum', recommendable: true });
    expect(resolveScoreBand(55)).toEqual({ band: 'suitable', bandLabel: 'Uygun uyum', recommendable: true });
    expect(resolveScoreBand(45)).toEqual({ band: 'below_threshold', bandLabel: 'Uyumsuz', recommendable: false });
  });

  it('generates 3 to 5 unique positive reasons without duplicates', () => {
    const dimensions = scoreDigitalSolutionDimensions(BASE_CONSUMER, BASE_SOLUTION);
    const reasons = generateDigitalSolutionMatchReasons(dimensions, BASE_CONSUMER, BASE_SOLUTION);
    expect(reasons.length).toBeGreaterThanOrEqual(3);
    expect(reasons.length).toBeLessThanOrEqual(5);

    const texts = reasons.map((r) => r.text);
    const unique = new Set(texts);
    expect(unique.size).toBe(texts.length);
  });

  it('creates public card safely and asserts no contact leak', () => {
    const listing = createListing({
      ownerId: ids.user('owner-1'),
      categoryId: CATEGORY_IDS.dijitalAi,
      listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
      title: 'FinBot SaaS',
      shortDescription: 'AI asistanı',
      contactPhone: '05551234567',
      contactEmail: 'secret@finbot.com',
      contactWhatsapp: '+905559876543',
      customFields: {
        solutionType: 'Yapay zeka asistanı / ajan',
        deliveryModel: 'Abonelik (SaaS)',
        targetAudience: 'KOBİ',
        capabilities: ['Yapay Zeka Asistanı'],
        contactPhone: '05551234567',
      },
    });

    const matchResult = calculateDigitalSolutionMatch(BASE_CONSUMER, BASE_SOLUTION);
    const card = toPublicDigitalSolutionMatchCard(listing, matchResult);

    expect(card).not.toBeNull();
    expect(card?.title).toBe('FinBot SaaS');
    expect(card?.score).toBe(100);

    const json = JSON.stringify(card);
    expect(json).not.toContain('05551234567');
    expect(json).not.toContain('secret@finbot.com');
    expect(json).not.toContain('+905559876543');
    expect(json).not.toMatch(/contactPhone|contactEmail|contactWhatsapp|customFields|ownerUserId/);

    expect(() => assertNoDigitalSolutionContactLeak(card)).not.toThrow();

    const leakingData = { ...card, contactPhone: '05551234567' };
    expect(() => assertNoDigitalSolutionContactLeak(leakingData)).toThrow();
  });
});
