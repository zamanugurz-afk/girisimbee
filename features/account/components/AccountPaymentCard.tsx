import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AccountPaymentCardData } from '@/features/account/types/account-payments.types';
import {
  ACCOUNT_PAYMENT_PACKAGE_TYPE_LABELS,
  ACCOUNT_PAYMENT_STATUS_LABELS,
} from '@/features/account/types/account-payments.constants';
import { formatTryAmount } from '@/features/account/services/account-payments-mock.service';

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function statusVariant(
  status: AccountPaymentCardData['status'],
): 'default' | 'secondary' | 'outline' {
  if (status === 'completed') return 'default';
  if (status === 'pending') return 'secondary';
  return 'outline';
}

export function AccountPaymentCard({ item }: { item: AccountPaymentCardData }) {
  return (
    <article className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {item.packageName}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {ACCOUNT_PAYMENT_PACKAGE_TYPE_LABELS[item.packageType]}
              </Badge>
              <Badge variant={statusVariant(item.status)}>
                {ACCOUNT_PAYMENT_STATUS_LABELS[item.status]}
              </Badge>
            </div>
          </div>

          <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="shrink-0">İşlem no:</dt>
              <dd className="font-mono text-foreground">{item.transactionNumber}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Ödeme tarihi:</dt>
              <dd className="text-foreground">{formatDateTime(item.paidAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Tutar:</dt>
              <dd className="tabular-nums text-foreground">
                {formatTryAmount(item.amountTry)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Fatura no:</dt>
              <dd className="font-mono text-foreground">
                {item.invoiceNumber ?? '—'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
          {item.listingId ? (
            <Button asChild type="button" size="sm" variant="outline" className="rounded-lg">
              <Link href={`/ilan/${item.listingId}`}>İlana git</Link>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled
            title="Fatura detayı yakında"
          >
            Detayları görüntüle
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled
            title="Fatura indirme yakında"
          >
            Faturayı indir
          </Button>
          <Button asChild type="button" size="sm" variant="outline" className="rounded-lg">
            <Link href="/destek">Desteğe ulaş</Link>
          </Button>
          {item.status === 'pending' ? (
            <Button asChild type="button" size="sm" className="rounded-lg">
              <Link href="/dashboard/paketlerim">Paketlerime git</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
