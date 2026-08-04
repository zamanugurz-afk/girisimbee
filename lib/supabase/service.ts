import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for trusted server paths (admin mutations).
 * Bypasses RLS — only use after an explicit admin/super_admin auth check.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin service operations');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
