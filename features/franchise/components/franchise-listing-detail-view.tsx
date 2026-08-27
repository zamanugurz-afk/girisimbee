import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { FranchiseListingDetailViewModel } from '@/features/franchise/types/franchise-listing.types';
import type { FranchiseCardData } from '@/features/listings/types/listing.types';
import { FranchiseProfilePreview } from '@/features/franchise/components/FranchiseProfilePreview';
import {
  FRANCHISE_DETAIL_BACK_LABEL,
} from '@/features/franchise/presentation/franchise-copy';
import { ListingFranchiseRecommendations } from '@/features/franchise-matching/presentation/listing-franchise-recommendations';

interface FranchiseListingDetailViewProps {
  data: FranchiseListingDetailViewModel;
  backHref: string;
  backLabel?: string;
}

export function FranchiseListingDetailView({
  data,
  backHref,
  backLabel = FRANCHISE_DETAIL_BACK_LABEL,
}: FranchiseListingDetailViewProps) {
  const { listing, details } = data;

  const franchiseCard: FranchiseCardData = {
    companyName: (details.companyName ?? listing.title) as string | null,
    establishmentYear: details.establishmentYear ?? undefined,
    franchiseModel: (details.franchiseModel || details.businessCategory) ?? undefined,
    sector: listing.industry ?? null,
    branchCount: details.branchCount ?? undefined,
    website: details.website ?? undefined,
    totalInvestment: details.totalInvestment != null ? String(details.totalInvestment) : (details.minimumYatirim != null ? String(details.minimumYatirim) : null),
    franchiseFee: details.franchiseFee != null ? String(details.franchiseFee) : (details.entryFee != null ? String(details.entryFee) : null),
    profitMargin: details.profitMargin ?? undefined,
    advertisingFee: details.advertisingFee != null ? String(details.advertisingFee) : undefined,
    averageSetupDuration: details.averageSetupDuration ?? undefined,
    returnPeriod: details.returnPeriod ?? undefined,
    minCapitalRequirement: details.minCapitalRequirement != null ? String(details.minCapitalRequirement) : undefined,
    royaltyFee: details.royaltyFee != null ? String(details.royaltyFee) : undefined,
    trainingSupport: details.trainingSupport ?? undefined,
    operationalSupport: details.operationalSupport ?? undefined,
    marketingSupport: details.marketingSupport ?? undefined,
    locationSupport: details.locationSupport ?? undefined,
    logisticsSupport: details.logisticsSupport ?? undefined,
    exclusiveTerritory: details.exclusiveTerritory ?? undefined,
    trademarkStatus: details.trademarkStatus ?? undefined,
    contractProvided: details.contractProvided ?? undefined,
    minSquareMeters: details.minSquareMeters ?? undefined,
    storeLocationType: (details.storeLocationType || details.storeSize) ?? undefined,
    availableCities: details.availableCities ?? undefined,
    city: listing.city ?? null,
    district: listing.district ?? null,
    coverUrl: details.coverImageUrl || details.brandLogoUrl || null,
    longDescription: listing.longDescription || listing.shortDescription || null,
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-muted/30 via-background to-background dark:from-background dark:via-background pt-[calc(var(--gc-header-height,3.75rem)+0.75rem)] sm:pt-[calc(var(--gc-header-height,3.75rem)+1rem)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.07] via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1360px] px-4 py-1 pb-12 lg:px-6 lg:py-2 lg:pb-16">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>{backLabel}</span>
          </Link>
        </div>

        <div className="mt-3">
          <FranchiseProfilePreview
            franchise={franchiseCard}
            listingId={String(listing.id)}
            ownerUserId={listing.ownerId ? String(listing.ownerId) : undefined}
          />
        </div>

        <ListingFranchiseRecommendations listingId={String(listing.id)} />
      </div>
    </main>
  );
}
