'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LockedContactProps {
  onUnlock?: () => void;
}

/** Blurred contact overlay with upgrade CTA — premium-only, not shown during MVP. */
export function LockedContact({ onUnlock }: LockedContactProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="space-y-1 blur-sm select-none" aria-hidden>
        <p className="text-sm font-medium text-foreground">+90 532 ••• •• 45</p>
        <p className="text-xs text-muted-foreground">mehmet@••••.com</p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 dark:bg-card/90">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-medium text-foreground">
          İletişim bilgisi kilitli
        </p>
        <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={onUnlock}>
          Kilidi Aç
        </Button>
      </div>
    </div>
  );
}
