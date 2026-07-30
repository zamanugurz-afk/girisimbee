'use client';

import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePromptProps {
  title?: string;
  description?: string;
}

/** Inline upsell banner — only rendered via PremiumGate during monetization phase. */
export function UpgradePrompt({
  title = 'Daha fazla eşleşme için Premium',
  description = 'Sınırsız mesaj, öncelikli listeleme ve doğrulanmış rozet.',
}: UpgradePromptProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.03]">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Button size="sm" className="shrink-0 rounded-lg bg-primary dark:bg-white dark:text-primary-foreground">
        Yükselt
        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
