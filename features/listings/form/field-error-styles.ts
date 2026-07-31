import { cn } from '@/lib/utils';

/** Applies a red border to form controls when validation fails. */
export function formControlErrorClass(error?: string, className?: string) {
  return cn(error && 'border-destructive focus-visible:ring-destructive', className);
}
