import type { Metadata } from 'next';
import Link from 'next/link';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export const metadata: Metadata = {
  title: 'Google OAuth Kurulum — Girisimbee',
  robots: { index: false, follow: false },
};

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
const PROJECT_REF = SUPABASE_HOST.replace('https://', '').replace('.supabase.co', '');
const GOOGLE_REDIRECT = SUPABASE_HOST ? `${SUPABASE_HOST}/auth/v1/callback` : '(NEXT_PUBLIC_SUPABASE_URL eksik)';
const PROVIDERS_URL = PROJECT_REF
  ? `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`
  : 'https://supabase.com/dashboard';
const URL_CONFIG_URL = PROJECT_REF
  ? `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/url-configuration`
  : 'https://supabase.com/dashboard';

export default function GoogleOAuthSetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Google ile giriş — kurulum kontrolü
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <code className="text-xs">Unable to exchange external code</code> hatası Google
        Client Secret / Redirect URI uyumsuzluğundan gelir. Aşağıdaki adresleri birebir kullan.
      </p>

      <section className="mt-8 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">1) Google Cloud → OAuth Web client</h2>
        <p className="text-xs text-muted-foreground">Authorized redirect URIs (yalnızca bu):</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{GOOGLE_REDIRECT}</pre>
        <p className="text-xs text-muted-foreground">Authorized JavaScript origins:</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{`http://localhost:3000
${SUPABASE_HOST}`}</pre>
        <p className="text-xs text-muted-foreground">
          Tip: <strong>Web application</strong>. Secret’ı yeniden oluşturup kopyala.
        </p>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">2) Supabase → Authentication → Providers → Google</h2>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>Enable açık</li>
          <li>Aynı Client ID + yeni Client Secret (baş/son boşluk yok)</li>
          <li>Varsa “Skip nonce checks” açık</li>
          <li>Save</li>
        </ul>
      </section>

      <section className="mt-4 space-y-4 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">3) Supabase → URL Configuration</h2>
        <p className="text-xs text-muted-foreground">Site URL:</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">http://localhost:3000</pre>
        <p className="text-xs text-muted-foreground">Redirect URLs (ekle):</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">{`http://localhost:3000/auth/callback
http://localhost:3000/**`}</pre>
      </section>

      <section className="mt-4 space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Yaygın hata</h2>
        <p className="text-xs text-muted-foreground">
          Google’a <code className="text-xs">localhost:3000/auth/callback</code> yazmak.
          O adres yalnızca Supabase Redirect listesine gider; Google’a{' '}
          <code className="text-xs">…supabase.co/auth/v1/callback</code> yazılır.
        </p>
        <p className="text-xs text-muted-foreground">
          <code className="text-xs">Unable to exchange external code: 4/0A…</code> içindeki
          kod parçası Google hata kodu değil — başarısız token değişiminde kullanılan
          authorization code öneki. Asıl sebep neredeyse her zaman yanlış Client Secret
          veya Google’daki Redirect URI uyumsuzluğu.
        </p>
      </section>

      <section className="mt-4 space-y-2 rounded-2xl border border-border/80 bg-card p-5">
        <h2 className="text-sm font-semibold">4) Kod tarafı teşhis (dev)</h2>
        <p className="text-xs text-muted-foreground">
          Uygulama doğru redirect üretiyor mu diye JSON çıktısına bak:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">http://localhost:3000/api/auth/oauth-diagnose</pre>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={AUTH_ROUTES.login}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Giriş sayfasına dön
        </Link>
        <a
          href={PROVIDERS_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Supabase Providers
        </a>
        <a
          href={URL_CONFIG_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          URL Configuration
        </a>
      </div>
    </main>
  );
}
