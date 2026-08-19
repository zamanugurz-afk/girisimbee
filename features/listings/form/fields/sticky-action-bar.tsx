'use client';

import { ArrowLeft, ArrowRight, Cloud, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StickyActionBarProps {
  currentStepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  nextButtonLabel?: string;
  lastAutoSaved?: Date | null;
  showBack?: boolean;
}

export function StickyActionBar({
  currentStepIndex,
  totalSteps,
  onBack,
  onNext,
  isNextDisabled = false,
  isSubmitting = false,
  nextButtonLabel,
  lastAutoSaved,
  showBack = true,
}: StickyActionBarProps) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex >= totalSteps - 1;

  const defaultNextLabel = isLastStep ? 'İlanı Yayınla' : 'Devam Et';
  const label = nextButtonLabel || defaultNextLabel;

  return (
    <div className="sticky bottom-0 z-20 mt-8 -mx-6 -mb-8 border-t border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/95 sm:-mx-8 sm:-mb-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Back Button */}
        <div>
          {showBack && !isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="h-11 gap-1.5 rounded-xl border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Geri</span>
            </Button>
          )}
        </div>

        {/* Center / Autosave Indicator */}
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          {lastAutoSaved ? (
            <>
              <Cloud className="h-3.5 w-3.5 text-emerald-500" />
              <span>Taslak otomatik kaydedildi</span>
            </>
          ) : (
            <span className="text-muted-foreground/60">
              Adım {currentStepIndex + 1} / {totalSteps}
            </span>
          )}
        </div>

        {/* Next / Submit Button */}
        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="h-11 min-w-[140px] gap-2 rounded-xl bg-amber-500 px-6 font-display font-semibold text-slate-950 shadow-sm transition-all hover:bg-amber-400 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Kaydediliyor…</span>
            </>
          ) : (
            <>
              <span>{label}</span>
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
