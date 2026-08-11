import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ok, apiError } from '@/lib/api/response';

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

/**
 * POST /api/auth/forgot-password
 * - Google-only hesaplarda net yönlendirme
 * - Rate-limit Türkçe mesaj
 * - redirectTo: request origin (PKCE / callback ile uyumlu)
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
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}${AUTH_ROUTES.callback}?type=recovery&next=${encodeURIComponent(AUTH_ROUTES.resetPassword)}`;

  // Provider check (best-effort) — Google-only users should use Google sign-in.
  try {
    const admin = createServiceRoleClient();
    const adminApi = admin.auth.admin as typeof admin.auth.admin & {
      getUserByEmail?: (email: string) => Promise<{
        data: { user: { app_metadata?: { providers?: string[] }; identities?: { provider: string }[] } | null };
        error: { message: string } | null;
      }>;
    };
    let user:
      | { app_metadata?: { providers?: string[] }; identities?: { provider: string }[] }
      | null
      | undefined;
    if (typeof adminApi.getUserByEmail === 'function') {
      const byEmail = await adminApi.getUserByEmail(email);
      user = byEmail.data?.user ?? null;
    } else {
      // Paginate a bit — email lookup API is preferred when available.
      for (let page = 1; page <= 5 && !user; page += 1) {
        const listed = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (listed.error) break;
        user = listed.data?.users?.find((u) => (u.email || '').toLowerCase() === email) ?? null;
        if ((listed.data?.users?.length ?? 0) < 200) break;
      }
    }
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
    // Service role unavailable — continue with recover; no user enumeration leak.
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return apiError(mapRecoverError(error.message), 400);
  }

  // Always same success shape (no account enumeration).
  return ok({
    sent: true,
    message:
      'E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutusu ve spam klasörünü kontrol edin.',
  });
}
