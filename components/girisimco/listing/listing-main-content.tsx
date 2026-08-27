import { FileText, Link2, Play, ShieldCheck } from 'lucide-react';
import {
  DetailCard,
  DetailSectionIf,
  FactGrid,
  FactRow,
} from '@/components/girisimco/listing/detail-primitives';
import { DigitalAiCapabilityGrid } from '@/components/girisimco/listing/digital-ai-capability-grid';
import { ListingRichText } from '@/components/girisimco/listing/listing-rich-text';
import { CareerProfilePreview } from '@/features/candidates/components/CareerProfilePreview';
import { InvestorProfilePreview } from '@/features/investors/components/InvestorProfilePreview';
import { PartnershipProfilePreview } from '@/features/founders/components/PartnershipProfilePreview';
import { FranchiseProfilePreview } from '@/features/franchise/components/FranchiseProfilePreview';
import type { ListingDetail } from '@/features/listings';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';
import { cn } from '@/lib/utils';

interface ListingMainContentProps {
  listing: ListingDetail;
}

const attachmentIcons = {
  pdf: FileText,
  video: Play,
  link: Link2,
};

const INVESTMENT_CATEGORIES = new Set(['invest']);

function hasInvestmentFacts(listing: ListingDetail): boolean {
  const { investment } = listing;
  return [
    investment.requested,
    investment.equity,
    investment.stage,
    investment.industry,
    investment.useOfFunds,
    investment.companyAge,
    investment.website,
  ].some((value) => !isEmptyDisplayValue(value));
}

function hasCompanyFacts(listing: ListingDetail): boolean {
  const { company } = listing;
  return [
    company.name,
    company.summary,
    company.city,
    company.website,
    company.employees,
    company.founded,
    company.sector,
    company.branchCount,
  ].some((value) => !isEmptyDisplayValue(value));
}

function isFranchiseBrandListing(listing: ListingDetail): boolean {
  return listing.category.id === 'franchise'
    || Boolean(listing.company.branchCount)
    || Boolean(listing.company.sector && listing.company.founded);
}

function customFactsSectionTitle(listing: ListingDetail): string {
  switch (listing.category.id) {
    case 'find-job':
      return 'Kariyer Bilgileri';
    case 'hire':
      return 'Pozisyon Detayları';
    case 'find-partner':
      return 'Ortaklık Bilgileri';
    case 'invest':
      return 'Ek Bilgiler';
    case 'franchise':
      return 'Marka Detayları';
    case 'digital-ai':
      return 'Çözüm Detayları';
    default:
      return 'Detaylar';
  }
}

