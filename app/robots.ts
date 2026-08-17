import type { MetadataRoute } from 'next';
import { resolveCanonicalSiteUrl } from '@/lib/site-url';
import { isSiteIpAllowlistEnabled } from '@/lib/site-ip-allowlist';
import { isMaintenanceMode } from '@/lib/site-mode';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveCanonicalSiteUrl();
  const publicClosed = isMaintenanceMode() || isSiteIpAllowlistEnabled();

  if (publicClosed) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

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
