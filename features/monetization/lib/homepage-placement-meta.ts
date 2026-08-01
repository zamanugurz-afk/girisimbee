/**
 * Paid homepage placement marker stored on listing.customFields.
 * Used so Öne Çıkan / Acil only show package-purchased listings (no DB migration).
 */
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { PlacementPackageSlug } from '@/features/monetization/types/listing-placement.types';

export const HOMEPAGE_PLACEMENT_FIELD = 'homepagePlacement';

export interface HomepagePlacementMeta {
  source: 'simulated_payment';
  packages: PlacementPackageSlug[];
  vitrinUntil: string | null;
  acilUntil: string | null;
  purchasedAt: string;
}

export function readHomepagePlacementMeta(
  customFields: Record<string, unknown> | null | undefined,
): HomepagePlacementMeta | null {
  const raw = customFields?.[HOMEPAGE_PLACEMENT_FIELD];
  if (!raw || typeof raw !== 'object') return null;
  const meta = raw as Partial<HomepagePlacementMeta>;
  if (!Array.isArray(meta.packages)) return null;
  return {
    source: 'simulated_payment',
    packages: meta.packages.filter(
      (p): p is PlacementPackageSlug => p === 'vitrin' || p === 'hizli_erisim',
    ),
    vitrinUntil: typeof meta.vitrinUntil === 'string' ? meta.vitrinUntil : null,
    acilUntil: typeof meta.acilUntil === 'string' ? meta.acilUntil : null,
    purchasedAt: typeof meta.purchasedAt === 'string' ? meta.purchasedAt : '',
  };
}

export function hasActivePaidVitrin(listing: Listing, nowMs = Date.now()): boolean {
  const meta = readHomepagePlacementMeta(listing.customFields);
  if (!meta?.packages.includes('vitrin')) return false;
  if (!listing.isFeatured || !listing.featuredUntil) return false;
  return new Date(listing.featuredUntil).getTime() > nowMs;
}

export function hasActivePaidAcil(listing: Listing, nowMs = Date.now()): boolean {
  const meta = readHomepagePlacementMeta(listing.customFields);
  if (!meta?.packages.includes('hizli_erisim')) return false;
  if (!listing.isUrgent || !listing.urgentUntil) return false;
  return new Date(listing.urgentUntil).getTime() > nowMs;
}

export function buildHomepagePlacementMeta(
  packages: PlacementPackageSlug[],
  vitrinUntil: string | null,
  acilUntil: string | null,
  existing?: HomepagePlacementMeta | null,
): HomepagePlacementMeta {
  const merged = new Set<PlacementPackageSlug>([
    ...(existing?.packages ?? []),
    ...packages,
  ]);
  return {
    source: 'simulated_payment',
    packages: [...merged],
    vitrinUntil: vitrinUntil ?? existing?.vitrinUntil ?? null,
    acilUntil: acilUntil ?? existing?.acilUntil ?? null,
    purchasedAt: new Date().toISOString(),
  };
}
