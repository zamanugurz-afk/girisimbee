import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import { ids } from '@/lib/domain/ids';
import { scorePartnershipProfiles, scorePartnershipSources } from '@/features/partnership-matching/engine';
import {
  getPartnershipMatchBand,
  isRecommendablePartnershipMatch,
  selectPartnershipDisplayReasons,
} from '@/features/partnership-matching/explain';
import {
  normalizePartnershipSource,
  parsePartnershipEquity,
  resolvePartnershipSource,
} from '@/features/partnership-matching/normalize';
import { toPublicPartnershipMatchCard } from '@/features/partnership-matching/presentation/partnership-match-party';
import { normalizePartnershipScore } from '@/features/partnership-matching/scoring';
import type { PartnershipMatchProfile } from '@/features/partnership-matching/types';
import type { Listing } from '@/features/listings/types/listing.entity.types';

const SEEKER_ID = ids.user('partner-seeker-1');
const JOINER_ID = ids.user('partner-joiner-1');

const SEEKING_FIELDS = {
  partnershipIntent: 'seeking',
  expertise: ['React', 'Node.js'],
  requiredSkills: ['React', 'Node.js'],
  sector: 'Fintech',
  sectors: ['Fintech'],
  partnershipType: 'Teknik Ortak',
  commitment: 'Yarı zamanlı',
  projectStage: 'MVP aşaması',
  experience: '3-5 yıl',
  equityOffered: 15,
};

const JOINING_FIELDS = {
  partnershipIntent: 'joining',
  expertise: ['React', 'Node.js'],
  offeredSkills: ['React', 'Node.js'],
  sectors: ['Fintech'],
  partnershipType: 'Teknik Ortak',
  commitment: 'Yarı zamanlı',
  projectStage: 'MVP aşaması',
  experience: '3-5 yıl',
  equityOffered: 15,
};

function seekingProfile(overrides: Partial<PartnershipMatchProfile> = {}): PartnershipMatchProfile {
  return {
    intent: 'seeking',
    title: 'Fintech girişimi teknik ortak arıyor',
    description: 'React ve Node.js ile ürün geliştirmek için ortak arıyoruz.',
    skills: ['React', 'Node.js'],
    sectors: ['Fintech'],
    partnershipTypes: ['Teknik Ortak'],
    commitment: 'Yarı zamanlı',
    stage: 'MVP aşaması',
    experience: '3-5 yıl',
    location: 'İstanbul',
    equity: 15,
    ...overrides,
  };
}

function joiningProfile(overrides: Partial<PartnershipMatchProfile> = {}): PartnershipMatchProfile {
  return {
    intent: 'joining',
    title: 'Yazılım geliştirici ortak olmak istiyor',
    description: 'Fintech odaklı teknik ortaklık.',
    skills: ['React', 'Node.js'],
    sectors: ['Fintech'],
    partnershipTypes: ['Teknik Ortak'],
    commitment: 'Yarı zamanlı',
    stage: 'MVP aşaması',
    experience: '3-5 yıl',
    location: 'İstanbul',
    equity: 15,
    ...overrides,
  };
}

function seekingListing(overrides: Partial<Listing> = {}) {
  return createListing({
    ownerId: SEEKER_ID,
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title: 'Fintech girişimi teknik ortak arıyor',
    shortDescription: 'React ve Node.js ile ürün geliştirmek için ortak arıyoruz.',
    status: 'published',
    city: 'İstanbul',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: { ...SEEKING_FIELDS },
    ...overrides,
  });
}

function joiningListing(overrides: Partial<Listing> = {}) {
  return createListing({
    ownerId: JOINER_ID,
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title: 'Yazılım geliştirici ortak olmak istiyor',
    shortDescription: 'Fintech odaklı teknik ortaklık profili.',
    status: 'published',
    city: 'İstanbul',
    publishedAt: '2026-08-02T00:00:00.000Z',
    customFields: { ...JOINING_FIELDS },
    ...overrides,
  });
}

