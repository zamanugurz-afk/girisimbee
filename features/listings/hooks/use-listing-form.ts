'use client';

import { useMemo } from 'react';
import { categoryRegistry } from '@/features/listings/config/category-registry';
import {
  LISTING_TYPE_CONFIGS,
  type CategoryListingTypeConfig,
} from '@/features/listings/config/listing-type-config';
import { createListingType } from '@/features/listings/factories/listing-type.factory';
import { createCategory } from '@/features/categories/factories/category.factory';
import {
  buildCreateListingFormSchema,
  buildUpdateListingFormSchema,
  getListingFormDefaults,
} from '@/features/listings/form/build-dynamic-schema';
import type { ListingTypeId, CategoryId } from '@/lib/domain/ids';
import type { ListingType } from '@/features/listings/types/listing-type.types';
import type { Category } from '@/features/categories/types/category.entity.types';
import type { ListingFormValues } from '@/features/listings/form/dynamic-listing-form';

function configToListingType(config: CategoryListingTypeConfig): ListingType {
  return createListingType({
    id: config.listingTypeId,
    categoryId: config.categoryId,
    slug: config.slug,
    name: config.name,
    description: config.description,
    fieldSchema: config.fieldSchema,
    sortOrder: config.sortOrder,
    status: 'active',
  });
}

function resolveListingType(listingTypeId: ListingTypeId | null): ListingType | null {
  if (!listingTypeId) return null;
  const fromRegistry = categoryRegistry.getListingType(listingTypeId);
  if (fromRegistry) return fromRegistry;
  const config = LISTING_TYPE_CONFIGS.find((c) => c.listingTypeId === listingTypeId);
  return config ? configToListingType(config) : null;
}

function resolveCategory(categoryId: CategoryId | null): Category | null {
  if (!categoryId) return null;
  const fromRegistry = categoryRegistry.getCategory(categoryId);
  if (fromRegistry) return fromRegistry;
  const config = LISTING_TYPE_CONFIGS.find((c) => c.categoryId === categoryId);
  if (!config) return null;
  return createCategory({
    id: config.categoryId,
    slug: config.slug,
    name: config.name,
    description: config.description,
    accentColor: '#0EA5E9',
    sortOrder: config.sortOrder,
  });
}

export function useListingFormConfig(categoryId: CategoryId | null, listingTypeId: ListingTypeId | null) {
  const listingType = useMemo(() => resolveListingType(listingTypeId), [listingTypeId]);
  const category = useMemo(() => resolveCategory(categoryId), [categoryId]);
  const listingTypes = useMemo(() => {
    if (!categoryId) return [];
    const fromRegistry = categoryRegistry.getListingTypesByCategory(categoryId);
    if (fromRegistry.length > 0) return fromRegistry;
    return LISTING_TYPE_CONFIGS.filter((c) => c.categoryId === categoryId).map(configToListingType);
  }, [categoryId]);

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
  const listingType = useMemo(() => resolveListingType(listingTypeId), [listingTypeId]);
  return useMemo(
    () => (listingType ? (getListingFormDefaults(listingType.fieldSchema) as ListingFormValues) : null),
    [listingType],
  );
}
