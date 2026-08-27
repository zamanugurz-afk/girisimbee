'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
  const isPartnershipListing =
    Boolean(listing.partnershipCard)
    || listing.category.id === 'find-partner';
  const isDigitalSolutionListing = listing.category.id === 'digital-ai';
  const isFranchiseListing =
    Boolean(listing.franchiseCard)
    || listing.category.id === 'franchise';
  const isUnifiedCardListing = isCareerListing || isPartnershipListing || isFranchiseListing;

  const backLink = isCareerListing
    ? { href: '/is', label: 'Kariyer Menüsüne Dön' }
    : isPartnershipListing
      ? { href: '/ortaklik', label: 'Ortaklık & Devir Menüsüne Dön' }
      : isFranchiseListing
        ? { href: '/franchise', label: 'Franchise & Bayilik Menüsüne Dön' }
        : null;

  return (
    <main
      className={cn(
        'relative min-h-screen bg-gradient-to-b from-muted/30 via-background to-background dark:from-background dark:via-background',
        isUnifiedCardListing
          ? 'pt-[calc(var(--gc-header-height,3.75rem)+0.75rem)] sm:pt-[calc(var(--gc-header-height,3.75rem)+1rem)]'
          : 'pt-[calc(var(--gc-header-height,3.75rem)+1.5rem)] sm:pt-[calc(var(--gc-header-height,3.75rem)+2rem)]',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.07] via-transparent to-transparent" />

      <div
        className={cn(
          'relative mx-auto',
          isUnifiedCardListing
            ? 'max-w-7xl 2xl:max-w-[1360px] px-4 py-1 pb-12 lg:px-6 lg:py-2 lg:pb-16'
            : 'max-w-7xl px-5 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-12',
        )}
      >
        {backLink ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>{backLink.label}</span>
            </Link>
            <ListingBreadcrumb listing={listing} />
          </div>
        ) : (
          <ListingBreadcrumb listing={listing} />
        )}

        {isUnifiedCardListing ? null : (
          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 xl:gap-10">
            <ListingDetailGallery listing={listing} />
            <ListingDetailMeta listing={listing} />
          </section>
        )}

        {isUnifiedCardListing ? null : (
          <ListingDetailActions listing={listing} className="mt-6 hidden lg:flex" />
        )}

        {/* Non-unified listings: show owner package panel at top */}
        {!isUnifiedCardListing && !isLoading && isOwner && listing.listingId ? (
          <div id="owner-package-panel" className="mt-6">
            <PremiumGate>
              <ListingOwnerPackagePanel listingId={listing.listingId} />
            </PremiumGate>
          </div>
        ) : null}

        {isUnifiedCardListing ? (
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

        {isUnifiedCardListing ? null : <ListingSimilar listing={listing} />}
      </div>

      {isUnifiedCardListing ? null : <ListingDetailMobileBar listing={listing} />}
    </main>
  );
}
