import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { CareerMatchService } from '@/features/matching-engine/career-match.service';

const SEEKER_ID = ids.user('seeker-1');
const HIRER_ID = ids.user('hirer-1');

const ALIGNED_FIELDS = {
  desiredRole: 'Yazılım geliştirici',
  primarySector: 'Bilişim / Yazılım',
  experienceLevel: 'Mid',
  professionalSkills: 'İletişim · Analitik düşünme · Problem çözme · Takım çalışması',
  technicalSkills: 'JavaScript · TypeScript · React · SQL',
  workType: 'Tam zamanlı',
  workplacePreference: 'Hibrit',
  preferredCity: 'İstanbul',
  educationLevel: 'Lisans',
  languages: 'İngilizce — İyi, Türkçe — Ana Dil',
};

function pageOf(data: Listing[]): PaginatedResult<Listing> {
  return { data, total: data.length, page: 1, limit: data.length || 20, hasMore: false };
}

function seekListing(overrides: Partial<Listing> = {}) {
  return createListing({
    ownerId: SEEKER_ID,
    categoryId: CATEGORY_IDS.isBul,
    listingTypeId: LISTING_TYPE_IDS.isBulDefault,
    moduleKey: 'candidates',
    title: 'Yazılım geliştirici olarak iş arıyorum',
    shortDescription: 'Anonim kariyer özeti, en az yirmi karakter.',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: { ...ALIGNED_FIELDS },
    ...overrides,
  });
}

function hireListing(overrides: Partial<Listing> = {}) {
  return createListing({
    ownerId: HIRER_ID,
    categoryId: CATEGORY_IDS.iseAl,
    listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
    moduleKey: 'employers',
    title: 'Yazılım geliştirici arıyoruz',
    shortDescription: 'Açık pozisyon ilanı, en az yirmi karakter.',
    status: 'published',
    publishedAt: '2026-08-02T00:00:00.000Z',
    customFields: { ...ALIGNED_FIELDS },
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
    return pageOf(rows.slice(0, pagination?.limit ?? 80));
  }
}

describe('CareerMatchService', () => {
  it('returns recommendable hire matches for a published seeker listing', async () => {
    const strongHire = hireListing({
      title: 'Güçlü eşleşme ilanı',
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
      customFields: { ...ALIGNED_FIELDS, contactPhone: '05551234567', contactEmail: 'gizli@example.com' },
    });
    const weakHire = hireListing({
      title: 'Uyumsuz ilan',
      customFields: {
        desiredRole: 'Garson',
        primarySector: 'Turizm',
        professionalSkills: 'Servis',
        technicalSkills: 'Yok',
      },
    });
    const service = new CareerMatchService(
      new MemoryListingStore([seekListing(), strongHire, weakHire]),
    );

    const result = await service.getCareerMatches(SEEKER_ID);

    expect(result.candidates).toBeNull();
    expect(result.opportunities?.title).toBe('Size Uygun İş İlanları');
    expect(result.opportunities?.description).toBe(
      'Profilinize ve tercihlerinize göre sizin için öne çıkan fırsatları keşfedin.',
    );
    expect(result.opportunities?.matches.map((match) => match.title)).toEqual(['Güçlü eşleşme ilanı']);
    expect(result.opportunities?.matches[0]?.score).toBeGreaterThanOrEqual(80);

    const json = JSON.stringify(result);
    expect(json).not.toContain('05551234567');
    expect(json).not.toContain('gizli@example.com');
    expect(json).not.toMatch(/contactPhone|contactEmail|contactWhatsapp/);
    expect(result.opportunities?.matches[0]).not.toHaveProperty('customFields');
    expect(result.completion?.seek?.percent).toBeGreaterThan(0);
    expect(result.completion?.hire).toBeNull();
  });

  it('returns recommendable seeker matches for a published hire listing', async () => {
    const service = new CareerMatchService(
      new MemoryListingStore([hireListing(), seekListing()]),
    );

    const result = await service.getCareerMatches(HIRER_ID);

    expect(result.opportunities).toBeNull();
    expect(result.candidates?.title).toBe('Size Uygun Adaylar');
    expect(result.candidates?.description).toBe(
      'Açık pozisyonunuzun gereksinimlerine uygun aday profillerini keşfedin.',
    );
    expect(result.candidates?.matches).toHaveLength(1);
    expect(result.candidates?.matches[0]?.listingTypeLabel).toBe('İş Arıyorum');
  });

  it('shows a safe company label and a masked candidate name without contact fields', async () => {
    const hire = hireListing({
      title: 'Güvenli iş ilanı',
      contactEmail: 'gizli@example.com',
      customFields: { ...ALIGNED_FIELDS, companyName: 'Açık Yazılım A.Ş.' },
    });
    const seek = seekListing({
      title: 'Güvenli aday',
      contactPhone: '05551234567',
    });
    const service = new CareerMatchService(
      new MemoryListingStore([seek, hire]),
      {
        findProfilesByUserIds: async () => [
          { userId: SEEKER_ID, displayName: 'Ayşe Yılmaz' },
          { userId: HIRER_ID, displayName: 'Mehmet Demir' },
        ],
      },
    );

    const forSeeker = await service.getCareerMatches(SEEKER_ID);
    const forHirer = await service.getCareerMatches(HIRER_ID);

    expect(forSeeker.opportunities?.matches[0]?.partyLabel).toBe('Açık Yazılım A.Ş.');
    expect(forHirer.candidates?.matches[0]?.partyLabel).toBe('Ayşe ******');
    expect(JSON.stringify(forSeeker)).not.toContain('gizli@example.com');
    expect(JSON.stringify(forHirer)).not.toContain('05551234567');
  });

  it('returns recommendations for a listing on detail page', async () => {
    const seeker = seekListing();
    const hire = hireListing();
    const service = new CareerMatchService(
      new MemoryListingStore([seeker, hire]),
    );

    const recsForSeeker = await service.getListingRecommendations(seeker);
    expect(recsForSeeker).not.toBeNull();
    expect(recsForSeeker?.title).toBe('Sana Uygun İş İlanları');
    expect(recsForSeeker?.matches).toHaveLength(1);
    expect(recsForSeeker?.matches[0]?.listingId).toBe(String(hire.id));

    const recsForHire = await service.getListingRecommendations(hire);
    expect(recsForHire).not.toBeNull();
    expect(recsForHire?.title).toBe('Sana Uygun Adaylar');
    expect(recsForHire?.matches).toHaveLength(1);
    expect(recsForHire?.matches[0]?.listingId).toBe(String(seeker.id));
  });
});
