import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { isNavProfilingEnabled } from '@/lib/perf/nav-profile-env';
import { createInstrumentedServerClient } from '@/lib/perf/instrument-supabase';
import { authCookieOptions } from '@/lib/supabase/cookie-options';

export function createClient() {
  const cookieStore = cookies();
  const host = headers().get('host');

  const cookieApi = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value, ...options });
      } catch {
        // Server Component — cookie writes ignored
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value: '', ...options });
      } catch {
        // Server Component — cookie writes ignored
      }
    },
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set({ name, value, ...options });
        });
      } catch {
        // Server Component — cookie writes ignored
      }
    },
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      '@supabase/ssr: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to create a server client.',
    );
  }

  const cookieOptions = authCookieOptions(host);

  if (isNavProfilingEnabled()) {
    return createInstrumentedServerClient(url, key, cookieApi);
  }

  return createServerClient(url, key, {
    cookies: cookieApi,
    cookieOptions,
  });
}
