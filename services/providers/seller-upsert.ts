import type { SupabaseClient } from '@supabase/supabase-js';
import type { NormalizedListing } from '@/types';

function sellerExternalId(displayName: string): string {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return slug || 'unknown-seller';
}

/** Upsert a seller row and return its id for listing.seller_id. */
export async function upsertListingSeller(
  supabase: SupabaseClient,
  providerId: string,
  item: NormalizedListing,
): Promise<string | null> {
  const displayName = item.seller_display_name?.trim();
  if (!displayName) return null;

  const externalId = sellerExternalId(displayName);

  const { data: existing, error: findError } = await supabase
    .from('sellers')
    .select('id')
    .eq('provider_id', providerId)
    .eq('external_id', externalId)
    .maybeSingle();

  if (findError) throw new Error(findError.message);

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('sellers')
      .update({
        display_name: displayName,
        rating: item.seller_rating ?? 0,
        member_since: item.seller_member_since,
      })
      .eq('id', existing.id);
    if (updateError) throw new Error(updateError.message);
    return existing.id;
  }

  const { data: created, error: insertError } = await supabase
    .from('sellers')
    .insert({
      provider_id: providerId,
      external_id: externalId,
      display_name: displayName,
      rating: item.seller_rating ?? 0,
      member_since: item.seller_member_since,
    })
    .select('id')
    .single();

  if (insertError) throw new Error(insertError.message);
  return created?.id ?? null;
}
