'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useListingDetail } from '@/hooks/use-listing-detail';
import { useFavorites } from '@/hooks/use-favorites';
import { OWNER_ROUTE } from '@/config/site';
import { extractListingId } from '@/lib/nav';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/feedback/spinner';
import { ErrorState } from '@/components/feedback/error-state';

import { ListingHeader } from '@/components/listing-detail/listing-header';
import { ImageGallery } from '@/components/listing-detail/image-gallery';
import { AIDecisionCard, ScoreRadial } from '@/components/listing-detail/ai-decision';
import { MarketAnalysisCard, PriceHistorySection, PriceComparisonCard } from '@/components/listing-detail/market-sections';
import { NegotiationCenter } from '@/components/listing-detail/negotiation-center';
import { SellerInfoCard, SellerRiskAnalysis } from '@/components/listing-detail/seller-sections';
import { DescriptionAnalysis, PhotoAnalysis } from '@/components/listing-detail/analysis-sections';
import { PurchaseChecklist } from '@/components/listing-detail/purchase-checklist';
import { LocationSection } from '@/components/listing-detail/location-section';
import { SimilarListingsTable, BetterAlternativesSection } from '@/components/listing-detail/comparison-sections';
import { RiskCenter, PurchaseTimeline } from '@/components/listing-detail/risk-timeline';
import { NotesSection, PurchaseStatusSection, AISummaryReport } from '@/components/listing-detail/notes-status';
import { ActionSidebar, BottomActionBar } from '@/components/listing-detail/action-sidebar';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) ?? null;
  const listingId = rawId ? extractListingId(rawId) : null;

  const data = useListingDetail(listingId);
  const { isFavorite, toggle } = useFavorites();
  const isFav = listingId ? isFavorite(listingId) : false;

  if (!listingId || data.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} />
          <p className="text-sm text-muted-foreground">İlan yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (!data.listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="İlan bulunamadı"
          description="Bu ilan artık mevcut değil veya kaldırılmış olabilir."
          onRetry={() => router.push(`${OWNER_ROUTE}/listings`)}
        />
      </div>
    );
  }

  const { listing, analysis, marketStats, seller, priceHistory, similarListings, betterAlternatives, marketComparison, priceHistorySummary, negotiation, riskFlags, timeline } = data;

  const toggleFavorite = () => {
    if (!listingId) return;
    toggle(listingId);
    toast(isFav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', {
      description: listing.product?.name,
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] pb-20 lg:pb-8">
      {/* Back button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${OWNER_ROUTE}/listings`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              İlanlara dön
            </Link>
          </Button>
          <Breadcrumbs
            items={[
              { label: 'Panel', href: OWNER_ROUTE },
              { label: 'İlanlar', href: `${OWNER_ROUTE}/listings` },
              { label: listing.product?.name ?? 'İlan Detayı' },
            ]}
          />
        </div>
      </div>

      {/* 12-column responsive grid: 8 cols content + 4 cols sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main content — scrollable */}
        <div className="space-y-6 lg:col-span-8">
          {/* Image gallery */}
          <ImageGallery images={listing.image_urls} title={listing.title} />

          {/* Header info */}
          <ListingHeader listing={listing} analysis={analysis} marketStats={marketStats} />

          {/* AI Purchase Decision — most prominent */}
          {analysis && (
            <AIDecisionCard analysis={analysis} listing={listing} marketStats={marketStats} />
          )}

          {/* AI Opportunity Score */}
          {analysis && <ScoreRadial analysis={analysis} />}

          {/* Market Analysis */}
          <MarketAnalysisCard listing={listing} marketStats={marketStats} />

          {/* Price History */}
          <PriceHistorySection
            priceHistory={priceHistory}
            listingPrice={listing.price}
            summary={priceHistorySummary}
          />

          {/* Price Comparison */}
          <PriceComparisonCard comparison={marketComparison} similarListings={similarListings} />

          {/* Negotiation Center */}
          <NegotiationCenter negotiation={negotiation} listingPrice={listing.price} />

          {/* Seller Info + Risk */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SellerInfoCard seller={seller} provider={listing.provider} analysis={analysis} />
            <SellerRiskAnalysis seller={seller} analysis={analysis} listingCount={seller?.listing_count ?? 0} />
          </div>

          {/* Description + Photo Analysis */}
          <div className="grid grid-cols-1 gap-4">
            <DescriptionAnalysis listing={listing} analysis={analysis} />
            <PhotoAnalysis listing={listing} analysis={analysis} />
          </div>

          {/* Purchase Checklist */}
          <PurchaseChecklist listing={listing} />

          {/* Location */}
          <LocationSection listing={listing} />

          {/* Similar Listings + Better Alternatives */}
          <BetterAlternativesSection
            betterAlternatives={betterAlternatives}
            productName={listing.product?.name ?? ''}
            currentPrice={listing.price}
          />
          <SimilarListingsTable
            similarListings={similarListings}
            currentPrice={listing.price}
            currentScore={analysis?.opportunity_score ?? 0}
          />

          {/* Risk Center + Timeline */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RiskCenter riskFlags={riskFlags} />
            <PurchaseTimeline timeline={timeline} />
          </div>

          {/* AI Summary */}
          <AISummaryReport listing={listing} analysis={analysis} marketStats={marketStats} seller={seller} />

          {/* Notes + Purchase Status */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <NotesSection listingId={listing.id} />
            <PurchaseStatusSection listingId={listing.id} />
          </div>
        </div>

        {/* Sticky action sidebar */}
        <div className="lg:col-span-4">
          <ActionSidebar
            listing={listing}
            analysis={analysis}
            isFavorite={isFav}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </div>

      {/* Bottom action bar — mobile only */}
      <BottomActionBar listing={listing} isFavorite={isFav} onToggleFavorite={toggleFavorite} />
    </div>
  );
}
