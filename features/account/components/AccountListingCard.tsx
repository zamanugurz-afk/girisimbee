import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AccountListingCardData } from '@/features/account/types/account-listings.types';
import { ACCOUNT_LISTING_STATUS_LABELS } from '@/features/account/types/account-listings.constants';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function statusBadgeVariant(
  status: AccountListingCardData['status'],
): 'default' | 'secondary' | 'outline' {
  if (status === 'active') return 'default';
  if (status === 'expired') return 'secondary';
  return 'outline';
}

export function AccountListingCard({ listing }: { listing: AccountListingCardData }) {
  return (
    <article className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {listing.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{listing.category}</Badge>
              <Badge variant={statusBadgeVariant(listing.status)}>
                {ACCOUNT_LISTING_STATUS_LABELS[listing.status]}
              </Badge>
              {listing.isShowcase ? <Badge variant="outline">Vitrin</Badge> : null}
              {listing.isUrgentShowcase ? (
                <Badge variant="outline">Acil vitrin</Badge>
              ) : null}
            </div>
          </div>

          <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="shrink-0">Yayın:</dt>
              <dd className="text-foreground">{formatDate(listing.publishedAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Bitiş:</dt>
              <dd className="text-foreground">{formatDate(listing.endsAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Görüntülenme:</dt>
              <dd className="tabular-nums text-foreground">{listing.viewCount}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">Favori:</dt>
              <dd className="tabular-nums text-foreground">{listing.favoriteCount}</dd>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <dt className="shrink-0">Vitrin durumu:</dt>
              <dd className="text-foreground">
                {listing.isShowcase ? 'Aktif' : 'Yok'}
                {' · '}
                Acil vitrin: {listing.isUrgentShowcase ? 'Aktif' : 'Yok'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
          <Button type="button" size="sm" variant="outline" className="rounded-lg">
            Düzenle
          </Button>
          <Button type="button" size="sm" variant="outline" className="rounded-lg">
            İstatistikler
          </Button>
          <Button type="button" size="sm" variant="outline" className="rounded-lg">
            Vitrine taşı
          </Button>
          <Button type="button" size="sm" variant="outline" className="rounded-lg">
            Acil vitrine taşı
          </Button>
          <Button type="button" size="sm" variant="outline" className="rounded-lg">
            Yayından kaldır
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg text-destructive hover:text-destructive"
          >
            Sil
          </Button>
        </div>
      </div>
    </article>
  );
}
