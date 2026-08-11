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

function mapRecoverError(message: string): string {
  if (/over_email_send_rate_limit|only request this after|rate limit/i.test(message)) {
    return 'Çok sık sıfırlama istediniz. Lütfen yaklaşık 1 dakika sonra tekrar deneyin.';
  }
  if (/redirect/i.test(message)) {
    return 'Sıfırlama yönlendirme adresi yapılandırması hatalı. Destek ile iletişime geçin.';
  }
  return message || 'Şifre sıfırlama isteği gönderilemedi.';
}

type AuthUserLite = {
  app_metadata?: { providers?: string[] };
  identities?: { provider: string }[];
};

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
    return byEmail.data?.user ?? null;
  }

  for (let page = 1; page <= 5; page += 1) {
    const listed = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listed.error) break;
    const hit = listed.data?.users?.find((u) => (u.email || '').toLowerCase() === email) ?? null;
    if (hit) return hit;
    if ((listed.data?.users?.length ?? 0) < 200) break;
  }
  return null;
}

/**
 * POST /api/auth/forgot-password
 * Prefers admin.generateLink + Resend/SMTP so mail delivery does not depend on
 * Supabase's built-in SMTP (often misconfigured / rate-limited).
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

  // Provider check — Google-only users should use Google sign-in.
  try {
    const user = await findAuthUserByEmail(email);
    if (user) {
      const providers = (user.app_metadata?.providers as string[] | undefined)
        ?? user.identities?.map((i) => i.provider)
        ?? [];
      const hasEmail = providers.includes('email');
      const hasGoogle = providers.includes('google');
      if (hasGoogle && !hasEmail) {
        return apiError(
          'Bu hesap Google ile oluşturulmuş. Şifre sıfırlamak yerine “Google ile giriş yap” kullanın.',
          400,
          { code: 'google_only_account' },
        );
      }
    }
  } catch {
    // Service role unavailable — continue; no user enumeration leak.
  }

  // Preferred path: generate recovery link + send via Resend/SMTP.
  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (!error) {
      const actionLink =
        data.properties?.action_link
        || (data as { action_link?: string }).action_link
        || null;

      if (actionLink) {
        const mailed = await sendPasswordResetEmail({ to: email, actionLink });
        if (mailed.ok) {
          return ok({
            sent: true,
            message:
              'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
          });
        }
        console.warn('[forgot-password] custom mail failed, falling back to Supabase', mailed.error);
      }
    } else if (!/user not found|unable to find|not found/i.test(error.message)) {
      console.warn('[forgot-password] generateLink failed', error.message);
    }
  } catch (error) {
    console.warn('[forgot-password] generateLink path unavailable', error);
  }

  // Fallback: Supabase Auth mail (requires project SMTP / email provider).
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return apiError(mapRecoverError(error.message), 400);
  }

  return ok({
    sent: true,
    message:
      'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
  });
}
