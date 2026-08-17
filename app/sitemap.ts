import type { MetadataRoute } from 'next';
import { getAllCategoryRoutePaths } from '@/features/listings/config/marketplace.config';
import { resolveCanonicalSiteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveCanonicalSiteUrl();
  const staticPaths = [
    '/',
    '/kesfet',
    '/ilanlar',
    '/ara',
    '/investors',
    '/is',
    '/hire',
    '/is-ariyorum',
    '/partners',
    '/girisim-ortaklik',
    '/dijital-ai',
    '/franchise/buy',
    '/market',
    '/reklam',
    '/ilan/olustur',
    '/yasal/gizlilik',
    '/yasal/kvkk',
    '/yasal/kvkk-aydinlatma',
    '/yasal/acik-riza',
    '/yasal/cerez',
    '/yasal/cerez-tercihleri',
    '/yasal/kullanici-sozlesmesi',
    '/kvkk',
  ];

  const categoryPaths = getAllCategoryRoutePaths();

  const paths = Array.from(new Set([...staticPaths, ...categoryPaths]));

  return paths.map((path) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' || path === '/kesfet' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === '/kesfet' || path === '/market' ? 0.9 : 0.7,
  }));
}
