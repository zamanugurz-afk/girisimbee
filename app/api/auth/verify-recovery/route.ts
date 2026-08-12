import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { canonicalizeSiteOrigin } from '@/lib/site-url';
import { authCookieOptions } from '@/lib/supabase/cookie-options';

/**
 * POST /api/auth/verify-recovery
 * Consumes recovery token_hash only on explicit user form submit (not email prefetch GET).
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const origin = canonicalizeSiteOrigin(url.origin);
  const resetUrl = new URL(AUTH_ROUTES.resetPassword, origin);

  let tokenHash = '';
  try {
    const form = await request.formData();
    const raw = form.get('token_hash');
    tokenHash = typeof raw === 'string' ? raw.trim() : '';
  } catch {
    return NextResponse.redirect(resetUrl, 303);
  }

  if (!tokenHash) {
    return NextResponse.redirect(resetUrl, 303);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[verify-recovery] missing supabase env');
    return NextResponse.redirect(resetUrl, 303);
  }

  const cookieStore = cookies();
  const redirect = NextResponse.redirect(resetUrl, 303);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: authCookieOptions(url.hostname),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          redirect.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token_hash: tokenHash,
  });

  if (error) {
    console.error('[verify-recovery] verifyOtp failed', error.message);
    return NextResponse.redirect(resetUrl, 303);
  }

  return redirect;
}
