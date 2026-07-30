import { OWNER_ROUTE } from '@/config/site';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function listingUrl(id: string, title?: string): string {
  const slug = title ? slugify(title) : id;
  return `${OWNER_ROUTE}/listings/${slug}-${id}`;
}

export function productUrl(slug: string): string {
  return `${OWNER_ROUTE}/products/${slug}`;
}

export function groupedProductUrl(groupId: string): string {
  return `${OWNER_ROUTE}/listings/group/${encodeURIComponent(groupId)}`;
}

export function extractGroupedProductId(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

const LISTING_ID_UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extractListingId(param: string): string {
  const uuidMatch = param.match(LISTING_ID_UUID_RE);
  if (uuidMatch) return uuidMatch[0];

  const parts = param.split('-');
  return parts[parts.length - 1] || param;
}
