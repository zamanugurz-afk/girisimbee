import './globals.css';
import type { Metadata } from 'next';
import { Dancing_Script, Inter, JetBrains_Mono, Josefin_Sans } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import { NavProfileRoot } from '@/lib/perf/nav-profile-root';
import { resolveSiteUrl } from '@/lib/site-url';
import { isMaintenanceMode } from '@/lib/site-mode';
import { BRAND_PAGE_TITLE } from '@/features/shared';
import type { ReactNode } from 'react';

const sans = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
const josefin = Josefin_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-josefin',
  display: 'swap',
  weight: ['300', '400', '600', '700'],
});
const dancingScript = Dancing_Script({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-script',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const maintenance = isMaintenanceMode();

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: maintenance ? `Çok Yakında — Girisimbee` : BRAND_PAGE_TITLE,
  description: maintenance
    ? 'Girişimbee şu anda geliştirme aşamasında. Çok yakında yeniden buradayız.'
    : 'Yatırımcılar, girişimciler, iş arayanlar ve işverenleri tek platformda buluşturuyoruz.',
  applicationName: 'Girisimbee',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#12151C' },
  ],
  openGraph: {
    title: maintenance ? `Çok Yakında — Girisimbee` : BRAND_PAGE_TITLE,
    description: maintenance
      ? 'Girişimbee şu anda geliştirme aşamasında. Çok yakında yeniden buradayız.'
      : 'Yatırımcılar, girişimciler, iş arayanlar ve işverenleri tek platformda buluşturuyoruz.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Girisimbee',
    images: [{ url: '/brand/girisimbee-logo.png', alt: 'Girisimbee' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: maintenance ? `Çok Yakında — Girisimbee` : BRAND_PAGE_TITLE,
    description: maintenance
      ? 'Girişimbee şu anda geliştirme aşamasında. Çok yakında yeniden buradayız.'
      : 'Yatırımcılar, girişimciler, iş arayanlar ve işverenleri tek platformda buluşturuyoruz.',
    images: ['/brand/girisimbee-logo.png'],
  },
  robots: maintenance
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Do not await getServerSession here — it adds a Supabase Auth RTT to every navigation.
  // Protected routes still resolve session in their own layouts/pages; AuthProvider hydrates client-side.
  const body = <AppProviders initialUser={null}>{children}</AppProviders>;

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${sans.variable} ${josefin.variable} ${dancingScript.variable} ${mono.variable} font-sans antialiased`}>
        {process.env.NAV_PROFILE === '1' ? (
          <NavProfileRoot>{body}</NavProfileRoot>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
