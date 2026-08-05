import type { MetadataRoute } from 'next';
import { getAllCategoryRoutePaths } from '@/features/listings/config/marketplace.config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://girisimco.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '/',
    '/kesfet',
    '/ara',
    '/invest',
    '/investors',
    '/hire',
    '/partners',
    '/dijital-ai',
    '/franchise/buy',
    '/market',
    '/reklam',
    '/ilan/olustur',
    '/yasal/gizlilik',
    '/yasal/kvkk-aydinlatma',
    '/yasal/cerez',
    '/yasal/kullanici-sozlesmesi',
  ];

  const categoryPaths = getAllCategoryRoutePaths();

  const paths = Array.from(new Set([...staticPaths, ...categoryPaths]));

  return paths.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' || path === '/kesfet' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === '/kesfet' || path === '/market' ? 0.9 : 0.7,
  }));
}
