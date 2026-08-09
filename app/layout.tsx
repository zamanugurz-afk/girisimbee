import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import { NavProfileRoot } from '@/lib/perf/nav-profile-root';
import { resolveSiteUrl } from '@/lib/site-url';
import { isMaintenanceMode } from '@/lib/site-mode';
import { BRAND_PAGE_TITLE } from '@/features/shared';
import type { ReactNode } from 'react';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const maintenance = isMaintenanceMode();

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: maintenance ? `Çok Yakında — Girisimbee` : BRAND_PAGE_TITLE,
  description: maintenance
    ? 'Girişimbee şu anda geliştirme aşamasında. Çok yakında yeniden buradayız.'
    : 'Yatırımcılar, girişimciler, iş arayanlar ve işverenleri tek platformda buluşturuyoruz.',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: maintenance ? `Çok Yakında — Girisimbee` : BRAND_PAGE_TITLE,
    description: maintenance
      ? 'Girişimbee şu anda geliştirme aşamasında. Çok yakında yeniden buradayız.'
      : 'Yatırımcılar, girişimciler, iş arayanlar ve işverenleri tek platformda buluşturuyoruz.',
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
      <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans antialiased`}>
        {process.env.NAV_PROFILE === '1' ? (
          <NavProfileRoot>{body}</NavProfileRoot>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
