import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Ensure every auth.users row has a public.profiles row (admin list source).
 * Insert-only for missing ids — never overwrites existing roles.
 */
export async function syncMissingProfilesFromAuth(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;

  const users = data.users ?? [];
  if (users.length === 0) return 0;

  const ids = users.map((u) => u.id);
  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id')
    .in('id', ids);
  if (existingError) throw existingError;

  const have = new Set((existing ?? []).map((r) => r.id as string));
  const missing = users.filter((u) => !have.has(u.id));
  if (missing.length === 0) return 0;

  const rows = missing.map((u) => {
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    const first = typeof meta.first_name === 'string' ? meta.first_name : null;
    const last = typeof meta.last_name === 'string' ? meta.last_name : null;
    const displayFromMeta =
      (typeof meta.display_name === 'string' && meta.display_name.trim())
      || [first, last].filter(Boolean).join(' ').trim()
      || null;
    const email = u.email ?? '';
    return {
      id: u.id,
      user_id: u.id,
      role: 'user',
      display_name: displayFromMeta || email.split('@')[0] || 'Kullanıcı',
      first_name: first,
      last_name: last,
      username:
        typeof meta.username === 'string' && meta.username.trim()
          ? meta.username.trim().toLowerCase()
          : null,
      email: email || null,
      phone: typeof meta.phone === 'string' ? meta.phone : null,
      status: 'active',
      account_status: 'active',
      is_email_verified: Boolean(u.email_confirmed_at),
      is_phone_verified: false,
      is_deleted: false,
      last_seen_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    };
  });

  const { error: insertError } = await supabase.from('profiles').insert(rows);
  if (insertError) throw insertError;

  await supabase.from('user_settings').upsert(
    missing.map((u) => ({ user_id: u.id })),
    { onConflict: 'user_id', ignoreDuplicates: true },
  );

  return missing.length;
}
