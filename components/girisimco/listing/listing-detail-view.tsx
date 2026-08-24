'use client';

import { ListingBreadcrumb } from '@/components/girisimco/listing/listing-breadcrumb';
import { ListingDetailActions } from '@/components/girisimco/listing/listing-detail-actions';
import { ListingDetailGallery } from '@/components/girisimco/listing/listing-detail-gallery';
import { ListingDetailMeta } from '@/components/girisimco/listing/listing-detail-meta';
import { ListingDetailMobileBar } from '@/components/girisimco/listing/listing-detail-mobile-bar';
import { ListingMainContent } from '@/components/girisimco/listing/listing-main-content';
import { ListingOwnerPackagePanel } from '@/components/girisimco/listing/listing-owner-package-panel';
import { ListingSidebar } from '@/components/girisimco/listing/listing-sidebar';
import { ListingSimilar } from '@/components/girisimco/listing/listing-similar';
import { ListingCareerRecommendations } from '@/features/matching-engine/components/listing-career-recommendations';
import { ListingPartnershipRecommendations } from '@/features/partnership-matching/presentation/listing-partnership-recommendations';
import { ListingDigitalRecommendations } from '@/features/digital-solution-matching/presentation/listing-digital-recommendations';
import { ListingFranchiseRecommendations } from '@/features/franchise-matching/presentation/listing-franchise-recommendations';
import { PremiumGate } from '@/components/girisimco/premium/premium-gate';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { ListingDetail } from '@/features/listings';

interface ListingDetailViewProps {
  listing: ListingDetail;
}

export function ListingDetailView({ listing }: ListingDetailViewProps) {
  const { user, isLoading } = useAuth();
  const isOwner =
    Boolean(user?.id && listing.ownerUserId && user.id === listing.ownerUserId);
  const isCareerListing =
    Boolean(listing.careerCard)
    && (listing.category.id === 'find-job' || listing.category.id === 'hire');
  const isPartnershipListing = listing.category.id === 'find-partner';
  const isDigitalSolutionListing = listing.category.id === 'digital-ai';
  const isFranchiseListing = listing.category.id === 'franchise';

  return (
    <main
      className={cn(
        'relative min-h-screen bg-gradient-to-b from-muted/30 via-background to-background dark:from-background dark:via-background',
        isCareerListing ? 'pt-6' : 'pt-14',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.07] via-transparent to-transparent" />

      <div
        className={cn(
          'relative mx-auto max-w-7xl',
          isCareerListing
            ? 'px-4 py-3 pb-8 lg:px-6 lg:py-3.5 lg:pb-8'
            : 'px-5 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-12',
        )}
      >
        <ListingBreadcrumb listing={listing} />

        {isCareerListing ? null : (
          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 xl:gap-10">
            <ListingDetailGallery listing={listing} />
            <ListingDetailMeta listing={listing} />
          </section>
        )}

        {isCareerListing ? null : (
          <ListingDetailActions listing={listing} className="mt-6 hidden lg:flex" />
        )}

        {/* Non-career listings: show owner package panel at top */}
        {!isCareerListing && !isLoading && isOwner && listing.listingId ? (
          <div id="owner-package-panel" className="mt-6">
            <PremiumGate>
              <ListingOwnerPackagePanel listingId={listing.listingId} />
            </PremiumGate>
          </div>
        ) : null}

        {isCareerListing ? (
          <div className="mt-3">
            <ListingMainContent listing={listing} />
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
            <ListingMainContent listing={listing} />
            <ListingSidebar listing={listing} />
          </div>
        )}

        {isPartnershipListing && listing.listingId ? (
          <ListingPartnershipRecommendations listingId={listing.listingId} />
        ) : null}

        {isDigitalSolutionListing && listing.listingId ? (
          <ListingDigitalRecommendations listingId={listing.listingId} />
        ) : null}

        {isFranchiseListing && listing.listingId ? (
          <ListingFranchiseRecommendations listingId={listing.listingId} />
        ) : null}

        {isCareerListing ? null : <ListingSimilar listing={listing} />}
      </div>

      {isCareerListing ? null : <ListingDetailMobileBar listing={listing} />}
    </main>
  );
}
