/**
 * Feature-driven design (FDD) architecture.
 *
 * Rules:
 * - app/ routes compose features — no business logic in app/
 * - features/ owns domain UI, hooks, types, services, mock, constants
 * - components/ui/ — shadcn primitives only
 * - No duplicated cards, forms, or filters across features
 *
 * Import pattern:
 *   import { ListingDetailPage, listingViewService, useListingEngine } from '@/features/listings';
 *   import { IntentGateway } from '@/features/categories';
 *   import { SiteHeader, useAuth } from '@/features/shared';
 *
 * Do NOT import from @/lib/girisimco/* (deprecated shims).
 * Do NOT import deep feature paths from app/ — use feature barrels.
 */
export * as shared from '@/features/shared';
export * as categories from '@/features/categories';
export * as listings from '@/features/listings';
export * as authentication from '@/features/authentication';
export * as dashboard from '@/features/dashboard';
export * as profiles from '@/features/profiles';
export * as companies from '@/features/companies';
export * as messaging from '@/features/messaging';
export * as notifications from '@/features/notifications';
export * as favorites from '@/features/favorites';
export * as search from '@/features/search';
