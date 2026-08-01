import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type { ListingType } from '@/features/listings/types/listing-type.types';
import type { Category } from '@/features/categories/types/category.entity.types';
import { createCategory, SEED_CATEGORIES } from '@/features/categories/factories/category.factory';
import { createListingType } from '@/features/listings/factories/listing-type.factory';
import {
  LISTING_TYPE_CONFIGS,
  CATEGORY_SLUG_TO_ID,
  CATEGORY_IDS,
  type CategoryListingTypeConfig,
} from '@/features/listings/config/listing-type-config';

/** In-memory registry — single source of truth for category → listing type → field schema. */
class CategoryRegistry {
  private categories = new Map<string, Category>();
  private listingTypes = new Map<string, ListingType>();
  private byCategoryId = new Map<string, ListingType[]>();

  constructor() {
    this.seed();
  }

  private seed() {
    SEED_CATEGORIES.forEach((input, i) => {
      const slug = input.slug;
      const id = CATEGORY_SLUG_TO_ID[slug];
      if (!id) return;
      const category = createCategory({ ...input, id, listingCount: (i + 1) * 100 });
      this.categories.set(id, category);
      this.categories.set(slug, category);
    });

    for (const config of LISTING_TYPE_CONFIGS) {
      const listingType = createListingType({
        id: config.listingTypeId,
        categoryId: config.categoryId,
        slug: config.slug,
        name: config.name,
        description: config.description,
        fieldSchema: config.fieldSchema,
        sortOrder: config.sortOrder,
        status: 'active',
      });
      this.listingTypes.set(config.listingTypeId, listingType);
      this.listingTypes.set(config.slug, listingType);

      const existing = this.byCategoryId.get(config.categoryId) ?? [];
      existing.push(listingType);
      this.byCategoryId.set(config.categoryId, existing);
    }
  }

  getCategory(idOrSlug: CategoryId | string): Category | null {
    return this.categories.get(idOrSlug) ?? null;
  }

  getAllCategories(): Category[] {
    const seen = new Set<string>();
    return [...this.categories.values()].filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }

  getListingType(idOrSlug: ListingTypeId | string): ListingType | null {
    return this.listingTypes.get(idOrSlug) ?? null;
  }

  getListingTypesByCategory(categoryId: CategoryId): ListingType[] {
    return this.byCategoryId.get(categoryId) ?? [];
  }

  getListingTypeConfig(listingTypeId: ListingTypeId): CategoryListingTypeConfig | null {
    return LISTING_TYPE_CONFIGS.find((c) => c.listingTypeId === listingTypeId) ?? null;
  }

  getDefaultListingType(categoryId: CategoryId): ListingType | null {
    const types = this.getListingTypesByCategory(categoryId);
    return types[0] ?? null;
  }

  /** Resolve category by any known slug including intent-style aliases */
  resolveCategoryId(slugOrId: string): CategoryId | null {
    if (this.categories.has(slugOrId)) {
      const cat = this.categories.get(slugOrId)!;
      return cat.id;
    }
    const intentMap: Record<string, CategoryId> = {
      'find-investment': CATEGORY_IDS.yatirimBul,
      invest: CATEGORY_IDS.yatirimYap,
      'find-job': CATEGORY_IDS.isBul,
      hire: CATEGORY_IDS.iseAl,
      'find-partner': CATEGORY_IDS.ortakBul,
      franchise: CATEGORY_IDS.bayilikAl,
      'bayilik-al': CATEGORY_IDS.bayilikAl,
    };
    return intentMap[slugOrId] ?? CATEGORY_SLUG_TO_ID[slugOrId] ?? null;
  }
}

export const categoryRegistry = new CategoryRegistry();

export function getCategoryRegistry(): CategoryRegistry {
  return categoryRegistry;
}
