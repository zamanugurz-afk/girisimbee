import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable, slugify } from '@/lib/domain/factory';
import type { Tag, CreateTagInput } from '@/features/listings/types/tag.types';

export function createTag(overrides: Partial<Tag> & Pick<Tag, 'slug' | 'name'>): Tag {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.tag(crypto.randomUUID()),
    slug: overrides.slug,
    name: overrides.name,
    usageCount: overrides.usageCount ?? 0,
    status: overrides.status ?? 'active',
    mergedIntoId: overrides.mergedIntoId ?? null,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createTagInput(name: string): CreateTagInput {
  return { slug: slugify(name), name };
}
