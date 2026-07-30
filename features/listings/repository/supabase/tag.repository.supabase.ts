/**
 * Supabase tag repository — marketplace_tags + marketplace_listing_tags.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now, slugify } from '@/lib/domain/factory';
import { NotFoundError } from '@/lib/domain/errors';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { TagId, ListingId } from '@/lib/domain/ids';
import type { Tag, ListingTag, CreateTagInput, UpdateTagInput, TagFilter } from '@/features/listings/types/tag.types';
import type { TagRepository } from '@/features/listings/repositories/tag.repository';
import { createTag } from '@/features/listings/factories/tag.factory';
import { fromSoftDeletable, fromTimestamps } from '@/lib/persistence/mappers';

const TAGS = 'marketplace_tags';
const JUNCTION = 'marketplace_listing_tags';

interface TagRow {
  id: string;
  slug: string;
  name: string;
  usage_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapTagRow(row: TagRow): Tag {
  return {
    id: row.id as TagId,
    slug: row.slug,
    name: row.name,
    usageCount: row.usage_count,
    status: row.status as Tag['status'],
    mergedIntoId: null,
    ...fromTimestamps(row),
    ...fromSoftDeletable(row),
  };
}

export class SupabaseTagRepository implements TagRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: TagId, filter?: RepositoryFilter): Promise<Tag | null> {
    let query = this.supabase.from(TAGS).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.is('deleted_at', null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? mapTagRow(data as TagRow) : null;
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    const { data, error } = await this.supabase.from(TAGS).select('*').eq('slug', slug).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data ? mapTagRow(data as TagRow) : null;
  }

  async findByListingId(listingId: ListingId): Promise<Tag[]> {
    const { data: junctions, error: jErr } = await this.supabase
      .from(JUNCTION)
      .select('tag_id')
      .eq('listing_id', listingId);
    if (jErr) throw jErr;
    if (!junctions?.length) return [];
    const tagIds = junctions.map((j) => j.tag_id);
    const { data, error } = await this.supabase.from(TAGS).select('*').in('id', tagIds).is('deleted_at', null);
    if (error) throw error;
    return (data ?? []).map((row) => mapTagRow(row as TagRow));
  }

  async findMany(filter: TagFilter, pagination?: PaginationParams): Promise<PaginatedResult<Tag>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TAGS).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.is('deleted_at', null);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('status', statuses);
    }
    if (filter.query) query = query.ilike('name', `%${filter.query}%`);
    const { data, error, count } = await query.order('name').range(start, end);
    if (error) throw error;
    return paginatedResult((data ?? []).map((r) => mapTagRow(r as TagRow)), count ?? 0, page, limit);
  }

  async paginate(filter: TagFilter, pagination?: PaginationParams): Promise<PaginatedResult<Tag>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: TagFilter, pagination?: PaginationParams): Promise<PaginatedResult<Tag>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: TagFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: TagId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TAGS).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateTagInput): Promise<Tag> {
    const tag = createTag(input);
    const { data, error } = await this.supabase
      .from(TAGS)
      .insert({ id: tag.id, slug: tag.slug, name: tag.name, usage_count: 0, status: 'active' })
      .select('*')
      .single();
    if (error) throw error;
    return mapTagRow(data as TagRow);
  }

  async update(id: TagId, input: UpdateTagInput): Promise<Tag> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.name !== undefined) row.name = input.name;
    if (input.status !== undefined) row.status = input.status;
    const { data, error } = await this.supabase.from(TAGS).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Tag', id);
    return mapTagRow(data as TagRow);
  }

  async softDelete(id: TagId): Promise<void> {
    const { error } = await this.supabase.from(TAGS).update({ deleted_at: now(), status: 'deleted', updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: TagId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: TagId): Promise<Tag> {
    const { data, error } = await this.supabase
      .from(TAGS)
      .update({ deleted_at: null, status: 'active', updated_at: now() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Tag', id);
    return mapTagRow(data as TagRow);
  }

  async attachToListing(listingId: ListingId, tagId: TagId): Promise<ListingTag> {
    const junction = { listing_id: listingId, tag_id: tagId };
    const { error } = await this.supabase.from(JUNCTION).upsert(junction);
    if (error) throw error;
    return { listingId, tagId, createdAt: now() };
  }

  async detachFromListing(listingId: ListingId, tagId: TagId): Promise<void> {
    const { error } = await this.supabase.from(JUNCTION).delete().eq('listing_id', listingId).eq('tag_id', tagId);
    if (error) throw error;
  }

  async incrementUsageCount(id: TagId, delta = 1): Promise<void> {
    const tag = await this.findById(id);
    if (!tag) throw new NotFoundError('Tag', id);
    const { error } = await this.supabase.from(TAGS).update({ usage_count: tag.usageCount + delta, updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async findOrCreateByName(name: string): Promise<Tag> {
    const slug = slugify(name);
    const existing = await this.findBySlug(slug);
    if (existing) return existing;
    return this.create({ slug, name });
  }

  async setTagsForListing(listingId: ListingId, tagNames: string[]): Promise<Tag[]> {
    await this.supabase.from(JUNCTION).delete().eq('listing_id', listingId);
    const tags = await Promise.all(tagNames.map((name) => this.findOrCreateByName(name)));
    if (tags.length) {
      const rows = tags.map((tag) => ({ listing_id: listingId, tag_id: tag.id }));
      const { error } = await this.supabase.from(JUNCTION).insert(rows);
      if (error) throw error;
    }
    return tags;
  }
}
