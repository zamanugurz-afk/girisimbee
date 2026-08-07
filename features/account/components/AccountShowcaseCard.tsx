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
    <article className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {item.listingTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {ACCOUNT_SHOWCASE_PACKAGE_LABELS[item.packageType]}
              </Badge>
              <Badge variant={statusVariant(item.status)}>
                {ACCOUNT_SHOWCASE_STATUS_LABELS[item.status]}
              </Badge>
            </div>
          </div>

          <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="shrink-0">Başlangıç:</dt>
              <dd className="text-foreground">{formatDate(item.startsAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Bitiş:</dt>
              <dd className="text-foreground">{formatDate(item.endsAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Kalan süre:</dt>
              <dd className="text-foreground">{item.remainingLabel}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Görüntülenme:</dt>
              <dd className="tabular-nums text-foreground">{item.viewCount}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Favori:</dt>
              <dd className="tabular-nums text-foreground">{item.favoriteCount}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Tıklanma:</dt>
              <dd className="tabular-nums text-foreground">{item.clickCount}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
          <Button asChild type="button" size="sm" variant="outline" className="rounded-lg">
            <Link href={item.listingHref}>İlana git</Link>
          </Button>
          {canExtend ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              disabled={busy}
              onClick={onExtend}
            >
              Süreyi uzat
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg text-destructive hover:text-destructive"
              disabled={busy}
              onClick={onCancel}
            >
              İptal et
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
