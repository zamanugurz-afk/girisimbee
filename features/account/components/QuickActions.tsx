import Link from 'next/link';
import { ACCOUNT_QUICK_ACTIONS } from '@/features/account/types/account-panel.constants';

export function QuickActions() {
  return (
    <section aria-label="Hızlı erişim">
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
        Hızlı erişim
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ACCOUNT_QUICK_ACTIONS.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="block rounded-xl border border-border/80 p-5 transition-colors hover:border-primary/25 hover:bg-muted/40 dark:border-white/10 dark:hover:bg-white/[0.03]"
          >
            <p className="font-medium text-foreground">{action.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
