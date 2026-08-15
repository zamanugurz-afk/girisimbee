'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, UserRoundSearch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CAREER_FLOW_OPTIONS } from '@/components/girisimco/home/home-marketplace.data';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';
import { cn } from '@/lib/utils';

interface CareerFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FLOW_VISUAL = {
  seek: {
    color: JOB_SEEKER_CARD_COLOR,
    Icon: UserRoundSearch,
  },
  hire: {
    color: JOB_HIRE_CARD_COLOR,
    Icon: Briefcase,
  },
} as const;

export function CareerFlowDialog({ open, onOpenChange }: CareerFlowDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kariyer ve İş Fırsatları</DialogTitle>
          <DialogDescription>
            İş mi arıyorsunuz, yoksa çalışan mı? Size uygun yolu seçin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAREER_FLOW_OPTIONS.map((option) => {
            const visual = FLOW_VISUAL[option.id];
            const Icon = visual.Icon;
            return (
              <Link
                key={option.id}
                href={option.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'group flex h-full flex-col rounded-2xl border border-[#E6E8EE] bg-white p-4',
                  'transition duration-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20',
                  'dark:border-border dark:bg-card',
                )}
                style={{ borderColor: `${visual.color}33` }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: visual.color }}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="mt-3 font-display text-base font-bold leading-snug text-[#0B1220] dark:text-foreground">
                  {option.label}
                </span>
                <span className="mt-1.5 text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                  {option.description}
                </span>
                <span
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold"
                  style={{ color: visual.color }}
                >
                  Devam et
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
