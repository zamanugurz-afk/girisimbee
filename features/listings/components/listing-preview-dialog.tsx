'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { ListingFormValues } from '@/features/listings/form/dynamic-listing-form';
import type { ListingType } from '@/features/listings/types/listing-type.types';

interface ListingPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: ListingFormValues;
  listingType: ListingType;
}

export function ListingPreviewDialog({
  open,
  onOpenChange,
  values,
  listingType,
}: ListingPreviewDialogProps) {
  const sortedImages = useMemo(
    () =>
      [...values.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [values.images],
  );

  const coverUrl = sortedImages[0]?.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>İlan Önizleme</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {coverUrl ? (
            <div className="overflow-hidden rounded-xl border border-border/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt={values.core.title || 'Kapak görseli'} className="aspect-[16/9] w-full object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/40 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]">
              Kapak görseli yok
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{listingType.name}</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
              {values.core.title || 'Başlıksız ilan'}
            </h2>
            {values.core.shortDescription && (
              <p className="mt-2 text-sm text-muted-foreground">{values.core.shortDescription}</p>
            )}
          </div>

          {(values.core.city || values.core.location) && (
            <p className="text-sm text-muted-foreground">
              {[values.core.city, values.core.location, values.core.country === 'TR' ? 'Türkiye' : values.core.country]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}

          {values.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {values.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {values.core.longDescription && (
            <div className="rounded-xl border border-border/80 p-4 dark:border-white/10">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Açıklama</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {values.core.longDescription}
              </p>
            </div>
          )}

          {sortedImages.length > 1 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Galeri</h3>
              <div className="grid grid-cols-3 gap-2">
                {sortedImages.slice(1).map((img, index) => (
                  <div key={`${img.url}-${index}`} className="overflow-hidden rounded-lg border border-border/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? `Görsel ${index + 2}`} className="aspect-[4/3] w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
