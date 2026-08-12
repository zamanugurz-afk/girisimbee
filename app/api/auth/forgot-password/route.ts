import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ok, apiError } from '@/lib/api/response';
import { canonicalizeSiteOrigin } from '@/lib/site-url';
import { sendPasswordResetEmail } from '@/lib/email/password-reset';
import { PASSWORD_RECOVERY_COOKIE } from '@/features/authentication/lib/password-recovery-cookie';
import { resolveAuthCookieDomain } from '@/lib/supabase/cookie-options';

function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

const bodySchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
});

const RATE_LIMIT_MESSAGE =
  'Çok sık sıfırlama istediniz. Limit genelde birkaç dakika sürer (bazen 10–15 dk). Gelen kutusu/spam’i kontrol edin, sonra tekrar deneyin.';

function isRateLimitError(message: string): boolean {
  return /rate limit|only request this after|security purposes|for security purposes/i.test(
    message,
  );
}

/** Custom Girisimbee-branded mail (Resend or SMTP) — avoids Supabase Auth "Girişimco" From. */
function preferCustomMail(): boolean {
  if (process.env.RESEND_API_KEY?.trim()) return true;
  return Boolean(
    process.env.SMTP_HOST?.trim()
    && process.env.SMTP_USER?.trim()
    && process.env.SMTP_PASSWORD?.trim(),
  );
}

type AuthUserLite = {
  id?: string;
  email?: string | null;
  app_metadata?: { providers?: string[] };
  identities?: { provider: string }[];
};

function providersOf(user: AuthUserLite): string[] {
  return (
    (user.app_metadata?.providers as string[] | undefined)
    ?? user.identities?.map((i) => i.provider)
    ?? []
  );
}

async function findAuthUserByEmail(email: string): Promise<AuthUserLite | null> {
  const admin = createServiceRoleClient();
  const adminApi = admin.auth.admin as typeof admin.auth.admin & {
    getUserByEmail?: (email: string) => Promise<{
      data: { user: AuthUserLite | null };
      error: { message: string } | null;
    }>;
  };

  if (typeof adminApi.getUserByEmail === 'function') {
    const byEmail = await adminApi.getUserByEmail(email);
    if (!byEmail.error) return byEmail.data?.user ?? null;
  }

  for (let page = 1; page <= 10; page += 1) {
    const listed = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listed.error) {
      throw new Error(listed.error.message);
    }
    const hit = listed.data?.users?.find((u) => (u.email || '').toLowerCase() === email) ?? null;
    if (hit) return hit;
    if ((listed.data?.users?.length ?? 0) < 200) break;
  }
  return null;
}

