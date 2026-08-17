import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { PartnershipMatchService } from '@/features/partnership-matching/service';

const SEEKER_ID = ids.user('ps-seeker');
const JOINER_ID = ids.user('ps-joiner');
const OTHER_ID = ids.user('ps-other');

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

function pageOf(data: Listing[]): PaginatedResult<Listing> {
  return { data, total: data.length, page: 1, limit: data.length || 20, hasMore: false };
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

class MemoryListingStore {
  constructor(private readonly listings: Listing[]) {}

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
    return pageOf(rows.slice(0, pagination?.limit ?? 100));
  }
}

describe('PartnershipMatchService', () => {
  it('returns joining partners for a published seeking listing', async () => {
    const strong = joiningListing({
      title: 'Güçlü ortak profili',
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
      contactWhatsapp: '+905551112233',
      customFields: { ...JOINING_FIELDS, contactPhone: '05551234567', contactEmail: 'gizli@example.com' },
    });
    const weak = joiningListing({
      ownerId: OTHER_ID,
      title: 'Uyumsuz profil',
      customFields: {
        partnershipIntent: 'joining',
        expertise: ['Satış'],
        offeredSkills: ['Satış'],
        sectors: ['Gıda teknolojisi'],
        partnershipType: 'Danışman',
        commitment: 'Danışmanlık',
      },
    });
    const sameIntent = seekingListing({
      ownerId: OTHER_ID,
      title: 'Başka girişim',
    });
    const service = new PartnershipMatchService(new MemoryListingStore([seekingListing(), strong, weak, sameIntent]));

    const result = await service.getPartnershipMatches(SEEKER_ID);

    expect(result.ventures).toBeNull();
    expect(result.partners?.title).toBe('Size Uygun Ortaklar');
    expect(result.partners?.description).toContain('Girişiminizin ihtiyaçlarına');
    expect(result.partners?.matches.map((match) => match.title)).toEqual(['Güçlü ortak profili']);
    expect(result.partners?.matches[0]?.score).toBeGreaterThanOrEqual(80);
    expect(result.partners?.matches[0]?.href).toMatch(/^\/ilan\//);
    expect(result.partners?.matches[0]?.expertise.length).toBeGreaterThan(0);

    const json = JSON.stringify(result);
    expect(json).not.toContain('05551234567');
    expect(json).not.toContain('gizli@example.com');
    expect(json).not.toContain('+905551112233');
    expect(json).not.toMatch(/contactPhone|contactEmail|contactWhatsapp|customFields/);
    expect(result.partners?.matches[0]).not.toHaveProperty('customFields');
    expect(result.partners?.matches[0]).not.toHaveProperty('ownerId');
    expect(result.completion.seeking?.complete).toBe(true);
    expect(result.editListingId).toBeTruthy();
    expect(json).not.toMatch(/ownerId|ownerEmail|ownerPhone/);
  });

  it('returns seeking ventures for a published joining listing', async () => {
    const service = new PartnershipMatchService(
      new MemoryListingStore([
        joiningListing(),
        seekingListing({ title: 'Uyumlu girişim', ownerId: OTHER_ID }),
        joiningListing({ ownerId: OTHER_ID, title: 'Başka joining profili' }),
      ]),
    );

    const result = await service.getPartnershipMatches(JOINER_ID);

    expect(result.partners).toBeNull();
    expect(result.ventures?.title).toBe('Size Uygun Girişimler');
    expect(result.ventures?.description).toContain('Uzmanlığınıza');
    expect(result.ventures?.matches.map((match) => match.title)).toEqual(['Uyumlu girişim']);
    expect(result.ventures?.matches[0]?.stage).toBe('MVP aşaması');
    expect(result.ventures?.matches[0]?.partnershipType).toBe('Teknik Ortak');
  });

  it('keeps career listings out of the partnership pool', async () => {
    const career = createListing({
      ownerId: OTHER_ID,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: 'Kariyer ilanı',
      shortDescription: 'Bu bir kariyer ilanıdır ve ortaklık havuzuna girmemelidir.',
      status: 'published',
      customFields: { desiredRole: 'Yazılım geliştirici' },
    });
    const service = new PartnershipMatchService(new MemoryListingStore([seekingListing(), career]));
    const result = await service.getPartnershipMatches(SEEKER_ID);
    expect(result.partners?.matches).toEqual([]);
  });

  it('matches a legacy seeking listing that has no partnershipIntent', async () => {
    const legacy = seekingListing({
      customFields: {
        expertise: ['React', 'Node.js'],
        requiredSkills: ['React', 'Node.js'],
        sector: 'Fintech',
        partnershipType: 'Teknik Ortak',
        commitment: 'Yarı zamanlı',
        projectStage: 'MVP aşaması',
        equityOffered: 15,
      },
    });
    const service = new PartnershipMatchService(new MemoryListingStore([legacy, joiningListing()]));
    const result = await service.getPartnershipMatches(SEEKER_ID);
    expect(result.partners?.sourceIntent).toBe('seeking');
    expect(result.partners?.matches[0]?.title).toBe('Yazılım geliştirici ortak olmak istiyor');
  });

  it('points the empty-state edit CTA at a draft partnership listing', async () => {
    const draft = seekingListing({
      status: 'draft',
      publishedAt: null,
      title: 'Taslak ortaklık ilanı',
    });
    const service = new PartnershipMatchService(new MemoryListingStore([draft]));
    const result = await service.getPartnershipMatches(SEEKER_ID);
    expect(result.partners).toBeNull();
    expect(result.ventures).toBeNull();
    expect(result.presence.seeking).toBe('draft');
    expect(result.editListingId).toBe(String(draft.id));
  });

  it('returns recommendations for partnership listing detail page', async () => {
    const seeking = seekingListing();
    const joining = joiningListing();
    const service = new PartnershipMatchService(new MemoryListingStore([seeking, joining]));

    const recsForSeeking = await service.getListingRecommendations(seeking);
    expect(recsForSeeking).not.toBeNull();
    expect(recsForSeeking?.title).toBe('Sana Uygun Ortaklar');
    expect(recsForSeeking?.matches).toHaveLength(1);
    expect(recsForSeeking?.matches[0]?.listingId).toBe(String(joining.id));

    const recsForJoining = await service.getListingRecommendations(joining);
    expect(recsForJoining).not.toBeNull();
    expect(recsForJoining?.title).toBe('Sana Uygun Girişimler');
    expect(recsForJoining?.matches).toHaveLength(1);
    expect(recsForJoining?.matches[0]?.listingId).toBe(String(seeking.id));
  });
});
