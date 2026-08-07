import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { isEmptyDisplayValue } from '@/features/listings/utils/display-value';

interface DetailCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function DetailCard({ children, className, padding = 'md' }: DetailCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300',
        'hover:border-primary/20 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/90',
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  description?: string;
}

export function DetailSection({ title, children, className, description }: DetailSectionProps) {
  return (
    <section className={cn(className)}>
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface FactRowProps {
  label: string;
  value: string;
  href?: string;
}

export function FactRow({ label, value, href }: FactRowProps) {
  if (isEmptyDisplayValue(value)) return null;

  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {href && !isEmptyDisplayValue(href) ? (
        <a
          href={href.startsWith('http') ? href : `https://${href}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  );
}

export function FactGrid({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-border/80 dark:divide-white/10">{children}</div>
  );
}

export function DetailSectionIf({
  title,
  visible,
  children,
  className,
  description,
}: {
  title: string;
  visible: boolean;
  children: ReactNode;
  className?: string;
  description?: string;
}) {
  if (!visible) return null;
  return (
    <DetailSection title={title} className={className} description={description}>
      {children}
    </DetailSection>
  );
}
