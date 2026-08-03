import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminEmptyState({
  title = 'Kayıt bulunamadı',
  description = 'Bu bölümde henüz gösterilecek veri yok. Modül yakında geliştirilecek.',
  icon: Icon = Inbox,
  className,
  action,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.02]',
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 font-display text-base font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
