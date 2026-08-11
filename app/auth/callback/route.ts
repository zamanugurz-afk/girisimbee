import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ensureOAuthAccountBootstrap } from '@/features/authentication/lib/ensure-oauth-account-bootstrap';
import { OAUTH_LEGAL_ACCEPTANCE_PATH } from '@/features/authentication/lib/oauth-bootstrap';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { OAUTH_NEXT_COOKIE } from '@/features/authentication/lib/oauth-next';
import { PASSWORD_RECOVERY_COOKIE } from '@/features/authentication/lib/password-recovery-cookie';
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

function isEmailVerificationFlow(params: {
  flow: string | null;
  type: string | null;
}): boolean {
  if (params.flow === 'email') return true;
  if (params.type === 'signup' || params.type === 'email') return true;
  return false;
}

function isPasswordRecoveryFlow(params: {
  type: string | null;
  nextQuery: string | null;
}): boolean {
  // Explicit signals only — never a leftover recovery cookie (breaks Google OAuth).
  if (params.type === 'recovery') return true;
  if (
    params.nextQuery === AUTH_ROUTES.resetPassword
    || params.nextQuery === AUTH_ROUTES.resetPasswordLegacy
  ) {
    return true;
  }
  return false;
}

function isPkceVerifierMissing(message: string): boolean {
  return /pkce code verifier not found/i.test(message);
}

/**
 * Auth callback (OAuth PKCE + email confirmation + password recovery).
 * Cookies must be written onto the redirect response.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
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
  const passwordRecovery = isPasswordRecoveryFlow({
    type,
    nextQuery: nextFromQuery,
  });

  // Recovery must NEVER inherit a leftover Google OAuth "next" cookie (often "/").
  const next = passwordRecovery
    ? AUTH_ROUTES.resetPassword
    : safeNextPath(
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
    passwordRecovery,
    next,
    oauthError: oauthError ?? null,
  });

  const clearAuthFlowCookies = (res: NextResponse) => {
    res.cookies.set(OAUTH_NEXT_COOKIE, '', { path: '/', maxAge: 0, domain: '.girisimbee.com' });
    res.cookies.set(OAUTH_NEXT_COOKIE, '', { path: '/', maxAge: 0 });
    res.cookies.set(PASSWORD_RECOVERY_COOKIE, '', { path: '/', maxAge: 0, domain: '.girisimbee.com' });
    res.cookies.set(PASSWORD_RECOVERY_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  };

  const loginError = (error: string, message: string) => {
    const res = NextResponse.redirect(
      `${origin}${AUTH_ROUTES.login}?error=${error}&message=${encodeURIComponent(message)}`,
    );
    return clearAuthFlowCookies(res);
  };

  const verifyError = (reason: string) => {
    const res = NextResponse.redirect(
      `${origin}${AUTH_ROUTES.verifyError}?reason=${encodeURIComponent(reason)}`,
    );
    return clearAuthFlowCookies(res);
  };

  const pkceClientFallback = () => {
    const pkceUrl = new URL('/auth/pkce', origin);
    pkceUrl.searchParams.set('code', code!);
    if (flowId) pkceUrl.searchParams.set(PKCE_FLOW_ID_PARAM, flowId);
    pkceUrl.searchParams.set('next', next);
    if (emailVerify) pkceUrl.searchParams.set('flow', 'email');
    if (passwordRecovery) pkceUrl.searchParams.set('type', 'recovery');
    else if (type) pkceUrl.searchParams.set('type', type);
    return NextResponse.redirect(pkceUrl);
  };

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
      passwordRecovery
        ? 'Şifre sıfırlama bağlantısı geçersiz veya eksik. Lütfen yeni bir bağlantı isteyin.'
        : 'Google dönüşünde yetkilendirme kodu yok. Redirect URI listesini kontrol edin.',
    );
  }

  const successPath = emailVerify
    ? AUTH_ROUTES.verifySuccess
    : passwordRecovery
      ? AUTH_ROUTES.resetPassword
      : next;
  const success = NextResponse.redirect(new URL(successPath, origin));
  clearAuthFlowCookies(success);

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );
  if (error) {
    console.error('[auth/callback] exchangeCodeForSession failed', {
      message: error.message,
      hasFlowId: Boolean(flowId),
      passwordRecovery,
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

  const copySessionCookies = (res: NextResponse) => {
    success.cookies.getAll().forEach((c) => {
      res.cookies.set(c.name, c.value);
    });
    return clearAuthFlowCookies(res);
  };

  // Password recovery: session is only for setting a new password — never legal gate / home.
  if (passwordRecovery) {
    const resetUrl = new URL(AUTH_ROUTES.resetPassword, origin);
    return copySessionCookies(NextResponse.redirect(resetUrl));
  }

  try {
    const user = data.user ?? (await supabase.auth.getUser()).data.user;
    if (user && !emailVerify) {
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

    if (emailVerify) {
      return success;
    }

    if (/e-posta zaten kayıtlı/i.test(detail)) {
      await supabase.auth.signOut().catch(() => undefined);
      return loginError('oauth_bootstrap', detail);
    }

    const legalUrl = new URL(OAUTH_LEGAL_ACCEPTANCE_PATH, origin);
    legalUrl.searchParams.set('next', next);
    return copySessionCookies(NextResponse.redirect(legalUrl));
  }

  return success;
}
