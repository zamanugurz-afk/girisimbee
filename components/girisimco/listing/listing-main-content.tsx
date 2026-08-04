import { FileText, Link2, Play } from 'lucide-react';
import {
  DetailCard,
  DetailSectionIf,
  FactGrid,
  FactRow,
} from '@/components/girisimco/listing/detail-primitives';
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

const INVESTMENT_CATEGORIES = new Set(['find-investment', 'invest']);

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
    case 'find-investment':
    case 'invest':
      return 'Ek Bilgiler';
    case 'franchise':
      return 'Marka Detayları';
    default:
      return 'Detaylar';
  }
}

export function ListingMainContent({ listing }: ListingMainContentProps) {
  const showInvestment = INVESTMENT_CATEGORIES.has(listing.category.id) && hasInvestmentFacts(listing);
  const showCustomFacts = (listing.customFacts?.length ?? 0) > 0;
  const showCompany = hasCompanyFacts(listing) && listing.category.id !== 'find-investment';
  const companySectionTitle = isFranchiseBrandListing(listing)
    ? 'Marka bilgileri'
    : 'Şirket bilgileri';
  const showAttachments = listing.attachments.length > 0;
  const showTimeline = listing.timeline.length > 0;
  const showAbout = !isEmptyDisplayValue(listing.longDescription);
  const customFactsTitle = customFactsSectionTitle(listing);
  const isSeekingInvestment = listing.category.id === 'find-investment';

  return (
    <div className="space-y-8">
      {showAbout ? (
        <DetailSectionIf title="İlan içeriği" visible={showAbout}>
          <DetailCard>
            <h3 className="font-display text-base font-semibold text-foreground">
              {listing.title}
            </h3>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
              {listing.longDescription}
            </p>
          </DetailCard>
        </DetailSectionIf>
      ) : null}

      {showInvestment ? (
        <DetailSectionIf title="Yatırım bilgileri" visible={showInvestment}>
          <DetailCard>
            <FactGrid>
              <FactRow
                label={isSeekingInvestment ? 'Aranan yatırım' : 'Yatırım tutarı'}
                value={listing.investment.requested}
              />
              <FactRow label="Sunulan hisse" value={listing.investment.equity} />
              <FactRow label="Aşama" value={listing.investment.stage} />
              {isSeekingInvestment ? (
                <FactRow label="Fon kullanımı" value={listing.investment.useOfFunds} />
              ) : (
                <FactRow label="Sektörler" value={listing.investment.industry} />
              )}
              {!isSeekingInvestment ? (
                <FactRow
                  label="Website"
                  value={listing.investment.website}
                  href={listing.investment.website}
                />
              ) : null}
            </FactGrid>
          </DetailCard>
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
                <FactRow label="Sektör" value={listing.company.sector} />
                <FactRow label="Kuruluş yılı" value={listing.company.founded} />
                <FactRow label="Şube sayısı" value={listing.company.branchCount} />
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
