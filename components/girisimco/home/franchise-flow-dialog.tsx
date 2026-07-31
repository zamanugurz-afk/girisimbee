'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FRANCHISE_FLOW_ROUTES } from '@/components/girisimco/home/home-marketplace.data';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface FranchiseFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FLOW_OPTIONS = [
  {
    href: FRANCHISE_FLOW_ROUTES.buy,
    label: 'Bayilik Al',
    description: 'Franchise fırsatlarını keşfedin ve başvurun.',
  },
  {
    href: FRANCHISE_FLOW_ROUTES.give,
    label: 'Bayilik Ver',
    description: 'Markanızı franchise olarak büyütün.',
  },
] as const;

export function FranchiseFlowDialog({ open, onOpenChange }: FranchiseFlowDialogProps) {
  const accent = GC_CATEGORY_COLORS.franchise;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Franchise</DialogTitle>
          <DialogDescription>Size uygun franchise yolunu seçin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2.5">
          {FLOW_OPTIONS.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                'group flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5',
                'transition-all duration-200 hover:border-[#EC4899]/35 hover:shadow-md',
              )}
            >
              <div>
                <p className="font-display text-gc-base font-semibold text-foreground">{option.label}</p>
                <p className="mt-0.5 text-gc-sm text-muted-foreground">{option.description}</p>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: accent }}
              />
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
