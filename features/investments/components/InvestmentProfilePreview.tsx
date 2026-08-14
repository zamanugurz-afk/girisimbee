'use client';

import { MapPin } from 'lucide-react';
import { DetailCard, FactGrid, FactRow } from '@/components/girisimco/listing/detail-primitives';
import { ListingRichText } from '@/components/girisimco/listing/listing-rich-text';
import type { InvestmentCardData } from '@/features/investments/lib/investment-card';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';
import { cn } from '@/lib/utils';

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5">
      {children}
    </span>
  );
}

export function InvestmentProfilePreview({
  data,
  showTitle = true,
  headingAs: Heading = 'h2',
}: {
  data: InvestmentCardData;
  showTitle?: boolean;
  headingAs?: 'h1' | 'h2';
}) {
  const chips = [data.sector, data.stage, data.productStatus].filter(
    (value): value is string => Boolean(value && !isEmptyDisplayValue(value)),
  );

  return (
    <div className="space-y-5">
      {showTitle && data.startupName ? (
        <div className="space-y-2">
          <Heading className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {data.startupName}
          </Heading>
          {data.productName && data.productName !== data.startupName ? (
            <p className="text-sm text-muted-foreground">{data.productName}</p>
          ) : null}
        </div>
      ) : null}

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </div>
      ) : null}

      {!isEmptyDisplayValue(data.summary) ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Girişim özeti</h3>
          <div className="mt-2">
            <ListingRichText content={data.summary} className="text-sm leading-relaxed" />
          </div>
        </DetailCard>
      ) : null}

      {data.fundingAmount || data.equityOffered ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.fundingAmount ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Aranan yatırım</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{data.fundingAmount}</p>
            </div>
          ) : null}
          {data.equityOffered ? (
            <div className="rounded-2xl border border-border/80 bg-muted/20 px-4 py-3 dark:border-white/10">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Teklif edilen hisse</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{data.equityOffered}</p>
              {data.valuation ? (
                <p className="mt-1 text-xs text-muted-foreground">Değerleme: {data.valuation}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {data.revenueStatus || data.tractionStatus || data.tractionMetrics.length > 0 ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Mevcut durum / traction</h3>
          <div className="mt-3">
            <FactGrid>
              <FactRow label="Gelir" value={data.revenueStatus ?? ''} />
              <FactRow label="Müşteri" value={data.tractionStatus ?? ''} />
              {data.tractionMetrics.map((metric) => (
                <FactRow key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </FactGrid>
          </div>
        </DetailCard>
      ) : null}

      {data.businessModel || data.targetCustomer || data.useOfFunds ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Model ve kullanım</h3>
          <div className="mt-3">
            <FactGrid>
              <FactRow label="İş modeli" value={data.businessModel ?? ''} />
              <FactRow label="Hedef müşteri" value={data.targetCustomer ?? ''} />
              <FactRow label="Yatırım kullanımı" value={data.useOfFunds ?? ''} />
              <FactRow label="Kullanım detayı" value={data.useOfFundsDetail ?? ''} />
            </FactGrid>
          </div>
        </DetailCard>
      ) : null}

      {data.differentiation ? (
        <DetailCard>
          <h3 className="text-sm font-semibold text-foreground">Rekabet avantajı</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{data.differentiation}</p>
        </DetailCard>
      ) : null}

      <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground')}>
        {data.team ? <p>Ekip: {data.team}</p> : null}
        {data.city ? (
          <p className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {data.city}
          </p>
        ) : null}
      </div>
    </div>
  );
}
