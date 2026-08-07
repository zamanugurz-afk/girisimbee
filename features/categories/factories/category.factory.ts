import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Category, CreateCategoryInput } from '@/features/categories/types/category.entity.types';

/** Seed categories matching homepage intent gateway. */
export const SEED_CATEGORIES: CreateCategoryInput[] = [
  { slug: 'yatirim-bul', name: 'Yatırım Bul', accentColor: '#6366F1', icon: 'TrendingUp', sortOrder: 1 },
  { slug: 'yatirim-yap', name: 'Yatırım Yap', accentColor: '#8B5CF6', icon: 'Wallet', sortOrder: 2 },
  { slug: 'ise-al', name: 'İş İlanları', accentColor: '#10B981', icon: 'Briefcase', sortOrder: 3 },
  { slug: 'ortak-bul', name: 'Ortak Bul', accentColor: '#F59E0B', icon: 'Handshake', sortOrder: 4 },
  { slug: 'dijital-ai', name: 'Dijital ve AI Çözümleri', accentColor: '#8B5CF6', icon: 'Sparkles', sortOrder: 5 },
  { slug: 'franchise', name: 'Franchise', accentColor: '#EC4899', icon: 'Store', sortOrder: 6 },
];

export function createCategory(overrides: Partial<Category> & Pick<Category, 'slug' | 'name' | 'accentColor'>): Category {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.category(crypto.randomUUID()),
    slug: overrides.slug,
    name: overrides.name,
    description: overrides.description ?? null,
    icon: overrides.icon ?? null,
    accentColor: overrides.accentColor,
    sortOrder: overrides.sortOrder ?? 0,
    status: overrides.status ?? 'active',
    listingCount: overrides.listingCount ?? 0,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createSeedCategories(): Category[] {
  return SEED_CATEGORIES.map((input, i) => createCategory({ ...input, listingCount: (i + 1) * 100 }));
}
