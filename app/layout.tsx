import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import { NavProfileRoot } from '@/lib/perf/nav-profile-root';
import { resolveSiteUrl } from '@/lib/site-url';

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

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: 'Girisimco — Doğru Kişi, Doğru Fırsat',
  description:
    'Yatırımcılar, girişimciler, iş arayanlar ve işverenleri tek platformda buluşturuyoruz.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFBFD' },
    { media: '(prefers-color-scheme: dark)', color: '#12151C' },
  ],
  openGraph: {
    title: 'Girisimco — Doğru Kişi, Doğru Fırsat',
    description:
      'Yatırımcılar, girişimciler, iş arayanlar ve işverenleri tek platformda buluşturuyoruz.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const body = (
    <AppProviders>{children}</AppProviders>
  );

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