async function sendViaSupabaseAuth(email: string, redirectTo: string) {
  const supabase = createClient();
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

function okWithRecoveryCookie(request: Request, data: {
  sent: true;
  message: string;
}) {
  const res = ok(data);
  const domain = resolveAuthCookieDomain(new URL(request.url).hostname);
  res.cookies.set(PASSWORD_RECOVERY_COOKIE, '1', {
    path: '/',
    maxAge: 1800,
    sameSite: 'lax',
    ...(domain ? { domain } : {}),
  });
  return res;
}

/**
 * POST /api/auth/forgot-password
 * Primary: Supabase Auth mail (dashboard template) — single send, no double rate-limit.
 * Optional: Resend custom mail when RESEND_API_KEY is set.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Geçersiz istek gövdesi', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Geçersiz e-posta', 400);
  }

  const email = normalizeAuthEmail(parsed.data.email);
  const origin = canonicalizeSiteOrigin(new URL(request.url).origin);
  // Land on the reset page itself so the path survives even if query params are stripped.
  const redirectTo = `${origin}${AUTH_ROUTES.resetPassword}?type=recovery`;

  let user: AuthUserLite | null = null;
  try {
    user = await findAuthUserByEmail(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'auth lookup failed';
    console.error('[forgot-password] user lookup failed', message);
    return apiError(
      /invalid api key|invalid jwt|not authorized|service.role/i.test(message)
        ? 'Sunucu kimlik yapılandırması hatalı (Supabase service role). Destek ile iletişime geçin.'
        : 'Şifre sıfırlama şu an kullanılamıyor. Lütfen biraz sonra tekrar deneyin.',
      500,
    );
  }

  if (!user) {
    return ok({
      sent: true,
      message:
        'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
    });
  }

  const providers = providersOf(user);
  const hasEmail = providers.includes('email');
  const hasGoogle = providers.includes('google');
  if (hasGoogle && !hasEmail) {
    return apiError(
      'Bu hesap Google ile oluşturulmuş. Şifre sıfırlamak yerine “Google ile giriş yap” kullanın.',
      400,
      { code: 'google_only_account' },
    );
  }

  // Prefer app-owned mail so From = "Girisimbee" (Supabase Auth still branded Girişimco).
  // Do NOT fall through to resetPasswordForEmail after generateLink/SMTP failure —
  // that double-hits Supabase rate limits and hides the real mail error.
  if (preferCustomMail()) {
    try {
      const admin = createServiceRoleClient();
      const { data, error } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });
      if (error) {
        console.error('[forgot-password] generateLink failed', error.message);
        if (isRateLimitError(error.message)) {
          return apiError(RATE_LIMIT_MESSAGE, 429);
        }
        return apiError(
          'Şifre sıfırlama bağlantısı oluşturulamadı. Lütfen birkaç dakika sonra tekrar deneyin.',
          500,
        );
      }

      const actionLink =
        data.properties?.action_link
        || (data as { action_link?: string }).action_link
        || null;
      if (!actionLink) {
        return apiError('Şifre sıfırlama bağlantısı oluşturulamadı.', 500);
      }

      const mailed = await sendPasswordResetEmail({ to: email, actionLink });
      if (mailed.ok) {
        return okWithRecoveryCookie(request, {
          sent: true,
          message:
            'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
        });
      }
      console.error('[forgot-password] custom mail failed', mailed.error);

      // Zoho/SMTP auth often breaks (535) — fall back to Supabase Auth mailer
      // so the user still receives a reset link instead of a hard failure.
      const { error: authMailError } = await sendViaSupabaseAuth(email, redirectTo);
      if (!authMailError) {
        return okWithRecoveryCookie(request, {
          sent: true,
          message:
            'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
        });
      }
      console.error('[forgot-password] supabase fallback failed', authMailError.message);
      if (isRateLimitError(authMailError.message)) {
        return apiError(RATE_LIMIT_MESSAGE, 429);
      }
      return apiError(
        /535|authentication failed|invalid login/i.test(mailed.error)
          ? 'E-posta sunucusu girişi reddetti (SMTP 535). Vercel’de Zoho uygulama şifresini güncelleyin veya 10 dk sonra tekrar deneyin.'
          : 'Sıfırlama e-postası gönderilemedi. Lütfen biraz sonra tekrar deneyin.',
        500,
      );
    } catch (error) {
      console.error('[forgot-password] custom mail path unavailable', error);
      return apiError(
        'Şifre sıfırlama şu an kullanılamıyor. Lütfen biraz sonra tekrar deneyin.',
        500,
      );
    }
  }

  // Fallback only when no Resend/SMTP is configured: Supabase Auth mailer.
  const { error } = await sendViaSupabaseAuth(email, redirectTo);
  if (error) {
    console.error('[forgot-password] supabase mail failed', error.message);
    if (isRateLimitError(error.message)) {
      return apiError(RATE_LIMIT_MESSAGE, 429);
    }
    return apiError('E-posta gönderilemedi. Lütfen biraz sonra tekrar deneyin.', 500);
  }

  // Mark recovery so /auth/callback still routes to /sifre-sifirla if ?type= is stripped.
  return okWithRecoveryCookie(request, {
    sent: true,
    message:
      'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
  });
}
