import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tagVariants = cva(
  'inline-flex items-center font-medium transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        muted: 'bg-muted text-muted-foreground',
        outline: 'border border-border/80 bg-transparent text-foreground',
        category: 'bg-transparent',
      },
      size: {
        sm: 'rounded-md px-2 py-0.5 text-[11px]',
        md: 'rounded-lg px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
);

export interface GcTagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  color?: string;
}

export function GcTag({ className, variant, size, color, style, children, ...props }: GcTagProps) {
  const categoryStyle =
    variant === 'category' && color
      ? { backgroundColor: `${color}14`, color, ...style }
      : style;

  return (
    <span className={cn(tagVariants({ variant, size }), className)} style={categoryStyle} {...props}>
      {children}
    </span>
  );
}

export { tagVariants };
