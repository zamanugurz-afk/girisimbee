import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AccountShowcaseCardData } from '@/features/account/types/account-showcase.types';
import {
  ACCOUNT_SHOWCASE_PACKAGE_LABELS,
  ACCOUNT_SHOWCASE_STATUS_LABELS,
} from '@/features/account/types/account-showcase.constants';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function statusVariant(
  status: AccountShowcaseCardData['status'],
): 'default' | 'secondary' | 'outline' {
  if (status === 'active') return 'default';
  if (status === 'expiring') return 'secondary';
  return 'outline';
}

export function AccountShowcaseCard({
  item,
  busy = false,
  onExtend,
  onCancel,
}: {
  item: AccountShowcaseCardData;
  busy?: boolean;
  onExtend?: () => void;
  onCancel?: () => void;
}) {
  const canExtend = true;
  const canCancel = item.status === 'active' || item.status === 'expiring';

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="font-semibold text-xs rounded-md">
            {ACCOUNT_SHOWCASE_PACKAGE_LABELS[item.packageType]}
          </Badge>
          <Badge variant={statusVariant(item.status)} className="font-semibold text-xs rounded-md">
            {ACCOUNT_SHOWCASE_STATUS_LABELS[item.status]}
          </Badge>
        </div>

        <h3 className="font-display text-base font-bold tracking-tight text-slate-950 dark:text-white line-clamp-2">
          <Link href={item.listingHref} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            {item.listingTitle}
          </Link>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800 pt-2.5">
          <div>
            <span className="text-slate-400 dark:text-zinc-500">Kalan Süre:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.remainingLabel}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500">Bitiş Tarihi:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(item.endsAt)}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500">Görüntüleme:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">{item.viewCount}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500">Favori:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">{item.favoriteCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
        <Button asChild type="button" size="sm" variant="outline" className="h-8.5 flex-1 rounded-xl text-xs font-semibold">
          <Link href={item.listingHref}>İlana Git</Link>
        </Button>
        {canExtend ? (
          <Button
            type="button"
            size="sm"
            className="h-8.5 rounded-xl text-xs font-semibold shadow-2xs"
            disabled={busy}
            onClick={onExtend}
          >
            Süreyi Uzat
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8.5 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={busy}
            onClick={onCancel}
          >
            İptal
          </Button>
        ) : null}
      </div>
    </article>
  );
}
