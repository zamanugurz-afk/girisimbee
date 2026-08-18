import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { DigitalSolutionMatchService } from '@/features/digital-solution-matching/service';
import { createCompany } from '@/features/companies/factories/company.factory';
import { createProfile } from '@/features/profiles/factories/profile.factory';

class MemoryDigitalListingStore {
  constructor(private readonly listings: Listing[]) {}

  async search(filter: ListingFilter, _pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    let list = [...this.listings];
    if (filter.ownerId) {
      list = list.filter((l) => l.ownerId === filter.ownerId);
    }
    if (filter.status && Array.isArray(filter.status)) {
      list = list.filter((l) => filter.status!.includes(l.status));
    }
    return { data: list, total: list.length, page: 1, limit: 100, hasMore: false };
  }

  async findPublished(filter: ListingFilter, _pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    let list = this.listings.filter((l) => l.status === 'published');
    if (filter.categoryId) {
      list = list.filter((l) => l.categoryId === filter.categoryId);
    }
    return { data: list, total: list.length, page: 1, limit: 100, hasMore: false };
  }
}

describe('Girişimbee Digital & AI Matching Stress & Acceptance Test Suite', () => {
  const consumerUser = ids.user('test-usr-syn-digital-consumer-1');
  const providerUser = ids.user('test-usr-syn-digital-provider-1');
  const otherProviderUser = ids.user('test-usr-syn-digital-provider-2');

  // Consumer Company (Restoran & Cafe KOBİ needing CRM & Otomasyon)
  const consumerCompany = createCompany({
    id: ids.company('test-cmp-syn-digital-restaurant'),
    ownerId: consumerUser,
    name: 'Gurme Restoran & Cafe Zinciri',
    city: 'İstanbul',
    industry: 'Gıda / Yeme İçme',
    employeeCount: '11-50',
    description: 'Restoran ve kafe işletmemiz için rezervasyon ve müşteri sadakat CRM yazılımı arıyoruz.',
    isVerified: true,
    status: 'active',
  });

  const consumerProfile = createProfile({
    id: ids.profile('test-prf-syn-digital-consumer'),
    userId: consumerUser,
    displayName: 'Mehmet Restoran Yöneticisi',
    phone: '05554443322',
    bio: 'Restoran zinciri operasyon yöneticisi.',
    location: 'İstanbul',
  });

  // Provider Solution Listing (CRM + Otomasyon SaaS targeting Restoran / KOBİ)
  const providerSolutionA = createListing({
    id: ids.listing('test-lst-syn-digital-sol-crm-restoran'),
    ownerId: providerUser,
    categoryId: CATEGORY_IDS.dijitalAi,
    listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
    title: 'Restoran ve Kafeler İçin Akıllı Rezervasyon ve Müşteri Sadakat CRM Sistemi',
    shortDescription: 'Restoranlara özel yapay zeka destekli sadakat ve otomasyon SaaS çözümü.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-02T00:00:00.000Z',
    customFields: {
      sector: 'Gıda / Yeme İçme',
      capabilities: ['crm', 'otomasyon', 'rezervasyon', 'yapay_zeka', 'musteri_sadakat'],
      solutionType: 'saas',
      deliveryModel: 'bulut',
      targetAudience: 'kobi, restoran, isletme',
      priceRange: '1500 - 5000 TL',
      supportedLanguages: ['Türkçe', 'İngilizce'],
      isAiPowered: true,
      demoAvailable: true,
      contactPhone: '05558887766',
      contactEmail: 'saas.provider@example.com',
    },
  });

  it('Scenario A: Restaurant + SME + CRM need <-> Restaurant/SME CRM SaaS (Çok Yüksek Eşleşme)', async () => {
    const store = new MemoryDigitalListingStore([providerSolutionA]);
    const service = new DigitalSolutionMatchService(
      store,
      { findByOwnerId: async () => consumerCompany },
      { findByUserId: async () => consumerProfile },
    );

    const matches = await service.getDigitalSolutionMatches(consumerUser);
    expect(matches.solutions).not.toBeNull();
    const topCard = matches.solutions!.matches[0];
    expect(topCard).toBeDefined();
    expect(topCard.score).toBeGreaterThanOrEqual(70);
    expect(['strong', 'very_strong']).toContain(topCard.band);
    // Privacy protection
    expect((topCard as any).contactPhone).toBeUndefined();
    expect((topCard as any).contactEmail).toBeUndefined();
  });

  it('Scenario B: Same Sector but Completely Different Capability (Muhasebe vs CRM)', async () => {
    const providerSolutionB = createListing({
      id: ids.listing('test-lst-syn-digital-sol-accounting'),
      ownerId: otherProviderUser,
      categoryId: CATEGORY_IDS.dijitalAi,
      listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
      title: 'Restoranlar İçin e-Fatura ve Muhasebe Entegrasyonu',
      shortDescription: 'Gıda işletmeleri için resmi muhasebe ve e-fatura modülü.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        sector: 'Gıda / Yeme İçme',
        capabilities: ['muhasebe', 'efatura', 'finans'],
        solutionType: 'saas',
        deliveryModel: 'bulut',
        targetAudience: 'kobi',
      },
    });

    const store = new MemoryDigitalListingStore([providerSolutionA, providerSolutionB]);
    const service = new DigitalSolutionMatchService(
      store,
      { findByOwnerId: async () => consumerCompany },
      { findByUserId: async () => consumerProfile },
    );

    const matches = await service.getDigitalSolutionMatches(consumerUser);
    const cards = matches.solutions?.matches || [];
    const crmCard = cards.find((c) => c.listingId === providerSolutionA.id);
    const accCard = cards.find((c) => c.listingId === providerSolutionB.id);

    expect(crmCard).toBeDefined();
    if (accCard && crmCard) {
      // Capability matching gives CRM solution a significantly higher score
      expect(crmCard.score).toBeGreaterThan(accCard.score);
    }
  });

  it('Scenario: Self-Match Prevention (Provider cannot match with their own solution)', async () => {
    const store = new MemoryDigitalListingStore([providerSolutionA]);
    const service = new DigitalSolutionMatchService(
      store,
      { findByOwnerId: async () => ({ ...consumerCompany, ownerId: providerUser }) },
      { findByUserId: async () => ({ ...consumerProfile, userId: providerUser }) },
    );

    const matches = await service.getDigitalSolutionMatches(providerUser);
    const cards = matches.solutions?.matches || [];
    expect(cards.some((c) => c.listingId === providerSolutionA.id)).toBe(false);
  });
});
