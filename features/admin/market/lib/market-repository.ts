import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateMarketItemInput,
  MarketItem,
  MarketItemStatus,
  UpdateMarketItemInput,
} from '@/features/admin/market/types/market.types';
import { MARKET_MAX_PUBLISHED } from '@/features/admin/market/types/market.types';

const TABLE = 'marketplace_market_items';

interface MarketRow {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  link_url: string | null;
  cta_label: string;
  sort_order: number;
  status: string;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function mapRow(row: MarketRow): MarketItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    ctaLabel: row.cta_label || 'İncele',
    sortOrder: row.sort_order,
    status: row.status as MarketItemStatus,
    publishedAt: row.published_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export async function listMarketItems(
  supabase: SupabaseClient,
  options?: { status?: MarketItemStatus; publishedOnly?: boolean; limit?: number },
): Promise<MarketItem[]> {
  let query = supabase
    .from(TABLE)
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false, nullsFirst: false });

  if (options?.publishedOnly) {
    query = query.eq('status', 'published');
  } else if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as MarketRow[] | null)?.map(mapRow) ?? [];
}

export async function listPublishedMarketItems(
  supabase: SupabaseClient,
): Promise<MarketItem[]> {
  return listMarketItems(supabase, {
    publishedOnly: true,
    limit: MARKET_MAX_PUBLISHED,
  });
}

export async function getMarketItem(
  supabase: SupabaseClient,
  id: string,
): Promise<MarketItem | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as MarketRow) : null;
}

export async function countPublishedMarketItems(
  supabase: SupabaseClient,
  excludeId?: string,
): Promise<number> {
  let query = supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('status', 'published');
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createMarketItem(
  supabase: SupabaseClient,
  input: CreateMarketItemInput,
  createdBy: string,
): Promise<MarketItem> {
  const status = input.status ?? 'draft';
  if (status === 'published') {
    const published = await countPublishedMarketItems(supabase);
    if (published >= MARKET_MAX_PUBLISHED) {
      throw new Error(`En fazla ${MARKET_MAX_PUBLISHED} MARKET kartı yayınlanabilir.`);
    }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: input.title.trim(),
      description: (input.description ?? '').trim(),
      image_url: input.imageUrl?.trim() || null,
      link_url: input.linkUrl?.trim() || null,
      cta_label: (input.ctaLabel ?? 'İncele').trim() || 'İncele',
      sort_order: input.sortOrder ?? 0,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      created_by: createdBy,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as MarketRow);
}

export async function updateMarketItem(
  supabase: SupabaseClient,
  id: string,
  input: UpdateMarketItemInput,
): Promise<MarketItem> {
  const existing = await getMarketItem(supabase, id);
  if (!existing) throw new Error('MARKET kartı bulunamadı.');

  const nextStatus = input.status ?? existing.status;
  if (nextStatus === 'published' && existing.status !== 'published') {
    const published = await countPublishedMarketItems(supabase, id);
    if (published >= MARKET_MAX_PUBLISHED) {
      throw new Error(`En fazla ${MARKET_MAX_PUBLISHED} MARKET kartı yayınlanabilir.`);
    }
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl?.trim() || null;
  if (input.linkUrl !== undefined) patch.link_url = input.linkUrl?.trim() || null;
  if (input.ctaLabel !== undefined) patch.cta_label = input.ctaLabel.trim() || 'İncele';
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.status !== undefined) {
    patch.status = input.status;
    if (input.status === 'published' && !existing.publishedAt) {
      patch.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .is('deleted_at', null)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as MarketRow);
}

export async function publishMarketItem(
  supabase: SupabaseClient,
  id: string,
): Promise<MarketItem> {
  return updateMarketItem(supabase, id, { status: 'published' });
}

export async function unpublishMarketItem(
  supabase: SupabaseClient,
  id: string,
): Promise<MarketItem> {
  return updateMarketItem(supabase, id, { status: 'draft' });
}

export async function softDeleteMarketItem(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString(), status: 'archived' })
    .eq('id', id)
    .is('deleted_at', null);
  if (error) throw new Error(error.message);
}
