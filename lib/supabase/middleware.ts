import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authCookieOptions } from '@/lib/supabase/cookie-options';

export function createClient(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const cookieOptions = authCookieOptions(request.nextUrl.hostname);

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://tszvmnaejsxsyuawwclr.supabase.co';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzenZtbmFlanN4c3l1YXd3Y2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTAyOTgsImV4cCI6MjEwMDk4NjI5OH0.oZymsvxduZTFeNmza7iRCcCzzIFWsC0fZLYyyoRPeyA';

  const supabase = createServerClient(
    url,
    key,
    {
      cookieOptions,
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  return { supabase, response };
}
