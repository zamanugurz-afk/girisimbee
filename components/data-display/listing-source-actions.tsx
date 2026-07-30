'use client';

import type { MouseEvent, ReactNode } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  hasListingSourceUrl,
  openListingSource,
  type ListingSourceLike,
} from '@/lib/listing-source';

interface ListingSourceIconButtonProps {
  listing: ListingSourceLike;
  className?: string;
  iconClassName?: string;
  'aria-label'?: string;
}

export function ListingSourceIconButton({
  listing,
  className,
  iconClassName = 'h-3.5 w-3.5',
  'aria-label': ariaLabel = 'Kaynağı aç',
}: ListingSourceIconButtonProps) {
  const hasUrl = hasListingSourceUrl(listing);

  if (!hasUrl) {
    return (
      <button
        type="button"
        disabled
        title="Kaynak linki yok"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex items-center justify-center rounded-md text-muted-foreground opacity-50 cursor-not-allowed',
          className,
        )}
        aria-label="Kaynak linki yok"
      >
        <ExternalLink className={iconClassName} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openListingSource(listing);
      }}
      className={className}
      aria-label={ariaLabel}
    >
      <ExternalLink className={iconClassName} />
    </button>
  );
}

interface ListingSourceTextButtonProps {
  listing: ListingSourceLike;
  label: string;
  className?: string;
  icon?: ReactNode;
  trailingIcon?: 'external' | 'arrow' | 'none';
}

export function ListingSourceTextButton({
  listing,
  label,
  className,
  icon,
  trailingIcon = 'external',
}: ListingSourceTextButtonProps) {
  const hasUrl = hasListingSourceUrl(listing);

  if (!hasUrl) {
    return (
      <button
        type="button"
        disabled
        onClick={(e) => e.stopPropagation()}
        className={cn(className, 'cursor-not-allowed opacity-50')}
      >
        Kaynak linki yok
      </button>
    );
  }

  const TrailingIcon =
    trailingIcon === 'arrow' ? ArrowRight : trailingIcon === 'external' ? ExternalLink : null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openListingSource(listing);
      }}
      className={className}
    >
      {icon}
      {label}
      {TrailingIcon ? <TrailingIcon className="h-3 w-3" /> : null}
    </button>
  );
}

export function handleListingRowClick(
  listing: ListingSourceLike,
  e?: MouseEvent,
): void {
  e?.stopPropagation();
  openListingSource(listing);
}
