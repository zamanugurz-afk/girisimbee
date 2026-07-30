// Feature: categories — intent gateway (UI) + domain entity layer
export type {
  CategoryIntentId,
  CategoryIntent,
  CategorySection,
  ContentItem,
  ContentType,
  IntentId,
  IntentConfig,
  IntentSection,
} from '@/features/categories/types/category.types';

export {
  getCategoryIntent,
  getAllCategoryIntents,
} from '@/features/categories/services/category.service';

export { useCategoryIntent } from '@/features/categories/hooks/use-category-intent';

export { PlatformHome as IntentGateway } from '@/components/girisimco/platform-home';

// Domain entity
export type {
  Category,
  CategoryStatus,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilter,
} from '@/features/categories/types/category.entity.types';
export { CATEGORY_INDEXES, CATEGORY_LIFECYCLE, CATEGORY_VALIDATION } from '@/features/categories/types/category.entity.types';

export type { CategoryRepository } from '@/features/categories/repositories/category.repository';
export type { ICategoryService } from '@/features/categories/services/category.service.interface';

export { categorySchema, createCategorySchema } from '@/features/categories/validation/category.schema';
export { createCategory, createSeedCategories, SEED_CATEGORIES } from '@/features/categories/factories/category.factory';
export { generateMockCategory, generateMockCategories } from '@/features/categories/mock/category.generator';
