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

function isEmailVerificationFlow(params: {
  flow: string | null;
  type: string | null;
  next: string;
}): boolean {
  if (params.flow === 'email') return true;
  if (params.next === AUTH_ROUTES.verifySuccess) return true;
  // Legacy Supabase confirm links may include type=signup|email
  if (params.type === 'signup' || params.type === 'email') return true;
  return false;
}

/**
 * Auth callback (OAuth PKCE + email confirmation).
 * Cookies must be written onto the redirect response.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const oauthDesc = searchParams.get('error_description');
  const flow = searchParams.get('flow');
  const type = searchParams.get('type');

  const cookieStore = cookies();
  const next = safeNextPath(
    searchParams.get('next') ?? cookieStore.get(OAUTH_NEXT_COOKIE)?.value,
  );
  const emailVerify = isEmailVerificationFlow({ flow, type, next });

  const clearOauthCookie = (res: NextResponse) => {
    res.cookies.set(OAUTH_NEXT_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  };

  const loginError = (error: string, message: string) => {
    const res = NextResponse.redirect(
      `${origin}${AUTH_ROUTES.login}?error=${error}&message=${encodeURIComponent(message)}`,
    );
    return clearOauthCookie(res);
  };

  const verifyError = (reason: string) => {
    const res = NextResponse.redirect(
      `${origin}${AUTH_ROUTES.verifyError}?reason=${encodeURIComponent(reason)}`,
    );
    return clearOauthCookie(res);
  };

  // Provider / Auth failed before code exchange.
  if (oauthError) {
    console.error('[auth/callback] provider error', { oauthError });
    if (emailVerify) {
      return verifyError('provider_error');
    }
    const detail = oauthDesc || oauthError;
    return loginError(
      'oauth_provider',
      /exchange external code/i.test(detail)
        ? 'Google Client ID/Secret veya Redirect URI hatalı. Supabase Provider ayarlarını yeniden kaydedin.'
        : detail,
    );
  }

  if (!code) {
    console.error('[auth/callback] missing code');
    if (emailVerify) {
      return verifyError('missing_code');
    }
    return loginError(
      'auth_callback_failed',
      'Google dönüşünde yetkilendirme kodu yok. Redirect URI listesini kontrol edin.',
    );
  }

  const successPath = emailVerify ? AUTH_ROUTES.verifySuccess : next;
  const success = NextResponse.redirect(new URL(successPath, origin));
  clearOauthCookie(success);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (emailVerify) {
      return verifyError('config_missing');
    }
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
    console.error('[auth/callback] exchangeCodeForSession failed');
    if (emailVerify) {
      return verifyError('exchange_failed');
    }
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
    console.error('[auth/callback] account bootstrap failed');
    if (emailVerify) {
      // Session may already be established; still show success UX if cookies were set.
      // Prefer success page over error when auth exchange already succeeded.
      return success;
    }
    const message =
      bootstrapError instanceof Error
        ? bootstrapError.message
        : 'Hesap profili oluşturulamadı';
    return loginError('oauth_bootstrap', message);
  }

  return success;
}
