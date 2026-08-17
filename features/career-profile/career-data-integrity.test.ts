import { describe, expect, it } from 'vitest';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import { calculateCareerProfileCompletion } from '@/features/career-profile/completion';
import {
  CAREER_DATA_CONTRACT,
  CAREER_FIELD_ALIASES,
  extractCareerMatchProfile,
  normalizeCareerSource,
} from '@/features/career-profile/normalize';
import { CAREER_PROFILE_FIELD_WEIGHTS } from '@/features/career-profile/completion';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { toPublicCareerMatchCard } from '@/features/matching-engine/adapters/public-card';
import { CareerMatchService } from '@/features/matching-engine/career-match.service';
import { calculateCareerMatch } from '@/features/matching-engine/engine';
import { scoreNormalizedCareerSources } from '@/features/matching-engine/normalized-match';
import { MATCH_SECTION_COPY } from '@/features/matching-engine/presentation/career-match-copy';
import { CAREER_MATCH_WEIGHTS } from '@/features/matching-engine/scoring';

const SEEKER_ID = ids.user('integrity-seeker');
const HIRER_ID = ids.user('integrity-hirer');

const ALIGNED_SCENARIO = {
  role: 'Dijital Pazarlama Uzmanı',
  sector: 'Teknoloji',
  experienceLevel: '3+ yıl',
  professionalSkills: 'SEO',
  technicalSkills: 'Google Ads',
  workplacePreference: 'Hibrit',
  city: 'İstanbul',
} as const;

function pageOf(data: Listing[]): PaginatedResult<Listing> {
  return { data, total: data.length, page: 1, limit: data.length || 20, hasMore: false };
}

function seekListing(customFields: Record<string, unknown>, overrides: Partial<Listing> = {}) {
  return createListing({
    ownerId: SEEKER_ID,
    categoryId: CATEGORY_IDS.isBul,
    listingTypeId: LISTING_TYPE_IDS.isBulDefault,
    moduleKey: 'candidates',
    title: 'Dijital pazarlama uzmanı olarak iş arıyorum',
    shortDescription: 'Anonim kariyer özeti, en az yirmi karakter.',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields,
    ...overrides,
  });
}

function hireListing(customFields: Record<string, unknown>, overrides: Partial<Listing> = {}) {
  return createListing({
    ownerId: HIRER_ID,
    categoryId: CATEGORY_IDS.iseAl,
    listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
    moduleKey: 'employers',
    title: 'Dijital pazarlama uzmanı arıyoruz',
    shortDescription: 'Açık pozisyon ilanı, en az yirmi karakter.',
    status: 'published',
    publishedAt: '2026-08-02T00:00:00.000Z',
    customFields,
    ...overrides,
  });
}

class MemoryListingStore {
  constructor(private listings: Listing[]) {}

  replace(next: Listing[]) {
    this.listings = next;
  }

  async search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const statuses = filter.status ? (Array.isArray(filter.status) ? filter.status : [filter.status]) : null;
    const rows = this.listings.filter((listing) => {
      if (filter.ownerId && listing.ownerId !== filter.ownerId) return false;
      if (statuses && !statuses.includes(listing.status)) return false;
      return true;
    });
    return pageOf(rows.slice(0, pagination?.limit ?? 100));
  }

  async findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const rows = this.listings.filter((listing) => {
      if (listing.status !== 'published') return false;
      if (filter.listingTypeIds && !filter.listingTypeIds.includes(listing.listingTypeId)) return false;
      return true;
    });
    return pageOf(rows.slice(0, pagination?.limit ?? 80));
  }
}

function alignedSeekFields() {
  return {
    desiredRole: ALIGNED_SCENARIO.role,
    primarySector: ALIGNED_SCENARIO.sector,
    experienceLevel: ALIGNED_SCENARIO.experienceLevel,
    professionalSkills: ALIGNED_SCENARIO.professionalSkills,
    technicalSkills: ALIGNED_SCENARIO.technicalSkills,
    workplacePreference: ALIGNED_SCENARIO.workplacePreference,
    preferredCity: ALIGNED_SCENARIO.city,
  };
}

function alignedHireFields() {
  return {
    positionTitle: ALIGNED_SCENARIO.role,
    primarySector: ALIGNED_SCENARIO.sector,
    experienceLevel: ALIGNED_SCENARIO.experienceLevel,
    professionalSkills: ALIGNED_SCENARIO.professionalSkills,
    technicalSkills: ALIGNED_SCENARIO.technicalSkills,
    workplacePreference: ALIGNED_SCENARIO.workplacePreference,
    preferredCity: ALIGNED_SCENARIO.city,
  };
}