export function ListingMainContent({ listing }: ListingMainContentProps) {
  const showCareerCard =
    Boolean(listing.careerCard)
    && (listing.category.id === 'find-job' || listing.category.id === 'hire');
  const showPartnershipCard =
    Boolean(listing.partnershipCard);
  const showFranchiseCard =
    Boolean(listing.franchiseCard);
  const showInvestorCard =
    Boolean(listing.investorCard)
    && listing.category.id === 'invest';
  const showInvestment =
    !showInvestorCard
    && INVESTMENT_CATEGORIES.has(listing.category.id)
    && hasInvestmentFacts(listing);
  const showCustomFacts =
    !showCareerCard
    && !showPartnershipCard
    && !showFranchiseCard
    && !showInvestorCard
    && (listing.customFacts?.length ?? 0) > 0;
  const showCapabilities = (listing.capabilityModules?.length ?? 0) > 0;
  const showCompany =
    !showCareerCard
    && !showPartnershipCard
    && !showFranchiseCard
    && !showInvestorCard
    && hasCompanyFacts(listing)
    && listing.category.id !== 'find-investment';
  const companySectionTitle = isFranchiseBrandListing(listing)
    ? 'Marka bilgileri'
    : 'Şirket bilgileri';
  const showAttachments = listing.attachments.length > 0;
  const showTimeline = listing.timeline.length > 0;
  const isUnifiedCard = showCareerCard || showPartnershipCard || showFranchiseCard;
  const showAbout =
    !isUnifiedCard
    && !showInvestorCard
    && !isEmptyDisplayValue(listing.longDescription);
  const customFactsTitle = customFactsSectionTitle(listing);

  const coverUrl = listing.gallery[0]?.imageUrl ?? null;

  return (
    <div className={isUnifiedCard ? '' : 'space-y-8'}>
      {showCareerCard && listing.careerCard ? (
        <CareerProfilePreview
          headingAs="h1"
          data={{
            ...listing.careerCard,
            coverUrl: coverUrl ?? listing.careerCard.coverUrl,
          }}
          chrome={{
            listingId: listing.listingId,
            listingNumber: listing.listingNumber,
            publishedAt: listing.publishedAt,
            updatedAt: listing.updatedAt,
            views: listing.views,
            listingTitle: listing.title,
            identityGated: listing.identityRedacted || listing.category.id === 'find-job',
            ownerUserId: listing.ownerUserId,
          }}
        />
      ) : null}

      {showPartnershipCard && listing.partnershipCard ? (
        <PartnershipProfilePreview
          partnership={{
            ...listing.partnershipCard,
            coverUrl: coverUrl ?? listing.partnershipCard.coverUrl,
          }}
          listingId={listing.listingId}
          ownerUserId={listing.ownerUserId}
        />
      ) : null}

      {showFranchiseCard && listing.franchiseCard ? (
        <FranchiseProfilePreview
          franchise={{
            ...listing.franchiseCard,
            coverUrl: coverUrl ?? listing.franchiseCard.coverUrl,
          }}
          listingId={listing.listingId}
          ownerUserId={listing.ownerUserId}
        />
      ) : null}

      {showInvestorCard && listing.investorCard ? (
        <InvestorProfilePreview data={listing.investorCard} showTitle={false} />
      ) : null}

      {showCareerCard ? null : (
        <div className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.04] p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground">
                Girişimbee Güvenli İletişim & Gizlilik Koruması
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Bu ilanda telefon numarası ve e-posta gibi doğrudan iletişim bilgileri korunmaktadır. İlan sahibiyle güvenli iletişim talebi oluşturarak bağlantı kurabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {showAbout ? (
        <DetailSectionIf title="İlan içeriği" visible={showAbout}>
          <DetailCard>
            <h3 className="font-display text-base font-semibold text-foreground">
              {listing.title}
            </h3>
            <div className="mt-3">
              <ListingRichText content={listing.longDescription} />
            </div>
          </DetailCard>
        </DetailSectionIf>
      ) : null}

      {showInvestment ? (
        <DetailSectionIf title="Yatırım bilgileri" visible={showInvestment}>
          <DetailCard>
            <FactGrid>
              <FactRow
                label="Yatırım tutarı"
                value={listing.investment.requested}
              />
              <FactRow label="Sunulan hisse" value={listing.investment.equity} />
              <FactRow label="Aşama" value={listing.investment.stage} />
              <FactRow label="Sektörler" value={listing.investment.industry} />
              <FactRow
                label="Website"
                value={listing.investment.website}
                href={listing.investment.website}
              />
            </FactGrid>
          </DetailCard>
        </DetailSectionIf>
      ) : null}

      {showCapabilities ? (
        <DetailSectionIf title="Çözüm yetenekleri" visible={showCapabilities}>
          <DigitalAiCapabilityGrid capabilities={listing.capabilityModules ?? []} />
        </DetailSectionIf>
      ) : null}

      {showCustomFacts ? (
        <DetailSectionIf title={customFactsTitle} visible={showCustomFacts}>
          <DetailCard>
            <FactGrid>
              {listing.customFacts?.map((fact) => (
                <FactRow key={fact.label} label={fact.label} value={fact.value} />
              ))}
            </FactGrid>
          </DetailCard>
        </DetailSectionIf>
      ) : null}

      {showCompany ? (
        <DetailSectionIf title={companySectionTitle} visible={showCompany}>
          <DetailCard>
            {!isEmptyDisplayValue(listing.company.name) ? (
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted/40 text-2xl dark:bg-white/5">
                  {listing.company.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {listing.company.name}
                  </h3>
                  {!isEmptyDisplayValue(listing.company.summary) ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {listing.company.summary}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div
              className={cn(
                !isEmptyDisplayValue(listing.company.name) &&
                  'mt-5 border-t border-border/80 pt-4 dark:border-white/10',
              )}
            >
              <FactGrid>
                <FactRow label="Sektör" value={listing.company.sector ?? ''} />
                <FactRow label="Kuruluş yılı" value={listing.company.founded} />
                <FactRow label="Şube sayısı" value={listing.company.branchCount ?? ''} />
                <FactRow
                  label="Website"
                  value={listing.company.website}
                  href={listing.company.website}
                />
                <FactRow label="Çalışan sayısı" value={listing.company.employees} />
                <FactRow label="Merkez şehir" value={listing.company.city} />
              </FactGrid>
            </div>
          </DetailCard>
        </DetailSectionIf>
      ) : null}

      {showAttachments ? (
        <DetailSectionIf title="Dökümanlar" visible={showAttachments}>
          <div className="grid gap-3 sm:grid-cols-2">
            {listing.attachments.map((file) => {
              const Icon = attachmentIcons[file.type];
              const content = (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted/40 dark:bg-white/5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    {!isEmptyDisplayValue(file.meta) ? (
                      <p className="text-xs text-muted-foreground">{file.meta}</p>
                    ) : null}
                  </div>
                </>
              );
              const className = cn(
                'flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 text-left transition-all duration-200',
                'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
                'dark:border-white/10 dark:bg-card/90',
              );

              if (file.url) {
                return (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div key={file.id} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </DetailSectionIf>
      ) : null}

      {showTimeline ? (
        <DetailSectionIf title="Zaman çizelgesi" visible={showTimeline}>
          <DetailCard padding="lg">
            <ol className="relative space-y-0">
              {listing.timeline.map((event, i) => (
                <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < listing.timeline.length - 1 ? (
                    <span className="absolute left-[7px] top-4 h-full w-px bg-muted dark:bg-white/10" />
                  ) : null}
                  <span
                    className="relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-primary bg-white dark:border-white dark:bg-background"
                    style={{
                      borderColor: listing.category.accent,
                      backgroundColor:
                        i === listing.timeline.length - 1
                          ? listing.category.accent
                          : undefined,
                    }}
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs font-medium text-muted-foreground">{event.date}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{event.title}</p>
                    {!isEmptyDisplayValue(event.description) ? (
                      <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </DetailCard>
        </DetailSectionIf>
      ) : null}
    </div>
  );
}
