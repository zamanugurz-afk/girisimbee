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
  ].some((value) => !isEmptyDisplayValue(value));
}

export function ListingMainContent({ listing }: ListingMainContentProps) {
  const showInvestment = INVESTMENT_CATEGORIES.has(listing.category.id) && hasInvestmentFacts(listing);
  const showCustomFacts = (listing.customFacts?.length ?? 0) > 0;
  const showCompany = hasCompanyFacts(listing);
  const showAttachments = listing.attachments.length > 0;
  const showGallery = listing.gallery.some((item) => !isEmptyDisplayValue(item.imageUrl));
  const showTimeline = listing.timeline.length > 0;
  const showAbout = !isEmptyDisplayValue(listing.longDescription);

  const customFactsTitle =
    listing.category.id === 'find-job' || listing.category.id === 'hire'
      ? 'Kariyer Bilgileri'
      : listing.category.id === 'find-partner'
        ? 'Ortaklık Bilgileri'
        : 'Detaylar';

  return (
    <div className="space-y-10">
      {showAbout && (
        <DetailSectionIf title="Hakkında" visible={showAbout}>
          <DetailCard>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
              {listing.longDescription}
            </p>
          </DetailCard>
        </DetailSectionIf>
      )}

      {showInvestment && (
        <DetailSectionIf title="Yatırım Bilgileri" visible={showInvestment}>
          <DetailCard>
            <FactGrid>
              <FactRow label="Aranan yatırım" value={listing.investment.requested} />
              <FactRow label="Sunulan hisse" value={listing.investment.equity} />
              <FactRow label="Aşama" value={listing.investment.stage} />
              <FactRow label="Sektör" value={listing.investment.industry} />
              <FactRow label="Şirket yaşı" value={listing.investment.companyAge} />
              <FactRow
                label="Website"
                value={listing.investment.website}
                href={listing.investment.website}
              />
            </FactGrid>
          </DetailCard>
        </DetailSectionIf>
      )}

      {showCustomFacts && (
        <DetailSectionIf title={customFactsTitle} visible={showCustomFacts}>
          <DetailCard>
            <FactGrid>
              {listing.customFacts?.map((fact) => (
                <FactRow key={fact.label} label={fact.label} value={fact.value} />
              ))}
            </FactGrid>
          </DetailCard>
        </DetailSectionIf>
      )}

      {showCompany && (
        <DetailSectionIf title="Şirket Bilgileri" visible={showCompany}>
          <DetailCard>
            {!isEmptyDisplayValue(listing.company.name) && (
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted/40 text-2xl dark:bg-white/5">
                  {listing.company.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {listing.company.name}
                  </h3>
                  {!isEmptyDisplayValue(listing.company.summary) && (
                    <p className="mt-1 text-sm text-muted-foreground">{listing.company.summary}</p>
                  )}
                </div>
              </div>
            )}
            <div className={cn(!isEmptyDisplayValue(listing.company.name) && 'mt-5 border-t border-border/80 pt-4 dark:border-white/10')}>
              <FactGrid>
                <FactRow label="Şehir" value={listing.company.city} />
                <FactRow
                  label="Website"
                  value={listing.company.website}
                  href={listing.company.website}
                />
                <FactRow label="Çalışan sayısı" value={listing.company.employees} />
                <FactRow label="Kuruluş" value={listing.company.founded} />
              </FactGrid>
            </div>
          </DetailCard>
        </DetailSectionIf>
      )}

      {showAttachments && (
        <DetailSectionIf title="Dökümanlar" visible={showAttachments}>
          <div className="grid gap-3 sm:grid-cols-2">
            {listing.attachments.map((file) => {
              const Icon = attachmentIcons[file.type];
              return (
                <button
                  key={file.id}
                  type="button"
                  className={cn(
                    'flex items-center gap-3 rounded-[24px] border border-border/80 bg-white p-4 text-left transition-colors',
                    'hover:gc-shadow-soft dark:border-white/10 dark:bg-card/90',
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/40 dark:bg-white/5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    {!isEmptyDisplayValue(file.meta) && (
                      <p className="text-xs text-muted-foreground">{file.meta}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </DetailSectionIf>
      )}

      {showGallery && (
        <DetailSectionIf title="Galeri" visible={showGallery}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {listing.gallery.map((item) => (
              !isEmptyDisplayValue(item.imageUrl) ? (
                <div
                  key={item.id}
                  className="flex aspect-[4/3] flex-col overflow-hidden rounded-[24px] border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    className="h-full w-full object-cover"
                  />
                  <p className="truncate px-2 py-1.5 text-xs font-medium text-muted-foreground">{item.label}</p>
                </div>
              ) : null
            ))}
          </div>
        </DetailSectionIf>
      )}

      {showTimeline && (
        <DetailSectionIf title="Zaman Çizelgesi" visible={showTimeline}>
          <DetailCard padding="lg">
            <ol className="relative space-y-0">
              {listing.timeline.map((event, i) => (
                <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < listing.timeline.length - 1 && (
                    <span className="absolute left-[7px] top-4 h-full w-px bg-muted dark:bg-white/10" />
                  )}
                  <span
                    className="relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-primary bg-white dark:border-white dark:bg-background"
                    style={{ borderColor: listing.category.accent, backgroundColor: i === listing.timeline.length - 1 ? listing.category.accent : undefined }}
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs font-medium text-muted-foreground">{event.date}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {event.title}
                    </p>
                    {!isEmptyDisplayValue(event.description) && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </DetailCard>
        </DetailSectionIf>
      )}
    </div>
  );
}
