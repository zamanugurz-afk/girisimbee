import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter, pickCity, pickIndustry, loremWords } from '@/lib/domain/mock-utils';
import { createListing } from '@/features/listings/factories/listing.factory';
import { createSeedCategories } from '@/features/categories/factories/category.factory';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CategoryId, CompanyId, ListingTypeId, UserId } from '@/lib/domain/ids';

export interface MockListingContext {
  ownerId?: UserId;
  companyId?: CompanyId;
  categoryId?: CategoryId;
  listingTypeId?: ListingTypeId;
}

export function generateMockListing(index = 1, ctx: MockListingContext = {}): Listing {
  const categories = createSeedCategories();
  const category = categories[(index - 1) % categories.length];
  const isInvestment = category.slug === 'yatirim-bul';

  return createListing({
    id: ids.listing(mockUuid('d0000001')),
    slug: `ilan-${index}`,
    ownerId: ctx.ownerId ?? ids.user(mockUuid('a0000001')),
    companyId: ctx.companyId ?? (index % 2 === 0 ? ids.company(mockUuid('c0000001')) : null),
    categoryId: ctx.categoryId ?? category.id,
    listingTypeId: ctx.listingTypeId ?? ids.listingType(mockUuid('e0000001')),
    title: isInvestment
      ? `${pickIndustry(index)} SaaS Platformu — Seri A`
      : `${pickIndustry(index)} Ekibine ${index % 2 === 0 ? 'Senior Developer' : 'Product Manager'}`,
    shortDescription: loremWords(15).slice(0, 200),
    longDescription: loremWords(80),
    status: 'published',
    city: pickCity(index),
    country: 'TR',
    remotePolicy: index % 3 === 0 ? 'remote' : index % 3 === 1 ? 'hybrid' : 'onsite',
    investmentDetails: isInvestment
      ? { amountSought: 500000 * index, currency: 'TRY', equityOffered: '10%', stage: 'Series A', minInvestment: 50000, maxInvestment: 500000 }
      : null,
    jobDetails: !isInvestment
      ? { salaryMin: 40000, salaryMax: 80000, currency: 'TRY', employmentType: 'full_time', experienceLevel: 'senior', remotePolicy: 'hybrid' }
      : null,
    partnerDetails: category.slug === 'ortak-bul'
      ? { partnerType: 'technical', equityOffered: '15%', commitment: 'Tam zamanlı' }
      : null,
    viewCount: index * 42,
    applicationCount: index * 3,
    isVerified: index % 5 === 0,
    isFeatured: index <= 3,
    publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
  });
}

export function generateMockListings(count: number, ctx: MockListingContext = {}): Listing[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockListing(i + 1, ctx));
}
