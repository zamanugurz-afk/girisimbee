'use client';

import { useMemo } from 'react';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  buildCreateListingFormSchema,
  buildUpdateListingFormSchema,
  getListingFormDefaults,
} from '@/features/listings/form/build-dynamic-schema';
import type { ListingTypeId, CategoryId } from '@/lib/domain/ids';
import type { ListingFormValues } from '@/features/listings/form/dynamic-listing-form';

export function useListingFormConfig(categoryId: CategoryId | null, listingTypeId: ListingTypeId | null) {
  const listingType = listingTypeId ? categoryRegistry.getListingType(listingTypeId) : null;
  const category = categoryId ? categoryRegistry.getCategory(categoryId) : null;
  const listingTypes = categoryId ? categoryRegistry.getListingTypesByCategory(categoryId) : [];

  const createSchema = useMemo(
    () => (listingType ? buildCreateListingFormSchema(listingType.fieldSchema) : null),
    [listingType],
  );

  const updateSchema = useMemo(
    () => (listingType ? buildUpdateListingFormSchema(listingType.fieldSchema) : null),
    [listingType],
  );

  const defaults = useMemo(
    () => (listingType ? getListingFormDefaults(listingType.fieldSchema) : null),
    [listingType],
  );

  return {
    category,
    listingType,
    listingTypes,
    createSchema,
    updateSchema,
    defaults,
    isReady: Boolean(listingType && category),
  };
}

export function useListingFormDefaults(listingTypeId: ListingTypeId | null): ListingFormValues | null {
  const listingType = listingTypeId ? categoryRegistry.getListingType(listingTypeId) : null;
  return useMemo(
    () => (listingType ? getListingFormDefaults(listingType.fieldSchema) as ListingFormValues : null),
    [listingType],
  );
}
