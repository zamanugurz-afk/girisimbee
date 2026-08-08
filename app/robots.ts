import type { MetadataRoute } from 'next';
import { resolveCanonicalSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveCanonicalSiteUrl();
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
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
