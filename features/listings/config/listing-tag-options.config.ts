/**
 * Structured tag groups per listing category.
 * Values are stored as a flat string[] on the listing (max 10).
 */
import type { CategoryId } from '@/lib/domain/ids';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import { LANGUAGE_OPTIONS } from '@/features/listings/config/listing-field-options';

export interface ListingTagGroup {
  id: string;
  label: string;
  options: readonly string[];
}

const LANGUAGE_TAG_GROUP: ListingTagGroup = {
  id: 'language',
  label: 'Dil',
  options: [...LANGUAGE_OPTIONS],
};

export const LISTING_TAG_MAX = 10;

export function getListingTagGroups(categoryId: CategoryId): ListingTagGroup[] {
  if (categoryId === CATEGORY_IDS.iseAl) {
    return [LANGUAGE_TAG_GROUP];
  }
  return [];
}

export function getAllListingTagOptions(categoryId: CategoryId): string[] {
  return getListingTagGroups(categoryId).flatMap((group) => [...group.options]);
}
