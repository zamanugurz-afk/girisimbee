import type { Metadata } from 'next';
import Link from 'next/link';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const metadata: Metadata = {
  title: 'Google OAuth Kurulum — Girisimbee',
  robots: { index: false, follow: false },
};

/** Must match Vercel / .env.local NEXT_PUBLIC_SUPABASE_URL exactly. */
const EXPECTED_SUPABASE_HOST = 'https://tszvmnaejsxsyuawwclr.supabase.co';
const EXPECTED_GOOGLE_REDIRECT = `${EXPECTED_SUPABASE_HOST}/auth/v1/callback`;
const EXPECTED_CLIENT_ID =
  '667470685508-48h8l84csnr1mbkg51ul7uv84cfu22mm.apps.googleusercontent.com';

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
const PROJECT_REF = SUPABASE_HOST.replace('https://', '').replace('.supabase.co', '');
const GOOGLE_REDIRECT = SUPABASE_HOST ? `${SUPABASE_HOST}/auth/v1/callback` : '(NEXT_PUBLIC_SUPABASE_URL eksik)';
const PROVIDERS_URL = PROJECT_REF
  ? `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`
  : 'https://supabase.com/dashboard';
const URL_CONFIG_URL = PROJECT_REF
  ? `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/url-configuration`
  : 'https://supabase.com/dashboard';

const hostMismatch =
  Boolean(SUPABASE_HOST) && SUPABASE_HOST !== EXPECTED_SUPABASE_HOST;

export default function GoogleOAuthSetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Google ile giriş — kurulum kontrolü
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <code className="text-xs">Error 400: redirect_uri_mismatch</code> = Google Cloud’taki
        Redirect URI, Supabase Callback URL ile <strong>karakter karakter aynı değil</strong>.
      </p>

      {hostMismatch ? (
        <section className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/5 p-5">
          <h2 className="text-sm font-semibold text-red-800 dark:text-red-200">
            Ortam URL uyuşmazlığı
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Runtime <code className="text-xs">{SUPABASE_HOST}</code> beklenen{' '}
            <code className="text-xs">{EXPECTED_SUPABASE_HOST}</code> değil.
          </p>
        </section>
      ) : null}

      <section className="mt-8 space-y-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
        <h2 className="text-sm font-semibold">ZORUNLU — Google Cloud Redirect URI</h2>
        <p className="text-xs text-muted-foreground">
          Authorized redirect URIs alanına <strong>yalnızca</strong> şunu yapıştır (eksik/fazla harf
          olmasın — özellikle sondaki <code className="text-xs">r</code>):
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{EXPECTED_GOOGLE_REDIRECT}</pre>
        <p className="text-xs text-red-700 dark:text-red-300">
          Yanlış örnek (mismatch üretir):{' '}
          <code className="text-xs">https://tszvmnaejxsyuawwcl.supabase.co/auth/v1/callback</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Client ID (Supabase Providers → Google ile aynı olmalı):
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{EXPECTED_CLIENT_ID}</pre>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">1) Bu ortamın Supabase Callback URL’si</h2>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{GOOGLE_REDIRECT}</pre>
        <p className="text-xs text-muted-foreground">
          Google’a uygulama <code className="text-xs">/auth/callback</code> yazılmaz. Zincir:{' '}
          Google → Supabase <code className="text-xs">/auth/v1/callback</code> → uygulama{' '}
          <code className="text-xs">/auth/callback</code>.
        </p>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">2) Google Cloud → Authorized JavaScript origins</h2>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{`http://localhost:3000
https://girisimbee.vercel.app
https://girisimbee.com
https://www.girisimbee.com
${EXPECTED_SUPABASE_HOST}`}</pre>
        <p className="text-xs text-muted-foreground">
          Eski hash’li Vercel URL’lerini sil. Custom domain’ler canlıysa yukarıdaki kök origin’ler
          ekli olmalı.
        </p>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">3) Supabase → Providers → Google</h2>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>Enable açık</li>
          <li>Client ID = yukarıdaki ID (birebir)</li>
          <li>Client Secret = Google’daki aktif secret (baş/son boşluk yok) → Save</li>
        </ul>
        <p className="text-xs">
          <a className="text-primary underline" href={PROVIDERS_URL} target="_blank" rel="noreferrer">
            Providers ayarını aç
          </a>
        </p>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">4) Supabase → URL Configuration</h2>
        <p className="text-xs text-muted-foreground">Site URL (kanonik — www):</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">https://www.girisimbee.com</pre>
        <p className="text-xs text-muted-foreground">Redirect URLs:</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{`https://www.girisimbee.com/auth/callback
https://www.girisimbee.com/**
https://girisimbee.com/auth/callback
https://girisimbee.com/**
https://girisimbee.vercel.app/auth/callback
https://girisimbee.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**`}</pre>
        <p className="text-xs">
          <a className="text-primary underline" href={URL_CONFIG_URL} target="_blank" rel="noreferrer">
            URL Configuration’ı aç
          </a>
        </p>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">5) Supabase → Auth e-posta markası</h2>
        <p className="text-xs text-muted-foreground">
          Eski “Girişimco / Reset your password” mailleri Supabase şablonundan gelir. Dashboard’da:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>Authentication → Emails → Site name = <strong>Girisimbee</strong></li>
          <li>
            Reset password konusu:{' '}
            <code className="text-xs">Şifre sıfırlama — Girisimbee</code>
          </li>
          <li>Gövde metninde Girişimco geçmesin; Girisimbee kullanın</li>
        </ul>
        <p className="text-xs">
          <a
            className="text-primary underline"
            href={
              PROJECT_REF
                ? `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/templates`
                : 'https://supabase.com/dashboard'
            }
            target="_blank"
            rel="noreferrer"
          >
            Email Templates’i aç
          </a>
        </p>
      </section>

      <p className="mt-8 text-sm">
        <Link href={AUTH_ROUTES.login} className="text-primary underline">
          Giriş sayfasına dön
        </Link>
      </p>
    </main>
  );
}