function expectNoContactLeak(value: unknown) {
  const json = JSON.stringify(value);
  expect(json).not.toMatch(/contactPhone|contactEmail|contactWhatsapp|contactWebsite/i);
  expect(json).not.toContain('05551234567');
  expect(json).not.toContain('gizli@example.com');
  expect(json).not.toContain('+905551112233');
}

describe('career data contract', () => {
  it('documents the canonical fields used across form, profile, matching, and cards', () => {
    expect(CAREER_DATA_CONTRACT.map((row) => row.canonical)).toEqual([
      'role',
      'sector',
      'professionalSkills',
      'technicalSkills',
      'experienceLevel',
      'workType',
      'workplacePreference',
      'location',
      'educationLevel',
      'languages',
      'availability',
      'requiredResponsibilities',
    ]);
    expect(CAREER_FIELD_ALIASES.role).toEqual(expect.arrayContaining(['desiredRole', 'positionTitle']));
    expect(CAREER_FIELD_ALIASES.workType).toEqual(['workType', 'employmentType']);
    expect(CAREER_FIELD_ALIASES.location).toEqual(['preferredCity', 'city', 'location']);
    expect(CAREER_FIELD_ALIASES.sector).toEqual(expect.arrayContaining(['primarySector', 'preferredSectors']));
  });

  it('keeps matching and completion weights unchanged', () => {
    expect(CAREER_MATCH_WEIGHTS).toEqual({
      role: 25,
      sector: 15,
      professionalSkills: 12,
      technicalSkills: 8,
      experience: 10,
      workModel: 10,
      location: 15,
      salary: 3,
      availability: 2,
      language: 0,
      education: 0,
    });
    expect(CAREER_PROFILE_FIELD_WEIGHTS).toEqual({
      role: 20,
      sector: 15,
      experience: 10,
      professionalSkills: 15,
      technicalSkills: 15,
      workType: 5,
      workplacePreference: 5,
      location: 5,
      education: 3,
      languages: 4,
      availability: 3,
      candidateTraits: 3,
    });
  });
});

describe('canonical field normalization', () => {
  it('maps desiredRole and positionTitle to the same canonical role', () => {
    const seeker = normalizeCareerSource({ customFields: { desiredRole: ALIGNED_SCENARIO.role } });
    const hire = normalizeCareerSource({ customFields: { positionTitle: ALIGNED_SCENARIO.role } });
    expect(seeker.role).toBe(ALIGNED_SCENARIO.role);
    expect(hire.role).toBe(ALIGNED_SCENARIO.role);
    expect(seeker.role).toBe(hire.role);
  });

  it('maps workType and employmentType to the same canonical work type', () => {
    const seeker = normalizeCareerSource({ customFields: { workType: 'Tam zamanlı' } });
    const hire = normalizeCareerSource({ customFields: { employmentType: 'Tam zamanlı' } });
    expect(seeker.workType).toBe('Tam zamanlı');
    expect(hire.workType).toBe('Tam zamanlı');
  });

  it('maps preferredCity and listing.city to the same canonical location', () => {
    const fromPreferred = normalizeCareerSource({ customFields: { preferredCity: 'İstanbul' } });
    const fromListingCity = normalizeCareerSource({ city: 'İstanbul', customFields: {} });
    expect(fromPreferred.city).toBe('İstanbul');
    expect(fromListingCity.city).toBe('İstanbul');
  });

  it('does not crash on missing or malformed sources', () => {
    expect(() => normalizeCareerSource(null)).not.toThrow();
    expect(() => normalizeCareerSource(undefined)).not.toThrow();
    expect(() => normalizeCareerSource({ customFields: null })).not.toThrow();
    expect(() => scoreNormalizedCareerSources(null, undefined)).not.toThrow();
    expect(normalizeCareerSource(null).role).toBeNull();
    expect(scoreNormalizedCareerSources(null, null).score).toBe(0);
  });
});