describe('partnership matching engine', () => {
  it('scores a fully aligned seeking/joining pair in the very-strong band', () => {
    const result = scorePartnershipProfiles(seekingProfile(), joiningProfile());
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.band).toBe('very_strong');
    expect(result.bandLabel).toBe('Çok güçlü ortaklık eşleşmesi');
    expect(result.recommendable).toBe(true);
    expect(result.reasons.some((reason) => reason.text === 'Uzmanlık ihtiyacı karşılanıyor')).toBe(true);
    expect(result.reasons.some((reason) => reason.text === 'Sektör tercihi uyumlu')).toBe(true);
    expect(result.reasons.some((reason) => reason.text === 'Ortaklık tipi uyumlu')).toBe(true);
    expect(result.reasons.some((reason) => reason.text === 'Taahhüt beklentisi uyumlu')).toBe(true);
  });

  it('produces the same score in both directions', () => {
    const seeking = seekingProfile();
    const joining = joiningProfile({
      skills: ['React', 'Node.js', 'TypeScript'],
      sectors: ['Fintech', 'SaaS / Yazılım'],
      commitment: 'Tam zamanlı',
      location: 'Ankara',
      equity: 20,
    });

    const forward = scorePartnershipProfiles(seeking, joining);
    const reverse = scorePartnershipProfiles(joining, seeking);
    const listingForward = scorePartnershipSources(seekingListing(), joiningListing());
    const listingReverse = scorePartnershipSources(joiningListing(), seekingListing());

    expect(forward.score).toBe(reverse.score);
    expect(forward.band).toBe(reverse.band);
    expect(listingForward.score).toBe(listingReverse.score);
  });

  it('gives a high skill match when expertise overlaps', () => {
    const result = scorePartnershipProfiles(seekingProfile(), joiningProfile());
    expect(result.dimensions.find((dimension) => dimension.key === 'skills')?.score).toBe(1);
  });

  it('gives a high sector match when sectors overlap', () => {
    const result = scorePartnershipProfiles(seekingProfile(), joiningProfile());
    expect(result.dimensions.find((dimension) => dimension.key === 'sector')?.score).toBe(1);
  });

  it('matches partnership type, commitment, stage, experience, location, and equity', () => {
    const result = scorePartnershipProfiles(seekingProfile(), joiningProfile());
    expect(result.dimensions.find((dimension) => dimension.key === 'partnershipType')?.score).toBe(1);
    expect(result.dimensions.find((dimension) => dimension.key === 'commitment')?.score).toBe(1);
    expect(result.dimensions.find((dimension) => dimension.key === 'stage')?.score).toBe(1);
    expect(result.dimensions.find((dimension) => dimension.key === 'experience')?.score).toBe(1);
    expect(result.dimensions.find((dimension) => dimension.key === 'location')?.score).toBe(1);
    expect(result.dimensions.find((dimension) => dimension.key === 'equity')?.score).toBe(1);
  });

  it('does not treat an empty location as incompatible', () => {
    const aligned = scorePartnershipProfiles(seekingProfile(), joiningProfile());
    const bothEmpty = scorePartnershipProfiles(
      seekingProfile({ location: null }),
      joiningProfile({ location: null }),
    );
    const oneEmpty = scorePartnershipProfiles(seekingProfile({ location: null }), joiningProfile());

    expect(bothEmpty.score).toBe(aligned.score);
    expect(oneEmpty.score).toBe(aligned.score);
    expect(bothEmpty.dimensions.find((dimension) => dimension.key === 'location')?.comparable).toBe(false);
    expect(oneEmpty.reasons.some((reason) => reason.text.includes('Lokasyon'))).toBe(false);
  });

  it('skips missing fields and renormalizes remaining weights', () => {
    const result = scorePartnershipProfiles(
      seekingProfile({ experience: null, equity: null, location: null }),
      joiningProfile({ experience: null, equity: null, location: null }),
    );
    const skipped = result.dimensions.filter((dimension) => !dimension.comparable).map((dimension) => dimension.key);
    expect(skipped).toEqual(expect.arrayContaining(['experience', 'equity', 'location']));
    expect(result.score).toBe(100);
    expect(normalizePartnershipScore(75, 75)).toBe(100);
  });

  it('excludes scores below 50 from recommendations', () => {
    const result = scorePartnershipProfiles(
      seekingProfile(),
      joiningProfile({
        skills: ['Satış'],
        sectors: ['Gıda teknolojisi'],
        partnershipTypes: ['Danışman'],
        commitment: 'Danışmanlık',
        stage: 'Ölçeklenme aşaması',
        experience: '0-1 yıl',
        location: 'İzmir',
        equity: 80,
      }),
    );
    expect(result.score).toBeLessThan(50);
    expect(result.recommendable).toBe(false);
    expect(isRecommendablePartnershipMatch(result.score)).toBe(false);
    expect(toPublicPartnershipMatchCard(joiningListing(), result)).toBeNull();
  });

  it('maps 80+ to çok güçlü ortaklık eşleşmesi', () => {
    expect(getPartnershipMatchBand(80)).toBe('very_strong');
    expect(getPartnershipMatchBand(100)).toBe('very_strong');
    expect(scorePartnershipProfiles(seekingProfile(), joiningProfile()).bandLabel).toBe(
      'Çok güçlü ortaklık eşleşmesi',
    );
  });

  it('maps 65–79 and 50–64 to the partnership bands', () => {
    expect(getPartnershipMatchBand(65)).toBe('strong');
    expect(getPartnershipMatchBand(79)).toBe('strong');
    expect(getPartnershipMatchBand(50)).toBe('suitable');
    expect(getPartnershipMatchBand(64)).toBe('suitable');
    expect(getPartnershipMatchBand(49)).toBe('below_threshold');
  });

  it('does not mix the same partnership intent', () => {
    const sameSeeking = scorePartnershipProfiles(seekingProfile(), seekingProfile({ title: 'Başka girişim' }));
    const sameJoining = scorePartnershipProfiles(joiningProfile(), joiningProfile({ title: 'Başka profil' }));
    expect(sameSeeking.score).toBe(0);
    expect(sameSeeking.recommendable).toBe(false);
    expect(sameJoining.recommendable).toBe(false);
  });

  it('treats a legacy listing without partnershipIntent as seeking', () => {
    const legacy = seekingListing({
      customFields: {
        expertise: ['React'],
        requiredSkills: ['React'],
        sector: 'Fintech',
        partnershipType: 'Teknik Ortak',
        commitment: 'Yarı zamanlı',
      },
    });
    const resolved = resolvePartnershipSource(legacy);
    const normalized = normalizePartnershipSource(legacy);
    expect(resolved.intent).toBe('seeking');
    expect(normalized.intent).toBe('seeking');
    expect(scorePartnershipSources(legacy, joiningListing()).recommendable).toBe(true);
    expect(scorePartnershipSources(legacy, seekingListing({ title: 'Başka seeking' })).recommendable).toBe(false);
  });

  it('reads existing field aliases into the canonical profile', () => {
    const listing = seekingListing({
      city: null,
      location: 'Ankara',
      industry: 'SaaS / Yazılım',
      partnerDetails: { partnerType: 'technical', equityOffered: '20%', commitment: 'full_time' },
      customFields: {
        partnershipIntent: 'seeking',
        requiredSkills: 'React, Node.js',
        preferredPartnershipType: 'Teknik Ortak',
        startupStage: 'MVP',
        equityOffered: '15 hisse',
      },
    });
    const profile = normalizePartnershipSource(listing);
    expect(profile.skills).toEqual(expect.arrayContaining(['React', 'Node.js']));
    expect(profile.sectors).toEqual(expect.arrayContaining(['SaaS / Yazılım']));
    expect(profile.partnershipTypes).toEqual(expect.arrayContaining(['Teknik Ortak']));
    expect(profile.commitment).toBe('Tam zamanlı');
    expect(profile.stage).toBe('MVP aşaması');
    expect(profile.location).toBe('Ankara');
    expect(profile.equity).toBe(15);
    expect(parsePartnershipEquity('%12')).toBe(12);
  });

  it('keeps user-facing reasons free of technical matching terms', () => {
    const result = scorePartnershipProfiles(seekingProfile(), joiningProfile());
    const display = selectPartnershipDisplayReasons(result.reasons);
    expect(display.length).toBeGreaterThanOrEqual(3);
    expect(display.length).toBeLessThanOrEqual(5);
    const text = display.map((reason) => reason.text).join(' ');
    expect(text).not.toMatch(/matching score|canonical|weight|JSONB|customFields/i);
  });

  it('builds a joining card for a seeking viewer without contact fields', () => {
    const match = scorePartnershipSources(seekingListing(), joiningListing());
    const card = toPublicPartnershipMatchCard(joiningListing(), match);
    expect(card).not.toBeNull();
    expect(card?.href).toBe(`/ilan/${joiningListing().slug}`);
    expect(card?.expertise.length).toBeGreaterThan(0);
    expect(card?.sectors).toEqual(expect.arrayContaining(['Fintech']));
    expect(card?.experience).toBe('3-5 yıl');
    expect(card?.location).toBe('İstanbul');
    expect(card?.commitment).toBe('Yarı zamanlı');
    expect(card?.preferredVentureType).toBe('Teknik Ortak');
    expect(card?.reasons.length).toBeGreaterThanOrEqual(3);
    expect(card).not.toHaveProperty('customFields');
    expect(JSON.stringify(card)).not.toMatch(/contactPhone|contactEmail|contactWhatsapp/);
  });

  it('builds a seeking card for a joining viewer', () => {
    const match = scorePartnershipSources(joiningListing(), seekingListing());
    const card = toPublicPartnershipMatchCard(seekingListing(), match);
    expect(card?.stage).toBe('MVP aşaması');
    expect(card?.partnershipType).toBe('Teknik Ortak');
    expect(card?.expertise).toEqual(expect.arrayContaining(['React', 'Node.js']));
    expect(card?.sectors).toEqual(expect.arrayContaining(['Fintech']));
    expect(card?.location).toBe('İstanbul');
    expect(card?.commitment).toBe('Yarı zamanlı');
  });

  it('scores a marketing / e-commerce pair in the very-strong band', () => {
    const result = scorePartnershipProfiles(
      seekingProfile({
        title: 'E-ticaret girişimi pazarlama ortağı arıyor',
        skills: ['Pazarlama', 'Sosyal medya'],
        sectors: ['E-ticaret'],
        partnershipTypes: ['İş Ortağı'],
      }),
      joiningProfile({
        title: 'Pazarlama uzmanı',
        skills: ['Pazarlama', 'Sosyal medya'],
        sectors: ['E-ticaret'],
        partnershipTypes: ['İş Ortağı'],
      }),
    );
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.recommendable).toBe(true);
  });

  it('keeps browse, detail, and match card fields aligned for the same listing', () => {
    const listing = joiningListing();
    const profile = normalizePartnershipSource(listing);
    const match = scorePartnershipSources(seekingListing(), listing);
    const card = toPublicPartnershipMatchCard(listing, match);
    expect(card?.title).toBe(listing.title);
    expect(card?.href).toBe(`/ilan/${listing.slug}`);
    expect(card?.sectors).toEqual(profile.sectors.slice(0, 4));
    expect(card?.expertise).toEqual(profile.skills.slice(0, 6));
    expect(card?.location).toBe(profile.location);
    expect(card?.commitment).toBe(profile.commitment);
    expect(card?.intent).toBe(profile.intent);
  });
});
