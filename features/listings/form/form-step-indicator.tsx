'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormStepIndicatorProps {
  steps: { id: string; title: string }[];
  currentIndex: number;
  className?: string;
}

export function FormStepIndicator({ steps, currentIndex, className }: FormStepIndicatorProps) {
  const total = steps.length;
  const progressPct = total <= 1 ? 100 : Math.round((currentIndex / (total - 1)) * 100);
  const currentTitle = steps[currentIndex]?.title ?? '';

  return (
    <nav aria-label="Form adımları" className={cn('w-full', className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-gc-xs font-medium text-muted-foreground">
          Adım {currentIndex + 1} / {total}
        </p>
        <p className="truncate text-gc-sm font-semibold text-foreground sm:hidden">{currentTitle}</p>
      </div>

      <div
        className="relative mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={currentIndex + 1}
        aria-label={`Adım ${currentIndex + 1} / ${total}`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const connectorDone = index < currentIndex;

          return (
            <li key={step.id} className="relative flex min-w-0 flex-1 flex-col items-center">
              {index < total - 1 && (
                <span
                  className={cn(
                    'absolute left-[calc(50%+14px)] right-[calc(-50%+14px)] top-3.5 h-0.5',
                    connectorDone ? 'bg-primary' : 'bg-border/80',
                  )}
                  aria-hidden
                />
              )}

              <span
                className={cn(
                  'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  done && 'bg-primary text-primary-foreground',
                  active &&
                    'bg-primary text-primary-foreground ring-2 ring-primary/25 ring-offset-2 ring-offset-background',
                  !done && !active && 'border border-border/80 bg-background text-muted-foreground',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : index + 1}
              </span>

              <span
                className={cn(
                  'mt-2 hidden w-full px-0.5 text-center text-[10px] font-medium leading-tight sm:line-clamp-2 sm:block md:text-gc-xs',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
                title={step.title}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
