'use client';

import { Phone } from 'lucide-react';
import { ListingCallButton, formatListingPhoneDisplay } from '@/components/girisimco/listing/listing-call-button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { cn } from '@/lib/utils';

function maskPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)} ••• •• ${digits.slice(-2)}`;
}

export interface ListingContactPhoneProps {
  phone?: string | null;
  /** Compact meta-row style vs sidebar card */
  variant?: 'hero' | 'sidebar' | 'inline';
  className?: string;
  /** Hide call CTA (e.g. owner viewing own listing) */
  hideCallButton?: boolean;
}

/**
 * Positions membership/profile phone on listing detail surfaces.
 * Source of truth: owner profile phone copied at publish (with profile fallback in mapper).
 */
export function ListingContactPhone({
  phone,
  variant = 'hero',
  className,
  hideCallButton,
}: ListingContactPhoneProps) {
  const { isAuthenticated } = useAuth();
  const display = formatListingPhoneDisplay(phone);
  const visibleNumber = display
    ? isAuthenticated
      ? display
      : maskPhoneDisplay(display)
    : null;

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
          <Phone className="h-4 w-4 text-primary" aria-hidden />
          {visibleNumber ?? 'Telefon paylaşılmamış'}
        </span>
        {!hideCallButton ? (
          <ListingCallButton phone={phone} size="sm" className="rounded-xl" />
        ) : null}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div
        className={cn(
          'rounded-2xl border border-border/80 bg-card p-4 shadow-sm dark:border-white/10',
          className,
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          İletişim
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Üyelik telefonu — yalnızca arama ile iletişim
        </p>
        <p className="mt-3 flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground">
          <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          {visibleNumber ?? 'Belirtilmemiş'}
        </p>
        {!hideCallButton ? (
          <div className="mt-3">
            <ListingCallButton phone={phone} fullWidth className="rounded-2xl" />
          </div>
        ) : null}
      </div>
    );
  }

  // hero — sits under title/short description on listing detail
  return (
    <div
      className={cn(
        'mt-5 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 dark:border-primary/30 dark:bg-primary/10',
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
            İletişim telefonu
          </p>
          <p className="mt-1 flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-foreground">
            <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{visibleNumber ?? 'Telefon paylaşılmamış'}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            İlan sahibinin üyelik telefon numarası
          </p>
        </div>
        {!hideCallButton ? (
          <ListingCallButton
            phone={phone}
            className="h-11 shrink-0 rounded-2xl px-5 sm:min-w-[8.5rem]"
            label={visibleNumber && isAuthenticated ? 'Ara' : undefined}
          />
        ) : null}
      </div>
    </div>
  );
}
