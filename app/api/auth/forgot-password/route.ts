import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ok, apiError } from '@/lib/api/response';
import { canonicalizeSiteOrigin } from '@/lib/site-url';
import { sendPasswordResetEmail } from '@/lib/email/password-reset';

function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

const bodySchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
});

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

/**
 * POST /api/auth/forgot-password
 * Sends recovery via admin.generateLink + Resend/SMTP.
 * Never claims "sent" unless the transactional mail actually succeeded
 * (unknown emails still get a generic success to avoid enumeration).
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
  const redirectTo = `${origin}${AUTH_ROUTES.callback}?type=recovery&next=${encodeURIComponent(AUTH_ROUTES.resetPassword)}`;

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

  // Unknown account — same success shape (no enumeration), but do not pretend we mailed.
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

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (error) {
    console.error('[forgot-password] service role missing', error);
    return apiError(
      'Sunucu kimlik yapılandırması eksik. Destek ile iletişime geçin.',
      500,
    );
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error('[forgot-password] generateLink failed', error.message);
    return apiError(
      /invalid api key/i.test(error.message)
        ? 'Sunucu kimlik yapılandırması hatalı (Supabase service role). Destek ile iletişime geçin.'
        : /rate limit|only request this after/i.test(error.message)
          ? 'Çok sık sıfırlama istediniz. Lütfen yaklaşık 1 dakika sonra tekrar deneyin.'
          : 'Şifre sıfırlama bağlantısı oluşturulamadı. Lütfen tekrar deneyin.',
      500,
    );
  }

  const actionLink =
    data.properties?.action_link
    || (data as { action_link?: string }).action_link
    || null;

  if (!actionLink) {
    console.error('[forgot-password] generateLink missing action_link');
    return apiError('Şifre sıfırlama bağlantısı oluşturulamadı. Lütfen tekrar deneyin.', 500);
  }

  const mailed = await sendPasswordResetEmail({ to: email, actionLink });
  if (mailed.ok) {
    return ok({
      sent: true,
      message:
        'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
    });
  }

  // Zoho/SMTP down — fall back to Supabase Auth mail (dashboard Reset password template).
  console.warn('[forgot-password] custom SMTP failed, using Supabase Auth mail', mailed.error);
  const supabase = createClient();
  const { error: supabaseMailError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (supabaseMailError) {
    console.error('[forgot-password] supabase mail failed', supabaseMailError.message);
    return apiError(
      /rate limit|only request this after/i.test(supabaseMailError.message)
        ? 'Çok sık sıfırlama istediniz. Lütfen yaklaşık 1 dakika sonra tekrar deneyin.'
        : 'E-posta gönderilemedi. Lütfen biraz sonra tekrar deneyin.',
      500,
    );
  }

  return ok({
    sent: true,
    message:
      'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
  });
}
