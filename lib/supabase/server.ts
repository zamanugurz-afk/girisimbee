import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isNavProfilingEnabled } from '@/lib/perf/nav-profile-env';
import { createInstrumentedServerClient } from '@/lib/perf/instrument-supabase';

export function createClient() {
  const cookieStore = cookies();

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
  };

  if (isNavProfilingEnabled()) {
    return createInstrumentedServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      cookieApi,
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieApi },
  );
}
