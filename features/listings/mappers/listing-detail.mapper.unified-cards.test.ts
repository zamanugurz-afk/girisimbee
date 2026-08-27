import { describe, expect, it } from 'vitest';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';
import { createListing } from '@/features/listings/factories/listing.factory';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { ids } from '@/lib/domain/ids';

describe('Unified Card Listing Mapper Tests', () => {
  it('maps partnership listings to partnershipCard with complete structured fields', () => {
    const listing = createListing({
      id: ids.listing('l1000001-0001-4000-8000-000000000010'),
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'SaaS Finansal Teknoloji Girişimi',
      slug: 'saas-finansal-teknoloji-girisimi',
      status: 'published',
      customFields: {
        companyName: 'FinPay Yazılım',
        sector: 'Finans / Yazılım',
        projectStage: 'MVP - Gelir Üreten',
        businessModel: 'B2B SaaS',
        targetCustomer: 'KOBİ ve Kurumsal',
        equityOffered: 25,
        investmentAmount: '1.250.000 TL',
        monthlyRevenue: '75.000 TL',
        commitment: 'Tam Zamanlı',
        partnershipTypes: ['Teknik Kurucu Ortak', 'Stratejik Ortak'],
        professionalSkills: ['Satış & İş Geliştirme', 'Dijital Pazarlama', 'Liderlik'],
        technicalSkills: ['Python', 'SQL', 'Figma'],
        tools: ['CRM', 'ERP', 'Excel'],
        problem: 'KOBİ’lerin finansal nakit akışını yönetmede yaşadığı operasyonel verimsizlikler.',
        solution: 'Yapay zeka destekli otomatik nakit akışı ve fatura takip platformu.',
      },
    });

    const detail = aggregateToListingDetail({
      listing,
      tags: [],
      images: [],
      attachments: [],
      activityHistory: [],
    });

    expect(detail.category.id).toBe('find-partner');
    expect(detail.partnershipCard).toBeDefined();
    expect(detail.partnershipCard?.equityOffered).toBe(25);
    expect(detail.partnershipCard?.stage).toBe('MVP - Gelir Üreten');
    expect(detail.partnershipCard?.monthlyRevenue).toBe('75.000 TL');
    expect(detail.partnershipCard?.professionalSkills).toContain('Satış & İş Geliştirme');
    expect(detail.partnershipCard?.technicalSkills).toContain('Python');
    expect(detail.partnershipCard?.tools).toContain('CRM');
  });

  it('maps franchise listings to franchiseCard with complete structured fields', () => {
    const listing = createListing({
      id: ids.listing('l1000001-0001-4000-8000-000000000011'),
      categoryId: CATEGORY_IDS.franchise,
      listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
      moduleKey: 'franchise',
      title: 'Brew & Go Coffee Franchise',
      slug: 'brew-and-go-coffee',
      status: 'published',
      customFields: {
        companyName: 'Brew & Go Coffee',
        establishmentYear: 2018,
        franchiseModel: 'Cadde & AVM Mağazası',
        sector: 'Gıda / Kafe',
        branchCount: 45,
        totalInvestment: '850.000 TL',
        franchiseFee: '150.000 TL',
        profitMargin: 40,
        returnPeriod: '18 - 24 Ay',
        royaltyFee: '%3 / Ay',
        trainingSupport: true,
        locationSupport: true,
        marketingSupport: true,
        exclusiveTerritory: true,
        availableCities: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'],
        minSquareMeters: 80,
      },
    });

    const detail = aggregateToListingDetail({
      listing,
      tags: [],
      images: [],
      attachments: [],
      activityHistory: [],
    });

    expect(detail.category.id).toBe('franchise');
    expect(detail.franchiseCard).toBeDefined();
    expect(detail.franchiseCard?.companyName).toBe('Brew & Go Coffee');
    expect(detail.franchiseCard?.branchCount).toBe(45);
    expect(detail.franchiseCard?.totalInvestment).toBe('850.000 TL');
    expect(detail.franchiseCard?.profitMargin).toBe(40);
    expect(detail.franchiseCard?.trainingSupport).toBe(true);
    expect(detail.franchiseCard?.availableCities).toContain('İstanbul');
    expect(detail.franchiseCard?.minSquareMeters).toBe(80);
  });
});
