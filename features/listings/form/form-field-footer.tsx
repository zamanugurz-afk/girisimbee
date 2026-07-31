import { cn } from '@/lib/utils';

interface FormFieldFooterProps {
  helperText?: string;
  error?: string;
  currentLength?: number;
  maxLength?: number;
  className?: string;
}

export function FormFieldFooter({
  helperText,
  error,
  currentLength,
  maxLength,
  className,
}: FormFieldFooterProps) {
  const showCounter = maxLength !== undefined && currentLength !== undefined;

  if (!helperText && !error && !showCounter) return null;

  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
      {showCounter && (
        <p
          className={cn(
            'shrink-0 text-xs tabular-nums text-muted-foreground',
            currentLength > maxLength && 'text-destructive',
          )}
          aria-live="polite"
        >
          {currentLength.toLocaleString('tr-TR')}/{maxLength.toLocaleString('tr-TR')}
        </p>
      )}
    </div>
  );
}
