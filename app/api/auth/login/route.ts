import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { apiError, ok } from '@/lib/api/response';
import { authCookieOptions } from '@/lib/supabase/cookie-options';

const bodySchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

/**
 * Server login — writes sb-* session cookies onto the HTTP response.
 * Browser-only signInWithPassword was succeeding in-memory while cookies
 * failed to stick (domain-scoped ghosts / publishable-key edge cases).
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
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: authCookieOptions(url.hostname),
    cookies: {
      getAll() {
        return request.headers
          .get('cookie')
          ?.split(';')
          .map((part) => {
            const [name, ...rest] = part.trim().split('=');
            return { name, value: rest.join('=') };
          })
          .filter((c) => Boolean(c.name)) ?? [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options: options ?? {} });
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
      'Giriş doğrulandı ama oturum çerezi oluşmadı. E-posta doğrulaması gerekebilir veya tarayıcı çerezleri engelleniyor olabilir.',
      401,
    );
  }

  const res = ok({
    ok: true,
    userId: data.user.id,
    email: data.user.email ?? email,
  });

  // Prefer host-only cookies so Domain=.girisimbee.com ghosts cannot shadow them.
  for (const { name, value, options } of pendingCookies) {
    const { domain: _domain, ...rest } = options as {
      domain?: string;
      path?: string;
      maxAge?: number;
      expires?: Date;
      sameSite?: 'lax' | 'strict' | 'none';
      secure?: boolean;
      httpOnly?: boolean;
    };
    res.cookies.set(name, value, {
      ...rest,
      path: typeof rest.path === 'string' ? rest.path : '/',
      sameSite: rest.sameSite ?? 'lax',
    });
  }

  console.info('[api/auth/login] ok', {
    userId: data.user.id,
    cookieCount: pendingCookies.length,
    host: url.hostname,
  });

  return res;
}
