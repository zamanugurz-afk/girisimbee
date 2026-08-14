'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { GcTag } from '@/components/girisimco/ui/gc-tag';
import { getListingTagGroups } from '@/features/listings/config/listing-tag-options.config';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import type { ListingType } from '@/features/listings/types/listing-type.types';

import { cn } from '@/lib/utils';
import { isEmptyDisplayValue, toDisplayValue } from '@/features/listings/utils/display-value';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import {
  formatMoney,
  formatPercentage,
  formatSupportFlags,
  formatBoolean,
} from '@/features/franchise/lib/franchise-listing.mapper';
import { resolveDigitalAiCapabilities } from '@/features/listings/config/digital-ai-capabilities';
import { DigitalAiCapabilityGrid } from '@/components/girisimco/listing/digital-ai-capability-grid';
import { ListingRichText } from '@/components/girisimco/listing/listing-rich-text';

const REMOTE_LABELS: Record<string, string> = {
  onsite: 'Ofis',
  hybrid: 'Hibrit',
  remote: 'Uzaktan',
};

interface ListingFormPreviewContentProps {
  values: ListingFormValues;
  listingType: ListingType;
  readOnly?: boolean;
}

function PreviewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs font-medium text-muted-foreground sm:w-40">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function ListingFormPreviewContent({ values, listingType, readOnly }: ListingFormPreviewContentProps) {
  const sortedImages = useMemo(
    () => [...values.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [values.images],
  );

  const coverUrl = sortedImages[0]?.url;
  const fieldLabels = useMemo(
    () => new Map(listingType.fieldSchema.fields.map((f) => [f.key, f.label])),
    [listingType.fieldSchema],
  );

  const customEntries = Object.entries(values.customFields).filter(
    ([key, val]) =>
      !['kvkkConsents', 'capabilities', 'investmentAiAnalysis', 'careerAiAnalysis'].includes(key)
      && !isEmptyDisplayValue(val),
  );

  const isFranchiseGive = listingType.categoryId === CATEGORY_IDS.bayilikAl;
  const capabilityModules =
    listingType.categoryId === CATEGORY_IDS.dijitalAi
      ? resolveDigitalAiCapabilities(values.customFields.capabilities)
      : [];

  function formatPreviewValue(key: string, val: unknown): string {
    if (isFranchiseGive) {
      if (['entryFee', 'franchiseFee', 'totalInvestment', 'minCapitalRequirement'].includes(key)) {
        return formatMoney(typeof val === 'number' ? val : Number(val));
      }
      if (['royaltyFee', 'advertisingFee', 'profitMargin'].includes(key)) {
        return formatPercentage(typeof val === 'number' ? val : Number(val));
      }
      if (key === 'minSquareMeters') {
        const num = typeof val === 'number' ? val : Number(val);
        return Number.isFinite(num) ? `${num} m²` : toDisplayValue(val);
      }
      if (['mallAvailable', 'streetStoreAvailable', 'companyEstablishmentRequired', 'trainingSupport', 'operationalSupport', 'marketingSupport'].includes(key)) {
        return formatBoolean(typeof val === 'boolean' ? val : Boolean(val));
      }
      if (key === 'availableCities' && Array.isArray(val)) {
        return val.join(', ');
      }
    }
    return toDisplayValue(val);
  }

  const tagGroups = useMemo(
    () => getListingTagGroups(listingType.categoryId),
    [listingType.categoryId],
  );

  const knownTagOptions = useMemo(
    () => new Set(tagGroups.flatMap((group) => [...group.options])),
    [tagGroups],
  );

  const legacyTags = useMemo(
    () => values.tags.filter((tag) => !knownTagOptions.has(tag)),
    [values.tags, knownTagOptions],
  );

  return (
    <div
      className={cn('space-y-6', readOnly && 'pointer-events-none select-none')}
      aria-readonly={readOnly || undefined}
    >
      {coverUrl ? (
        <div className="overflow-hidden rounded-xl border border-border/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={values.core.title || 'Kapak görseli'}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/40 text-sm text-muted-foreground">
          Kapak görseli yok
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{listingType.name}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
          {values.core.title || 'Başlıksız ilan'}
        </h2>
        {values.core.shortDescription && (
          <p className="mt-2 text-sm text-muted-foreground">{values.core.shortDescription}</p>
        )}
      </div>

      <dl className="space-y-3 rounded-xl border border-border/80 p-4 dark:border-white/10">
        <PreviewRow label="Şehir" value={values.core.city} />
        <PreviewRow
          label="Çalışma modeli"
          value={values.core.remotePolicy ? REMOTE_LABELS[values.core.remotePolicy] : null}
        />
        {customEntries.map(([key, val]) => (
          <PreviewRow
            key={key}
            label={fieldLabels.get(key) ?? key}
            value={formatPreviewValue(key, val)}
          />
        ))}
        <PreviewRow label="Özgeçmiş" value={values.cvUrl ? 'Yüklendi' : null} />
      </dl>

      {capabilityModules.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Çözüm yetenekleri</h3>
          <DigitalAiCapabilityGrid capabilities={capabilityModules} />
        </div>
      ) : null}

      {values.tags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Etiketler</h3>
          {tagGroups.map((group) => {
            const selected = group.options.filter((option) => values.tags.includes(option));
            if (selected.length === 0) return null;
            return (
              <div key={group.id}>
                <p className="mb-2 text-gc-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((tag) => (
                    <GcTag key={tag} variant="default" size="md">
                      {tag}
                    </GcTag>
                  ))}
                </div>
              </div>
            );
          })}
          {legacyTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {legacyTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {values.core.longDescription && (
        <div className="rounded-xl border border-border/80 p-4 dark:border-white/10">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            {listingType.categoryId === CATEGORY_IDS.isBul ? 'Kariyer özeti önerisi' : 'Detaylı Açıklama'}
          </h3>
          <ListingRichText
            content={values.core.longDescription}
            className="text-sm"
          />
        </div>
      )}

      {sortedImages.length > 1 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Galeri</h3>
          <div className="grid grid-cols-3 gap-2">
            {sortedImages.slice(1).map((img, index) => (
              <div key={`${img.url}-${index}`} className="overflow-hidden rounded-lg border border-border/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? `Görsel ${index + 2}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
