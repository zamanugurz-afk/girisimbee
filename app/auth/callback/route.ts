import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ensureOAuthAccountBootstrap } from '@/features/authentication/lib/ensure-oauth-account-bootstrap';
import { OAUTH_LEGAL_ACCEPTANCE_PATH } from '@/features/authentication/lib/oauth-bootstrap';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { OAUTH_NEXT_COOKIE } from '@/features/authentication/lib/oauth-next';
import { canonicalizeSiteOrigin } from '@/lib/site-url';
import { authCookieOptions } from '@/lib/supabase/cookie-options';

/** Must match @supabase/auth-js PKCE_FLOW_ID_PARAM */
const PKCE_FLOW_ID_PARAM = 'sb_flow_id';

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
 * Email verification only when explicitly marked.
 * Plain OAuth returns (code, no flow) must never be treated as email verify.
 */
function isEmailVerificationFlow(params: {
  flow: string | null;
  type: string | null;
}): boolean {
  if (params.flow === 'email') return true;
  if (params.type === 'signup' || params.type === 'email') return true;
  return false;
}

/** Password-recovery must land on /sifre-sifirla — never divert to legal bootstrap. */
function isPasswordRecoveryFlow(params: {
  type: string | null;
  next: string;
}): boolean {
  if (params.type === 'recovery') return true;
  return (
    params.next === AUTH_ROUTES.resetPassword
    || params.next === AUTH_ROUTES.resetPasswordLegacy
  );
}

function isPkceVerifierMissing(message: string): boolean {
  return /pkce code verifier not found/i.test(message);
}

/**
 * Auth callback (OAuth PKCE + email confirmation).
 * Cookies must be written onto the redirect response.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  // Keep post-auth redirects on www (apex ↔ www ping-pong breaks sessions / browsers).
  const origin = canonicalizeSiteOrigin(url.origin);
  const code = searchParams.get('code');
  const flowId = searchParams.get(PKCE_FLOW_ID_PARAM);
  const oauthError = searchParams.get('error');
  const oauthDesc = searchParams.get('error_description');
  const flow = searchParams.get('flow');
  const type = searchParams.get('type');

  const cookieStore = cookies();
  const nextFromQuery = searchParams.get('next');
  const nextFromCookie = cookieStore.get(OAUTH_NEXT_COOKIE)?.value;
  const emailVerify = isEmailVerificationFlow({ flow, type });

  // Email flow may pass next=/auth/verify-success; OAuth uses cookie next only.
  const next = safeNextPath(
    emailVerify
      ? (nextFromQuery ?? AUTH_ROUTES.verifySuccess)
      : (nextFromCookie ?? nextFromQuery ?? undefined),
  );

  console.info('[auth/callback]', {
    provider: 'google-or-email',
    origin,
    callbackUrl: `${origin}${url.pathname}`,
    hasCode: Boolean(code),
    hasFlowId: Boolean(flowId),
    flow,
    type,
    emailVerify,
    next,
    oauthError: oauthError ?? null,
  });

  const clearOauthCookie = (res: NextResponse) => {
    res.cookies.set(OAUTH_NEXT_COOKIE, '', { path: '/', maxAge: 0, domain: '.girisimbee.com' });
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

  /** Browser can still see the PKCE cookie even when the Route Handler missed it. */
  const pkceClientFallback = () => {
    const pkceUrl = new URL('/auth/pkce', origin);
    pkceUrl.searchParams.set('code', code!);
    if (flowId) pkceUrl.searchParams.set(PKCE_FLOW_ID_PARAM, flowId);
    pkceUrl.searchParams.set('next', next);
    if (emailVerify) pkceUrl.searchParams.set('flow', 'email');
    if (type) pkceUrl.searchParams.set('type', type);
    return NextResponse.redirect(pkceUrl);
  };

  // Provider / Auth failed before code exchange.
  if (oauthError) {
    console.error('[auth/callback] provider error', { oauthError });
    if (emailVerify) {
      return verifyError('provider_error');
    }
    const detail = (oauthDesc || oauthError || '').trim();
    const friendly =
      /exchange external code|redirect_uri_mismatch/i.test(detail)
        ? 'Google Redirect URI, Supabase Callback URL ile birebir aynı olmalı (…supabase.co/auth/v1/callback).'
        : !detail || detail === 'oauth_provider' || detail === 'access_denied'
          ? 'Google ile giriş tamamlanamadı. Lütfen tekrar deneyin veya e-posta ile giriş yapın.'
          : detail;
    return loginError('oauth_provider', friendly);
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
      cookieOptions: authCookieOptions(url.hostname),
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

  // Server must pass sb_flow_id — auth-js only reads it from window on the client.
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );
  if (error) {
    console.error('[auth/callback] exchangeCodeForSession failed', {
      message: error.message,
      hasFlowId: Boolean(flowId),
    });
    if (emailVerify) {
      return verifyError('exchange_failed');
    }
    if (isPkceVerifierMissing(error.message)) {
      return pkceClientFallback();
    }
    return loginError(
      'auth_callback_failed',
      /exchange external code|redirect_uri_mismatch/i.test(error.message)
        ? 'Google Redirect URI, Supabase Callback URL ile birebir aynı olmalı (…supabase.co/auth/v1/callback).'
        : error.message,
    );
  }

  const passwordRecovery = isPasswordRecoveryFlow({ type, next });

  const copySessionCookies = (res: NextResponse) => {
    success.cookies.getAll().forEach((c) => {
      res.cookies.set(c.name, c.value);
    });
    return clearOauthCookie(res);
  };

  try {
    const user = data.user ?? (await supabase.auth.getUser()).data.user;
    // Skip legal/OAuth bootstrap for recovery + email-verify — keep the destination path.
    if (user && !emailVerify && !passwordRecovery) {
      const { created, needsLegalAcceptance } = await ensureOAuthAccountBootstrap(
        user,
        supabase,
      );
      if (created || needsLegalAcceptance) {
        const legalUrl = new URL(OAUTH_LEGAL_ACCEPTANCE_PATH, origin);
        legalUrl.searchParams.set('next', next);
        return copySessionCookies(NextResponse.redirect(legalUrl));
      }
    }
  } catch (bootstrapError) {
    const detail =
      bootstrapError instanceof Error
        ? bootstrapError.message
        : typeof bootstrapError === 'object'
          && bootstrapError
          && 'message' in bootstrapError
          && typeof (bootstrapError as { message: unknown }).message === 'string'
          ? (bootstrapError as { message: string }).message
          : 'Hesap profili oluşturulamadı';
    console.error('[auth/callback] account bootstrap failed', detail);

    if (emailVerify || passwordRecovery) {
      return success;
    }

    // Email already bound to another membership — show login hint (no orphan session).
    if (/e-posta zaten kayıtlı/i.test(detail)) {
      await supabase.auth.signOut().catch(() => undefined);
      return loginError('oauth_bootstrap', detail);
    }

    // Session is already valid — never drop the user on /giris without cookies.
    // Send them through the legal gate (or home) so login can complete.
    const legalUrl = new URL(OAUTH_LEGAL_ACCEPTANCE_PATH, origin);
    legalUrl.searchParams.set('next', next);
    return copySessionCookies(NextResponse.redirect(legalUrl));
  }

  return success;
}
