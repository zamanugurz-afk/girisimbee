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
  durationDays: 30,
  /** First listing per category is free; additional / renewals use STANDARD_REPUBLISH_CONFIG. */
  freePerCategory: 1,
  benefits: [
    'Normal listeleme',
    'Arama sonuçlarında görünme',
    '30 gün yayında kalma',
    'Kategori başına 1 ücretsiz ilan',
  ],
};

/**
 * Same category extra listing OR renew after 30 days — 99 TL / 30 days.
 * Applies to free (placement) categories; franchise / job / dijital keep their own fees.
 */
export const STANDARD_REPUBLISH_CONFIG = {
  slug: 'standard_republish' as const,
  name: 'Ek İlan / Yenileme',
  priceCents: 9900,
  durationDays: 30,
  benefits: [
    '30 gün yeniden yayın',
    'Aynı kategoride ek ilan veya süre dolunca yenileme',
  ],
} as const;

/** Required fee to publish / renew a franchise listing (30 days). */
export const FRANCHISE_PUBLISH_CONFIG = {
  slug: 'franchise_publish' as const,
  name: 'Franchise İlan Paketi',
  priceCents: 100_000,
  durationDays: 30,
  benefits: [
    'Franchise kategorisinde yayın',
    '30 gün yayında kalma',
    'Süre sonunda 1.000 TL ile yeniden yayın',
  ],
} as const;

/** Dijital & AI listing publish fee (30 days). */
export const DIGITAL_AI_PUBLISH_CONFIG = {
  slug: 'dijital_ai_publish' as const,
  name: 'Dijital & AI İlan Paketi',
  priceCents: 100_000,
  durationDays: 30,
  benefits: [
    'Dijital & AI kategorisinde yayın',
    '30 gün yayında kalma',
    'Süre sonunda 1.000 TL ile yeniden yayın',
  ],
} as const;

/** Job listing publish fee (per listing). */
export const JOB_PUBLISH_CONFIG = {
  slug: 'job_publish' as const,
  name: 'İş İlanı Paketi',
  priceCents: 25_000,
  durationDays: null as number | null,
  benefits: [
    'İş ilanı başına yayın hakkı',
    'İlan başına 250 TL',
  ],
} as const;

/** Free publish modules (Yatırım Arıyorum / Ortak Arıyorum). */
export const FREE_PUBLISH_MODULES = ['entrepreneurs', 'investors', 'founders'] as const;

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
    priceCents: 9900,
    durationDays: 30,
    featuredListing: true,
    urgentListing: false,
    benefits: [
      'Ana sayfadaki Öne Çıkanlar alanında görünme',
      'Daha fazla görüntülenme',
      '30 gün süre — süre sonunda yeniden ödeme gerekir',
    ],
  },
  hizli_erisim: {
    slug: 'hizli_erisim',
    name: 'Acil Vitrin Paketi',
    priceCents: 9900,
    durationDays: 30,
    featuredListing: false,
    urgentListing: true,
    benefits: [
      'Ana sayfadaki Acil İlanlar alanında görünme',
      'Daha üst sıralarda gösterilme',
      '30 gün süre — süre sonunda yeniden ödeme gerekir',
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
