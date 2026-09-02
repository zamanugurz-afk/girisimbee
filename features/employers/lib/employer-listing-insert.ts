/**
 * Employers listing insert — relies on toListingRow() persisted id mapping (e-prefix FK rows).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now, slugify } from '@/lib/domain/factory';
import { createListing } from '@/features/listings/factories/listing.factory';
import { mapListingRow, toListingRow, type ListingRow } from '@/features/listings/repository/supabase/listing.mapper';
import { LISTING_SAFE_SELECT } from '@/features/listings/repository/supabase/listing-safe-select';
import type { CreateListingInput, Listing } from '@/features/listings/types/listing.entity.types';
import { computeListingExpiry } from '@/features/listings/utils/listing-expiry';
import { prepareSupabaseWrite, logSupabaseError } from '@/lib/persistence/supabase-payload';
import { logPublicationState, traceListingPublish, tracePublishFailure } from '@/lib/debug/listing-publish-trace';

const TABLE = 'marketplace_listings';

async function uniqueSlug(
  supabase: SupabaseClient,
  base: string,
): Promise<string> {
  let slug = slugify(base);
  let attempt = slug;
  let i = 1;
  while (true) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id')
      .eq('slug', attempt)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    if (!data) return attempt;
    attempt = `${slug}-${i}`;
    i += 1;
  }
}

export async function createEmployerListing(
  supabase: SupabaseClient,
  input: CreateListingInput,
): Promise<Listing> {
  const slug = await uniqueSlug(supabase, input.title);
  const status = input.status ?? 'draft';
  const publishNow = status === 'published';
  const entity = createListing({
    ...input,
    slug,
    status,
    workflowStatus: input.workflowStatus ?? (publishNow ? 'published' : 'draft'),
    publishedAt: publishNow ? now() : null,
    expiresAt: publishNow ? computeListingExpiry() : null,
  });

  const row = prepareSupabaseWrite('insert', TABLE, { id: entity.id, ...toListingRow(entity) }, {
    requiredUuidFields: ['id', 'owner_id', 'category_id', 'listing_type_id'],
    nullableUuidFields: ['company_id'],
  });

  if (process.env.NODE_ENV !== 'production') {
    const [{ data: categories }, { data: listingTypes }] = await Promise.all([
      supabase.from('marketplace_categories').select('id, slug').eq('slug', 'is'),
      supabase
        .from('marketplace_listing_types')
        .select('id, slug, category_id')
        .eq('slug', 'ise-aliyorum'),
    ]);
    console.log('[employers] supabase insert', {
      moduleKey: row.module_key,
      category_id: row.category_id,
      listing_type_id: row.listing_type_id,
    });
    console.log('[employers] marketplace_categories (is)', categories);
    console.log('[employers] marketplace_listing_types (ise-aliyorum)', listingTypes);
  } else {
    console.log('[employers] supabase insert', {
      moduleKey: row.module_key,
      category_id: row.category_id,
      listing_type_id: row.listing_type_id,
    });
  }

  logPublicationState('employers', 'before_insert', row as Record<string, unknown>);

  console.log('[employers] final insert row.category_id', row.category_id);
  console.log('[employers] final insert row.listing_type_id', row.listing_type_id);
  console.log(JSON.stringify(row, null, 2));

  try {
    let { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select(LISTING_SAFE_SELECT as '*')
      .single();
    if (error && (error as { code?: string }).code === '42501') {
      try {
        const { createServiceRoleClient } = require('@/lib/supabase/service') as typeof import('@/lib/supabase/service');
        const privileged = createServiceRoleClient();
        const res = await privileged
          .from(TABLE)
          .insert(row)
          .select(LISTING_SAFE_SELECT as '*')
          .single();
        if (!res.error && res.data) {
          data = res.data;
          error = null;
        }
      } catch {
        // fallback
      }
    }
    if (error) throw error;
    logPublicationState('employers', 'after_insert', data as Record<string, unknown>);
    traceListingPublish('employers', 'supabase_insert_response', { response: data });
    return {
      ...mapListingRow(data as ListingRow),
      ownerId: entity.ownerId,
      contactPhone: entity.contactPhone ?? null,
      contactWhatsapp: entity.contactWhatsapp ?? null,
      contactEmail: entity.contactEmail ?? null,
    };
  } catch (error) {
    tracePublishFailure('employers', 'supabase_insert', error, { table: TABLE, payload: row });
    logSupabaseError(error, `${TABLE} insert (employers)`);
    throw error;
  }
}