describe('end-to-end career matching integrity', () => {
  it('scenario 1: aligned seeker and hire produce a high match', () => {
    const result = scoreNormalizedCareerSources(
      { customFields: alignedSeekFields() },
      { customFields: alignedHireFields() },
    );
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.recommendable).toBe(true);
    expect(result.band).toBe('very_strong');
  });

  it('scenario 2: same role with completely different skills lowers the score', () => {
    const aligned = scoreNormalizedCareerSources(
      { customFields: alignedSeekFields() },
      { customFields: alignedHireFields() },
    );
    const mismatched = scoreNormalizedCareerSources(
      {
        customFields: {
          ...alignedSeekFields(),
          professionalSkills: 'Satış',
          technicalSkills: 'Excel',
        },
      },
      { customFields: alignedHireFields() },
    );
    expect(mismatched.score).toBeLessThan(aligned.score);
    expect(mismatched.dimensions.find((dimension) => dimension.key === 'professionalSkills')?.score).toBe(0);
    expect(mismatched.dimensions.find((dimension) => dimension.key === 'technicalSkills')?.score).toBe(0);
  });

  it('scenario 3: empty location is not treated as incompatible', () => {
    const withCity = scoreNormalizedCareerSources(
      { customFields: alignedSeekFields() },
      { customFields: alignedHireFields() },
    );
    const emptyLocation = scoreNormalizedCareerSources(
      { customFields: { ...alignedSeekFields(), preferredCity: '' } },
      { customFields: { ...alignedHireFields(), preferredCity: '' } },
    );
    expect(emptyLocation.dimensions.find((dimension) => dimension.key === 'location')?.comparable).toBe(false);
    expect(emptyLocation.score).toBe(withCity.score);
    expect(emptyLocation.reasons.some((reason) => reason.text.includes('Lokasyon'))).toBe(false);
  });

  it('scenario 4: a missing sector drops that weight instead of forcing a mismatch', () => {
    const result = scoreNormalizedCareerSources(
      { customFields: { ...alignedSeekFields(), primarySector: '' } },
      { customFields: alignedHireFields() },
    );
    expect(result.dimensions.find((dimension) => dimension.key === 'sector')?.comparable).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('scenario 5: seeker desiredRole matches hire positionTitle', () => {
    const result = scoreNormalizedCareerSources(
      { customFields: { desiredRole: ALIGNED_SCENARIO.role } },
      { customFields: { positionTitle: ALIGNED_SCENARIO.role } },
    );
    expect(extractCareerMatchProfile({ customFields: { desiredRole: ALIGNED_SCENARIO.role } }).role).toBe(
      extractCareerMatchProfile({ customFields: { positionTitle: ALIGNED_SCENARIO.role } }).role,
    );
    expect(result.dimensions.find((dimension) => dimension.key === 'role')?.score).toBe(1);
  });

  it('scenario 6: workType and employmentType compare as the same work model', () => {
    const result = scoreNormalizedCareerSources(
      {
        customFields: {
          desiredRole: ALIGNED_SCENARIO.role,
          workType: 'Tam zamanlı',
          workplacePreference: 'Hibrit',
        },
      },
      {
        customFields: {
          positionTitle: ALIGNED_SCENARIO.role,
          employmentType: 'Tam zamanlı',
          workplacePreference: 'Hibrit',
        },
      },
    );
    expect(result.dimensions.find((dimension) => dimension.key === 'workModel')?.score).toBe(1);
  });

  it('scenario 7: public cards never leak contact channels or customFields', () => {
    const hire = hireListing(
      {
        ...alignedHireFields(),
        contactPhone: '05551234567',
        contactEmail: 'gizli@example.com',
        contactWhatsapp: '+905551112233',
      },
      {
        contactPhone: '05551234567',
        contactEmail: 'gizli@example.com',
        contactWhatsapp: '+905551112233',
      },
    );
    const match = scoreNormalizedCareerSources({ customFields: alignedSeekFields() }, hire);
    const card = toPublicCareerMatchCard(hire, 'hire', match, {
      profile: extractCareerMatchProfile(hire),
      partyLabel: 'Açık Yazılım A.Ş.',
    });

    expect(card).not.toBeNull();
    expect(card).not.toHaveProperty('customFields');
    expect(card?.location).toBe('İstanbul');
    expect(card?.workModel).toBe('Hibrit');
    expect(card?.highlightSkills).toEqual(expect.arrayContaining(['SEO', 'Google Ads']));
    expectNoContactLeak(extractCareerMatchProfile(hire));
    expectNoContactLeak(match);
    expectNoContactLeak(card);
  });

  it('keeps seek → hire and hire → seek scores equal for the same pair', async () => {
    const seek = seekListing(alignedSeekFields());
    const hire = hireListing(alignedHireFields());
    const service = new CareerMatchService(new MemoryListingStore([seek, hire]));
    const forSeeker = await service.getCareerMatches(SEEKER_ID);
    const forHirer = await service.getCareerMatches(HIRER_ID);
    expect(forSeeker.opportunities?.matches[0]?.score).toBe(forHirer.candidates?.matches[0]?.score);
    expect(MATCH_SECTION_COPY.opportunities.reviewCta).toBe('İlanı İncele');
    expect(MATCH_SECTION_COPY.candidates.reviewCta).toBe('Adayı İncele');
  });

  it('does not let completion percent change the matching score', () => {
    const seeker = { customFields: alignedSeekFields() };
    const hire = { customFields: alignedHireFields() };
    const before = scoreNormalizedCareerSources(seeker, hire);
    const partial = calculateCareerProfileCompletion({
      kind: 'seek',
      source: { customFields: { desiredRole: ALIGNED_SCENARIO.role, primarySector: ALIGNED_SCENARIO.sector } },
    });
    const complete = calculateCareerProfileCompletion({
      kind: 'seek',
      source: {
        city: 'İstanbul',
        customFields: {
          ...alignedSeekFields(),
          workType: 'Tam zamanlı',
          educationLevel: 'Lisans',
          languages: 'İngilizce — İyi, Türkçe — Ana Dil',
          availability: 'Hemen',
        },
      },
    });
    const after = scoreNormalizedCareerSources(seeker, hire);

    expect(partial.percent).toBeGreaterThan(0);
    expect(partial.percent).toBeLessThan(100);
    expect(complete.percent).toBe(100);
    expect(after.score).toBe(before.score);
    expect(calculateCareerMatch(extractCareerMatchProfile(seeker), extractCareerMatchProfile(hire)).score).toBe(
      before.score,
    );
  });

  it('recomputes matches at runtime after the profile fields change', async () => {
    const seek = seekListing(alignedSeekFields());
    const hire = hireListing(alignedHireFields());
    const store = new MemoryListingStore([seek, hire]);
    const service = new CareerMatchService(store);

    const first = await service.getCareerMatches(SEEKER_ID);
    const firstScore = first.opportunities?.matches[0]?.score;
    expect(firstScore).toBeGreaterThanOrEqual(80);
    expect(seek).not.toHaveProperty('matching_score');
    expect(hire).not.toHaveProperty('matching_score');

    store.replace([
      seek,
      hireListing({
        ...alignedHireFields(),
        professionalSkills: 'Satış',
        technicalSkills: 'Excel',
      }),
    ]);

    const second = await service.getCareerMatches(SEEKER_ID);
    expect(second.opportunities?.matches[0]?.score).toBeLessThan(firstScore ?? 0);
  });

  it('runs the real service for both seek → hire and hire → seek presentation', async () => {
    const seek = seekListing(alignedSeekFields(), {
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
    });
    const hire = hireListing(alignedHireFields(), {
      contactPhone: '05559876543',
      contactEmail: 'isveren@example.com',
    });
    const service = new CareerMatchService(new MemoryListingStore([seek, hire]), {
      findProfilesByUserIds: async () => [{ userId: SEEKER_ID, displayName: 'Ayşe Yılmaz' }],
    });

    const opportunities = await service.getCareerMatches(SEEKER_ID);
    const candidates = await service.getCareerMatches(HIRER_ID);

    expect(opportunities.opportunities?.matches[0]?.href).toMatch(/^\/ilan\//);
    expect(opportunities.opportunities?.matches[0]?.title).toBe(hire.title);
    expect(candidates.candidates?.matches[0]?.href).toMatch(/^\/ilan\//);
    expect(candidates.candidates?.matches[0]?.partyLabel).toBe('Ayşe ******');
    expect(candidates.candidates?.matches[0]?.experienceLabel).toBe('3+ yıl');
    expect(candidates.candidates?.matches[0]?.location).toBe('İstanbul');
    expect(candidates.candidates?.matches[0]?.workModel).toBe('Hibrit');
    expectNoContactLeak(opportunities);
    expectNoContactLeak(candidates);
  });

  it('keeps public preview fields aligned with the match card and hides contact data', () => {
    const seek = seekListing({
      ...alignedSeekFields(),
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
    });
    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      displayName: 'Ayşe Yılmaz',
      source: seek,
    });
    const match = scoreNormalizedCareerSources(seek, { customFields: alignedHireFields() });
    const card = toPublicCareerMatchCard(seek, 'seek', match, {
      profile: extractCareerMatchProfile(seek),
      partyLabel: 'Ayşe ******',
    });

    expect(preview.desiredRole).toBe(ALIGNED_SCENARIO.role);
    expect(preview.preferredCity).toBe('İstanbul');
    expect(preview.workplacePreference).toBe('Hibrit');
    expect(preview.professionalSkills).toContain('SEO');
    expect(preview.displayNameMasked).toBe('Ayşe ******');
    expect(preview).not.toHaveProperty('contactPhone');
    expect(card?.partyLabel).toBe(preview.displayNameMasked);
    expect(card?.location).toBe(preview.preferredCity);
    expect(card?.workModel).toBe(preview.workplacePreference);
    expectNoContactLeak(preview);
    expectNoContactLeak(card);
  });
});
