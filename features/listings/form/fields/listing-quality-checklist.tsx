'use client';

import { CheckCircle2, AlertTriangle, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getListingCategoryTheme } from '@/features/listings/config/listing-form-theme.config';

export interface QualityCheckItem {
  id: string;
  label: string;
  isComplete: boolean;
  isRequired?: boolean;
  stepIndex?: number;
  hint?: string;
}

export interface ListingQualityChecklistProps {
  items: QualityCheckItem[];
  onNavigateToStep?: (stepIndex: number) => void;
  className?: string;
}

export function ListingQualityChecklist({
  items,
  onNavigateToStep,
  className = '',
}: ListingQualityChecklistProps) {
  const completedCount = items.filter((i) => i.isComplete).length;
  const totalCount = items.length;
  const isAllComplete = completedCount === totalCount;

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-white p-5 shadow-xs dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h4 className="font-display text-sm font-bold text-foreground">
            İlan Kalite & Eşleşme
          </h4>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-slate-300">
          {completedCount} / {totalCount} Tamamlandı
        </span>
      </div>

      <div className="mt-3.5 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.stepIndex !== undefined && onNavigateToStep) {
                onNavigateToStep(item.stepIndex);
              }
            }}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
              item.stepIndex !== undefined && onNavigateToStep ? 'cursor-pointer hover:bg-muted/40' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              {item.isComplete ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : item.isRequired ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span
                className={
                  item.isComplete
                    ? 'text-slate-700 dark:text-slate-300'
                    : item.isRequired
                      ? 'font-medium text-rose-700 dark:text-rose-400'
                      : 'text-amber-700 dark:text-amber-400'
                }
              >
                {item.label}
              </span>
            </div>

            {item.stepIndex !== undefined && onNavigateToStep && !item.isComplete && (
              <span className="inline-flex items-center text-[11px] font-medium text-primary">
                <span>Tamamla</span>
                <ChevronRight className="h-3 w-3" />
              </span>
            )}
          </div>
        ))}
      </div>

      {isAllComplete && (
        <div className="mt-3 rounded-xl bg-emerald-50/80 p-2.5 text-center text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✨ İlanınız yayına hazır ve yüksek eşleşme puanına sahip!
        </div>
      )}
    </div>
  );
}

export interface ListingProgressStatusProps {
  currentStepIndex: number;
  totalSteps: number;
  steps: { id: string; title: string }[];
  categoryId?: string | null;
  onNavigateToStep?: (stepIndex: number) => void;
  className?: string;
}

export function ListingProgressStatus({
  currentStepIndex,
  totalSteps,
  steps,
  categoryId,
  onNavigateToStep,
  className = '',
}: ListingProgressStatusProps) {
  const percentage = Math.round(((currentStepIndex + 1) / Math.max(1, totalSteps)) * 100);
  const theme = getListingCategoryTheme(categoryId);

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-white p-5 shadow-xs dark:bg-zinc-900 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-bold text-foreground">
          İlerleme Durumu
        </h4>
        <span className={`text-xs font-bold ${theme.progressText}`}>
          %{percentage} tamamlandı
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className={`h-full rounded-full ${theme.progressBarBg} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-2 pt-1">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (onNavigateToStep && isPast) {
                  onNavigateToStep(idx);
                }
              }}
              className={`flex items-center gap-2.5 text-xs transition-colors ${
                isPast ? 'cursor-pointer hover:text-foreground' : ''
              } ${
                isCurrent
                  ? 'font-semibold text-foreground'
                  : isPast
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/60'
              }`}
            >
              {isPast ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-2.5 w-2.5" />
                </div>
              ) : isCurrent ? (
                <div className={`flex h-4 w-4 items-center justify-center rounded-full ${theme.progressActiveBg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${theme.progressActiveDot}`} />
                </div>
              ) : (
                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-border/80 text-muted-foreground/60">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                </div>
              )}
              <span className="truncate">0{idx + 1} {step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
