import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ensureOAuthAccountBootstrap } from '@/features/authentication/lib/ensure-oauth-account-bootstrap';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { OAUTH_NEXT_COOKIE } from '@/features/authentication/lib/oauth-next';

function safeNextPath(value: string | undefined): string {
  if (!value) return AUTH_ROUTES.home;
  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith('/') ? decoded : AUTH_ROUTES.home;
  } catch {
    return AUTH_ROUTES.home;
  }
}

/**
 * OAuth PKCE callback — cookies must be written onto the redirect response.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const oauthDesc = searchParams.get('error_description');

  const cookieStore = cookies();
  const next = safeNextPath(
    searchParams.get('next') ?? cookieStore.get(OAUTH_NEXT_COOKIE)?.value,
  );

  const loginError = (error: string, message: string) => {
    const res = NextResponse.redirect(
      `${origin}${AUTH_ROUTES.login}?error=${error}&message=${encodeURIComponent(message)}`,
    );
    res.cookies.set(OAUTH_NEXT_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  };

  // Provider failed at Supabase↔Google exchange (credentials / redirect URI).
  if (oauthError) {
    const detail = oauthDesc || oauthError;
    console.error('[auth/callback] provider error', { oauthError, oauthDesc, href: url.href });
    return loginError(
      'oauth_provider',
      /exchange external code/i.test(detail)
        ? 'Google Client ID/Secret veya Redirect URI hatalı. Supabase Provider ayarlarını yeniden kaydedin.'
        : detail,
    );
  }

  if (!code) {
    console.error('[auth/callback] missing code', { href: url.href });
    return loginError(
      'auth_callback_failed',
      'Google dönüşünde yetkilendirme kodu yok. Redirect URI listesini kontrol edin.',
    );
  }

  const success = NextResponse.redirect(new URL(next, origin));
  success.cookies.set(OAUTH_NEXT_COOKIE, '', { path: '/', maxAge: 0 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return loginError(
      'auth_callback_failed',
      'Supabase ortam değişkenleri eksik (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).',
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            success.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('[auth/callback] exchangeCodeForSession', error.message);
    return loginError(
      'auth_callback_failed',
      /exchange external code/i.test(error.message)
        ? 'Google Client ID/Secret veya Redirect URI hatalı. Supabase Provider ayarlarını yeniden kaydedin.'
        : error.message,
    );
  }

  try {
    const user = data.user ?? (await supabase.auth.getUser()).data.user;
    if (user) {
      await ensureOAuthAccountBootstrap(user);
    }
  } catch (bootstrapError) {
    const message =
      bootstrapError instanceof Error
        ? bootstrapError.message
        : 'Hesap profili oluşturulamadı';
    return loginError('oauth_bootstrap', message);
  }

  return success;
}
