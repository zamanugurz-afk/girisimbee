import { cookies } from 'next/headers';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { apiError, ok } from '@/lib/api/response';
import { authCookieOptions } from '@/lib/supabase/cookie-options';
import { PASSWORD_RECOVERY_COOKIE } from '@/features/authentication/lib/password-recovery-cookie';
import { legacyAuthCookieDomains } from '@/lib/supabase/cookie-options';

const bodySchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

/**
 * Server login — mirrors session onto Set-Cookie (host-only).
 * Also clears stale recovery / Domain=.girisimbee.com ghosts.
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
    return apiError(parsed.error.issues[0]?.message ?? 'Geçersiz giriş bilgileri', 400);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return apiError('Supabase yapılandırması eksik', 500);
  }

  const url = new URL(request.url);
  const cookieStore = cookies();
  const res = ok({ ok: true as const });

  // Drop recovery flag so the next OAuth code exchange cannot be mislabeled.
  res.cookies.set(PASSWORD_RECOVERY_COOKIE, '', { path: '/', maxAge: 0 });
  for (const d of legacyAuthCookieDomains()) {
    res.cookies.set(PASSWORD_RECOVERY_COOKIE, '', { path: '/', maxAge: 0, domain: d });
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: authCookieOptions(url.hostname),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const { domain: _ignored, ...rest } = (options ?? {}) as {
            domain?: string;
            path?: string;
            maxAge?: number;
            expires?: Date;
            sameSite?: 'lax' | 'strict' | 'none';
            secure?: boolean;
            httpOnly?: boolean;
          };
          const opts = {
            ...rest,
            path: typeof rest.path === 'string' ? rest.path : '/',
            sameSite: rest.sameSite ?? ('lax' as const),
          };
          try {
            cookieStore.set(name, value, opts);
          } catch {
            // ignore immutable cookie store
          }
          res.cookies.set(name, value, opts);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = /invalid login credentials|invalid_credentials/i.test(error.message)
      ? 'E-posta veya şifre hatalı. Google ile kayıt olduysanız “Google ile giriş yap” kullanın.'
      : /email not confirmed|not confirmed/i.test(error.message)
        ? 'E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzdaki doğrulama bağlantısını kullanın.'
        : error.message;
    return apiError(message, 401);
  }

  if (!data.session || !data.user) {
    return apiError(
      'Giriş doğrulandı ama oturum çerezi oluşmadı. E-posta doğrulaması gerekebilir.',
      401,
    );
  }

  console.info('[api/auth/login] ok', {
    userId: data.user.id,
    host: url.hostname,
  });

  return res;
}
