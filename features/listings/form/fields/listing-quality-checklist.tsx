'use client';

import { CheckCircle2, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/90 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h4 className="font-display text-sm font-bold text-foreground">
            İlan Kalite & Eşleşme Kontrolü
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
