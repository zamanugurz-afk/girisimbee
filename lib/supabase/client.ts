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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      '@supabase/ssr: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to create a browser client.',
    );
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  browserClient = createBrowserClient(url, key, {
    cookieOptions: authCookieOptions(hostname),
  });
  return browserClient;
}
