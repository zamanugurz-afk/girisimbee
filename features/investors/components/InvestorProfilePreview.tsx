'use client';

import { DetailCard, FactGrid, FactRow } from '@/components/girisimco/listing/detail-primitives';
import { ListingRichText } from '@/components/girisimco/listing/listing-rich-text';
import type { InvestorCardData } from '@/features/investors/lib/investor-card';
import { formatChipLine, limitChips } from '@/features/investors/lib/investor-card';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5">
      {children}
    </span>
  );
}

function ChipRow({ values, extraLabel }: { values: string[]; extraLabel?: string }) {
  const { shown, extra } = limitChips(values, 3);
  if (!shown.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((chip) => (
        <Chip key={chip}>{chip}</Chip>
      ))}
      {extra > 0 ? <Chip>{extraLabel ?? `+${extra}`}</Chip> : null}
    </div>
  );
}

export function InvestorProfilePreview({
  data,
  showTitle = true,
  headingAs: Heading = 'h2',
}: {
  data: InvestorCardData;
  showTitle?: boolean;
  headingAs?: 'h1' | 'h2';
}) {
  const modelLine = formatChipLine([...data.businessModels, ...data.targetCustomers], 3);
  const tractionLine = [data.revenueExpectation, data.tractionExpectation]
    .filter((value): value is string => Boolean(value && !isEmptyDisplayValue(value)))
    .join(' · ');

  return (
    <div className="space-y-5">
      {showTitle && data.displayName ? (
        <div className="space-y-1">
          <Heading className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {data.displayName}
          </Heading>
          {data.investorType ? (
            <p className="text-sm text-muted-foreground">{data.investorType}</p>
          ) : null}
        </div>
      ) : null}

      {!showTitle && data.investorType ? (
        <p className="text-sm font-medium text-foreground">{data.investorType}</p>
      ) : null}

      {data.ticket ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Yatırım bileti</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{data.ticket}</p>
        </div>
      ) : null}

      {data.sectors.length > 0 || data.stages.length > 0 ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Odak</h3>
          <div className="mt-3 space-y-3">
            {data.sectors.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Sektörler</p>
                <ChipRow values={data.sectors} />
              </div>
            ) : null}
            {data.stages.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Aşamalar</p>
                <ChipRow values={data.stages} />
              </div>
            ) : null}
          </div>
        </DetailCard>
      ) : null}

      {!isEmptyDisplayValue(data.summary) ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Yatırımcı özeti</h3>
          <div className="mt-2">
            <ListingRichText content={data.summary} className="text-sm leading-relaxed" />
          </div>
        </DetailCard>
      ) : null}

      {data.thesis ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Yatırım tezi</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{data.thesis}</p>
        </DetailCard>
      ) : null}

      {data.geographies.length > 0 || modelLine || tractionLine ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Kriterler</h3>
          <div className="mt-3">
            <FactGrid>
              <FactRow label="Coğrafya" value={formatChipLine(data.geographies, 3) ?? ''} />
              <FactRow label="Model / müşteri" value={modelLine ?? ''} />
              <FactRow label="Gelir / traction" value={tractionLine} />
            </FactGrid>
          </div>
        </DetailCard>
      ) : null}

      {data.highlights.length > 0 ? (
        <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
          {data.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
