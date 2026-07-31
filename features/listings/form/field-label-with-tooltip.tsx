'use client';

import { HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FieldLabelWithTooltipProps {
  htmlFor?: string;
  label: React.ReactNode;
  required?: boolean;
  tooltip?: string;
  className?: string;
}

export function FieldLabelWithTooltip({
  htmlFor,
  label,
  required,
  tooltip,
  className,
}: FieldLabelWithTooltipProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {tooltip && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Alan hakkında bilgi"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

interface StageOptionTooltipProps {
  stage: string;
  tooltip: string;
}

export function StageOptionTooltip({ stage, tooltip }: StageOptionTooltipProps) {
  return (
    <span className="flex w-full items-center justify-between gap-2">
      <span>{stage}</span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 text-muted-foreground"
              aria-label={`${stage} hakkında bilgi`}
              onClick={(e) => e.stopPropagation()}
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs text-xs leading-relaxed">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}
