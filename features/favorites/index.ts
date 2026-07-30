// Feature: favorites — domain layer
export type {
  Favorite,
  FavoriteStatus,
  CreateFavoriteInput,
  UpdateFavoriteInput,
  FavoriteFilter,
} from '@/features/favorites/types/favorite.types';
export { FAVORITE_INDEXES, FAVORITE_LIFECYCLE, FAVORITE_VALIDATION } from '@/features/favorites/types/favorite.types';

export type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
export type { IFavoriteService } from '@/features/favorites/services/favorite.service.interface';
export { FavoriteService } from '@/features/favorites/services/favorite.service';
export { getFavoriteService } from '@/lib/persistence/container';
export { useFavorites, useFavoritesList } from '@/features/favorites/hooks/use-favorites';
export { FavoritesProvider } from '@/features/favorites/providers/favorites-provider';
export * from '@/features/favorites/repository';

export { favoriteSchema, createFavoriteSchema } from '@/features/favorites/validation/favorite.schema';
export { createFavorite, createFavoriteInput } from '@/features/favorites/factories/favorite.factory';
export { generateMockFavorite, generateMockFavorites } from '@/features/favorites/mock/favorite.generator';
