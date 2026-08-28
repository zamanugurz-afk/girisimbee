import { CURATED_LISTING_TEMPLATES } from '@/features/listings/mock/curated-seed-listings';
import { mockListingRepository, MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createSeedCategories } from '@/features/categories/factories/category.factory';
import { LISTING_TYPE_CONFIGS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import { ids } from '@/lib/domain/ids';

let seeded = false;

function slugifyTr(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${base || 'ilan'}-${index}`;
}

/** Populate mock listing repository with realistic curated listings for marketplace browse. */
export async function ensureMockListingsSeeded(
  repo: MockListingRepository = mockListingRepository,
): Promise<void> {
  if (seeded) return;

  const categories = createSeedCategories();

  for (let i = 0; i < CURATED_LISTING_TEMPLATES.length; i += 1) {
    const item = CURATED_LISTING_TEMPLATES[i];
    const category = categories.find((c) => c.slug === item.categorySlug) || categories[0];
    const typeConfig = LISTING_TYPE_CONFIGS.find((c) => c.categoryId === category.id);
    const index = i + 1;

    const listing = createListing({
      id: ids.listing(`d0000001-0001-4000-8000-${String(index).padStart(12, '0')}`),
      slug: slugifyTr(item.title, index),
      ownerId: ids.user('a0000001-0001-4000-8000-000000000001'),
      companyId: null,
      categoryId: category.id,
      listingTypeId: typeConfig?.listingTypeId ?? ids.listingType('e0000001-0001-4000-8000-000000000001'),
      title: item.title,
      shortDescription: item.shortDescription,
      longDescription: item.longDescription,
      status: 'published',
      city: item.city,
      district: item.district,
      industry: item.industry,
      country: 'TR',
      remotePolicy: item.remotePolicy as any,
      viewCount: 140 + index * 19,
      applicationCount: 3 + (index % 6),
      isVerified: index % 2 === 0,
      isFeatured: index % 3 === 0,
      isUrgent: index % 5 === 0,
      publishedAt: new Date(Date.now() - (index % 15) * 86400000).toISOString(),
    });

    (listing as any).customFields = item.customFields;
    repo.save(listing);
  }

  seeded = true;
}

export function resetMockListingSeed(): void {
  seeded = false;
}
