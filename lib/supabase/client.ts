import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { authCookieOptions } from '@/lib/supabase/cookie-options';

let browserClient: SupabaseClient | undefined;

/**
 * Browser Supabase client — created on first call only.
 * Never invoke at module scope or during SSR/prerender; call from
 * event handlers, effects, or other client-only paths.
 */
export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://tszvmnaejsxsyuawwclr.supabase.co';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  browserClient = createBrowserClient(url, key, {
    cookieOptions: authCookieOptions(hostname),
  });
  return browserClient;
}
