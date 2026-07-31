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
        'rounded-[24px] border border-border/80 bg-white gc-shadow-soft',
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
}

export function DetailSection({ title, children, className }: DetailSectionProps) {
  return (
    <section className={cn(className)}>
      <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
        {title}
      </h2>
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
          className="text-sm font-medium text-[#2563EB] hover:underline"
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

/** Renders a section only when it has visible child content. */
export function DetailSectionIf({
  title,
  visible,
  children,
  className,
}: {
  title: string;
  visible: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!visible) return null;
  return (
    <DetailSection title={title} className={className}>
      {children}
    </DetailSection>
  );
}
