import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for trusted server paths (admin mutations).
 * Bypasses RLS — only use after an explicit admin/super_admin auth check.
 */
const FALLBACK_SUPABASE_URL = 'https://tszvmnaejsxsyuawwclr.supabase.co';
const FALLBACK_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzenZtbmFlamxzeXVhd3djbHIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3MjQ1NjA5NSwiZXhwIjoyMDg4MDMyMDk1fQ.uV460bQk8bTqP3zL9_94ZfDqB97P-KkXFhL2o99bH9U';

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_KEY;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
