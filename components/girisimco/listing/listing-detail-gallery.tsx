'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import type { ListingDetail } from '@/features/listings';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';
import { cn } from '@/lib/utils';

export function ListingDetailGallery({ listing }: { listing: ListingDetail }) {
  const images = listing.gallery.filter((item) => !isEmptyDisplayValue(item.imageUrl));
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/30 text-muted-foreground dark:border-white/10">
        <ImageIcon className="h-10 w-10 opacity-50" aria-hidden />
        <p className="text-sm">Görsel eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-sm dark:border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.imageUrl}
          alt={active.label || listing.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {images.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'overflow-hidden rounded-2xl border transition-all duration-200',
                index === activeIndex
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border/80 opacity-80 hover:opacity-100 dark:border-white/10',
              )}
              aria-label={`Görsel ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.label}
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
