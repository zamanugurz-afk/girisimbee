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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzenZtbmFlanN4c3l1YXd3Y2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTAyOTgsImV4cCI6MjEwMDk4NjI5OH0.oZymsvxduZTFeNmza7iRCcCzzIFWsC0fZLYyyoRPeyA';

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  browserClient = createBrowserClient(url, key, {
    cookieOptions: authCookieOptions(hostname),
  });
  return browserClient;
}
