import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable, slugify } from '@/lib/domain/factory';
import type { ListingType, CreateListingTypeInput } from '@/features/listings/types/listing-type.types';

export function createListingType(
  overrides: Partial<ListingType> & Pick<ListingType, 'categoryId' | 'slug' | 'name' | 'fieldSchema'>,
): ListingType {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.listingType(crypto.randomUUID()),
    categoryId: overrides.categoryId,
    slug: overrides.slug,
    name: overrides.name,
    description: overrides.description ?? null,
    fieldSchema: overrides.fieldSchema,
    sortOrder: overrides.sortOrder ?? 0,
    status: overrides.status ?? 'active',
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createListingTypeInput(overrides: Partial<CreateListingTypeInput> = {}): CreateListingTypeInput {
  const name = overrides.name ?? 'Seri A';
  return {
    categoryId: overrides.categoryId ?? ids.category(crypto.randomUUID()),
    slug: overrides.slug ?? slugify(name),
    name,
    fieldSchema: overrides.fieldSchema ?? { fields: [] },
    description: overrides.description,
    sortOrder: overrides.sortOrder,
  };
}
