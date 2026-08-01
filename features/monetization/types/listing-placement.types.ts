/**
 * Homepage placement packages (Vitrin / Acil Vitrin).
 * Separate from publish-quota packages.
 */
import type { Timestamps } from '@/lib/domain/base';
import type { ListingId, ListingPlacementId, PaymentId } from '@/lib/domain/ids';
import type { PaymentStatus } from '@/lib/domain/marketplace-enums';

/** Paid homepage placement package slugs (Standart Yayın is free UI-only). */
export type PlacementPackageSlug = 'vitrin' | 'hizli_erisim';

/** UI selection including free standard publish (no placement). */
export type ListingPublishPackageChoice = 'standard' | PlacementPackageSlug;

export type ListingPlacementStatus = 'pending' | 'active' | 'expired' | 'cancelled';

export interface ListingPlacement extends Timestamps {
  id: ListingPlacementId;
  listingId: ListingId;
  packageSlug: PlacementPackageSlug;
  featuredListing: boolean;
  urgentListing: boolean;
  startsAt: string;
  endsAt: string;
  paymentId: PaymentId | null;
  paymentStatus: PaymentStatus;
  status: ListingPlacementStatus;
}

export interface CreateListingPlacementInput {
  listingId: ListingId;
  packageSlug: PlacementPackageSlug;
  featuredListing: boolean;
  urgentListing: boolean;
  startsAt: string;
  endsAt: string;
  paymentId?: PaymentId | null;
  paymentStatus?: PaymentStatus;
  status?: ListingPlacementStatus;
}

export const PLACEMENT_PACKAGE_SLUGS: readonly PlacementPackageSlug[] = [
  'vitrin',
  'hizli_erisim',
] as const;

export const STANDARD_PUBLISH_CONFIG = {
  slug: 'standard' as const,
  name: 'Standart Yayın',
  priceCents: 0,
  durationDays: null as number | null,
  benefits: ['Normal listeleme', 'Arama sonuçlarında görünme'],
};

export const PLACEMENT_PACKAGE_CONFIG: Record<
  PlacementPackageSlug,
  {
    slug: PlacementPackageSlug;
    name: string;
    priceCents: number;
    durationDays: number;
    featuredListing: boolean;
    urgentListing: boolean;
    benefits: string[];
  }
> = {
  vitrin: {
    slug: 'vitrin',
    name: 'Vitrin Paketi',
    priceCents: 2900,
    durationDays: 30,
    featuredListing: true,
    urgentListing: false,
    benefits: [
      'Ana sayfadaki Öne Çıkanlar alanında görünme',
      'Daha fazla görüntülenme',
      '30 gün süre',
    ],
  },
  hizli_erisim: {
    slug: 'hizli_erisim',
    name: 'Acil Vitrin Paketi',
    priceCents: 3900,
    durationDays: 30,
    featuredListing: false,
    urgentListing: true,
    benefits: [
      'Ana sayfadaki Acil İlanlar alanında görünme',
      'Daha üst sıralarda gösterilme',
      '30 gün süre',
    ],
  },
};

export const PLACEMENT_PACKAGE_LABELS: Record<PlacementPackageSlug, string> = {
  vitrin: 'Vitrin Paketi',
  hizli_erisim: 'Acil Vitrin Paketi',
};

export function isPlacementPackageSlug(value: string): value is PlacementPackageSlug {
  return (PLACEMENT_PACKAGE_SLUGS as readonly string[]).includes(value);
}

export function formatPlacementPriceTry(priceCents: number): string {
  if (priceCents <= 0) return 'Ücretsiz';
  return `${(priceCents / 100).toLocaleString('tr-TR')} TL`;
}
