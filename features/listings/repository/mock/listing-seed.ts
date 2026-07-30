import { generateMockListings } from '@/features/listings/mock/listing.generator';
import { mockListingRepository, MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { createSeedCategories } from '@/features/categories/factories/category.factory';
import { LISTING_TYPE_CONFIGS } from '@/features/listings/config/listing-type-config';

let seeded = false;

/** Populate mock listing repository with published listings for marketplace browse. */
export async function ensureMockListingsSeeded(
  repo: MockListingRepository = mockListingRepository,
): Promise<void> {
  if (seeded) return;

  const { total } = await repo.findMany({ status: 'published' }, { page: 1, limit: 1 });
  if (total > 0) {
    seeded = true;
    return;
  }

  const categories = createSeedCategories();
  const listings = generateMockListings(24);

  for (let i = 0; i < listings.length; i += 1) {
    const category = categories[i % categories.length];
    const typeConfig = LISTING_TYPE_CONFIGS.find((c) => c.categoryId === category.id);
    repo.save({
      ...listings[i],
      categoryId: category.id,
      listingTypeId: typeConfig?.listingTypeId ?? listings[i].listingTypeId,
      status: 'published',
      slug: `demo-${category.slug}-${i + 1}`,
    });
  }

  seeded = true;
}

export function resetMockListingSeed(): void {
  seeded = false;
}
