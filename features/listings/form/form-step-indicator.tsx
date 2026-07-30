'use client';

import { cn } from '@/lib/utils';

interface FormStepIndicatorProps {
  steps: { id: string; title: string }[];
  currentIndex: number;
  className?: string;
}

export function FormStepIndicator({ steps, currentIndex, className }: FormStepIndicatorProps) {
  return (
    <nav aria-label="Form adımları" className={cn('mb-8', className)}>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li key={step.id} className="flex items-center sm:flex-1">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    done && 'bg-primary text-primary-foreground',
                    active && 'bg-primary text-primary-foreground ring-2 ring-primary/25 ring-offset-2 ring-offset-background',
                    !done && !active && 'bg-muted text-muted-foreground',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? '✓' : index + 1}
                </span>
                <span
                  className={cn(
                    'text-gc-sm font-medium',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="mx-3 hidden h-px flex-1 bg-border/80 sm:block"
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
