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
    companyName: (details.brandName ?? details.companyName ?? listing.title) as string | null,
    establishmentYear: details.establishmentYear,
    franchiseModel: details.franchiseModel || details.businessCategory,
    sector: listing.industry || details.sector,
    branchCount: details.branchCount,
    website: details.website,
    totalInvestment: details.totalInvestment || details.minimumYatirim,
    franchiseFee: details.franchiseFee || details.entryFee,
    profitMargin: details.profitMargin,
    advertisingFee: details.advertisingFee,
    averageSetupDuration: details.averageSetupDuration,
    returnPeriod: details.returnPeriod,
    minCapitalRequirement: details.minCapitalRequirement,
    royaltyFee: details.royaltyFee,
    trainingSupport: details.trainingSupport,
    operationalSupport: details.operationalSupport,
    marketingSupport: details.marketingSupport,
    locationSupport: details.locationSupport,
    logisticsSupport: details.logisticsSupport,
    exclusiveTerritory: details.exclusiveTerritory,
    trademarkStatus: details.trademarkStatus,
    contractProvided: details.contractProvided,
    minSquareMeters: details.minSquareMeters,
    storeLocationType: details.storeLocationType || details.storeSize,
    availableCities: details.availableCities,
    city: listing.city,
    district: listing.district,
    coverUrl: details.coverImageUrl || details.brandLogoUrl,
    longDescription: listing.longDescription || listing.shortDescription,
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
