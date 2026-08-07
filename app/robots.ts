import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://girisimbee.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/hesabim',
          '/admin',
          '/mesajlar',
          '/api/',
          '/auth/',
          '/ilanlarim',
          '/favoriler',
          '/ayarlar',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
