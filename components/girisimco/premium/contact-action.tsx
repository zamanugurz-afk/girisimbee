'use client';

import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { isPremiumEnabled } from '@/features/shared';
import { LockedContact } from '@/components/girisimco/premium/locked-contact';
import { cn } from '@/lib/utils';

interface ContactActionProps {
  variant: 'profile' | 'detail' | 'message';
  className?: string;
}

/**
 * Unified contact entry point.
 * MVP: always open, direct action.
 * Premium phase: can gate behind LockedContact / upgrade flow.
 */
export function ContactAction({ variant, className }: ContactActionProps) {
  if (isPremiumEnabled()) {
    return <LockedContact />;
  }

  const labels = {
    profile: 'İletişim',
    detail: 'Detay',
    message: 'Mesaj Gönder',
  } as const;

  const Icon = variant === 'message' ? MessageCircle : ArrowUpRight;

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground dark:group-hover:text-white',
        className,
      )}
    >
      {labels[variant]}
      <Icon className="h-3 w-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
    </button>
  );
}
