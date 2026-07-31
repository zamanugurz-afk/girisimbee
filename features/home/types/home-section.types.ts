import type { ContentItem } from '@/features/categories/types/category.types';
import type { HomeListingSectionId } from '@/features/home/config/home-sections.config';

export interface HomeListingSectionState {
  id: HomeListingSectionId;
  items: ContentItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export interface HomeListingSectionsResult {
  sections: HomeListingSectionState[];
  isLoading: boolean;
  refresh: () => void;
}
